# Deploy Weather Report Bot to VPS

Step-by-step guide to run the bot on a small VPS (Ubuntu/Debian).

## Process manager: systemd vs PM2

|                    | systemd                          | PM2                                                        |
| ------------------ | -------------------------------- | ---------------------------------------------------------- |
| **Already on VPS** | Yes (built into Linux)           | No – install with `npm install -g pm2` or `bun add -g pm2` |
| **Memory**         | One process (just your bot)      | Two (PM2 daemon + your bot)                                |
| **Familiarity**    | Any Linux admin knows it         | Very familiar to Node/Bun devs                             |
| **Commands**       | `systemctl start/restart/status` | `pm2 start/restart/status`, `pm2 logs`                     |
| **Logs**           | `journalctl -u weather-bot -f`   | `pm2 logs` (built-in, no sudo)                             |
| **Config**         | Write a `.service` file          | `pm2 start ...` or `ecosystem.config.js`                   |

**Why the guide uses systemd:** No extra install, works on any VPS, slightly lighter. For a tiny bot both are fine.

**Why you might prefer PM2:** Same workflow as on your Mac (`pm2 start`), nicer log UX, no service file to edit. If you like PM2, use the [PM2 section](#alternative-pm2) below.

## Prerequisites

- A VPS with SSH access (Ubuntu 22.04 or Debian 12 recommended)
- Your repo published on GitHub

---

## 1. SSH into your VPS

```bash
ssh your-user@your-vps-ip
```

---

## 2. Install Bun

```bash
# Install Bun (one-liner from official install script)
curl -fsSL https://bun.sh/install | bash

# Reload shell so `bun` is in PATH
source ~/.bashrc   # or source ~/.zshrc

# Verify
bun --version
```

---

## 3. Clone the repo and install dependencies

```bash
# Clone (use your GitHub repo URL)
git clone https://github.com/chunghn9/weather-report.git
cd weather-report

# Install dependencies
bun install
```

---

## 4. Configure environment

```bash
# Copy example config
cp .env.example .env

# Edit with your values (use nano, vim, or paste from local)
nano .env
```

Set at least:

- `TELEGRAM_BOT_TOKEN` – from @BotFather
- `TELEGRAM_CHAT_IDS` – your chat ID and your girlfriend’s (comma-separated)
- `LOCATION_NAME` – e.g. `香港`
- `LOCATION_LAT` / `LOCATION_LON` – e.g. `22.3193` / `114.1694`
- `SCHEDULE_HOUR` / `SCHEDULE_MINUTE` – e.g. `6` / `45`
- `TIMEZONE` – e.g. `Asia/Hong_Kong`

Save and exit (`Ctrl+O`, `Enter`, `Ctrl+X` in nano).

---

## 5. Test run

```bash
# Send one message immediately to verify
SEND_ON_STARTUP=true bun run src/index.ts
```

Check Telegram for the message. If it works, stop with `Ctrl+C`.

---

## 6. Run with systemd (recommended)

This keeps the bot running after you disconnect and restarts it if it crashes or after reboot.

### Create the service file

```bash
sudo nano /etc/systemd/system/weather-bot.service
```

Paste (adjust `User`, `WorkingDirectory`, and `ExecStart` if needed):

```ini
[Unit]
Description=Weather Report Telegram Bot
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
User=YOUR_VPS_USERNAME
WorkingDirectory=/home/YOUR_VPS_USERNAME/weather-report
ExecStart=/home/YOUR_VPS_USERNAME/.bun/bin/bun run src/index.ts
Restart=always
RestartSec=10
EnvironmentFile=/home/YOUR_VPS_USERNAME/weather-report/.env

[Install]
WantedBy=multi-user.target
```

Replace:

- `YOUR_VPS_USERNAME` with your actual Linux username (run `whoami` to see it).
- If `bun` is elsewhere, run `which bun` and use that path in `ExecStart`, e.g.:
  `ExecStart=/home/YOUR_VPS_USERNAME/.bun/bin/bun run src/index.ts`

Save and exit.

### Enable and start

```bash
# Reload systemd to see the new service
sudo systemctl daemon-reload

# Enable start on boot
sudo systemctl enable weather-bot

# Start now
sudo systemctl start weather-bot

# Check status
sudo systemctl status weather-bot
```

You should see `active (running)`.

### Useful commands

| Command                                | Description                         |
| -------------------------------------- | ----------------------------------- |
| `sudo systemctl status weather-bot`    | Check if it’s running               |
| `sudo systemctl stop weather-bot`      | Stop the bot                        |
| `sudo systemctl start weather-bot`     | Start the bot                       |
| `sudo systemctl restart weather-bot`   | Restart (e.g. after editing `.env`) |
| `sudo journalctl -u weather-bot -f`    | Follow logs (Ctrl+C to exit)        |
| `sudo journalctl -u weather-bot -n 50` | Last 50 log lines                   |

---

## 7. Alternative: PM2

If you prefer PM2 (same workflow as local Node/Bun, no service file):

### Install PM2

```bash
# Global install with Bun
bun add -g pm2

# Or with npm if you use Node
# npm install -g pm2
```

### Start the bot

```bash
cd ~/weather-report

# PM2 runs from repo root; .env is loaded by your app when it starts
pm2 start "bun run src/index.ts" --name weather-bot
```

### Survive reboot

```bash
# Generate startup script (systemd/upstart depending on OS)
pm2 startup

# Run the command it prints (e.g. sudo env PATH=... pm2 startup systemd -u your-user --hp /home/your-user)
# Then save the process list so it restarts on boot
pm2 save
```

### Useful PM2 commands

| Command                   | Description     |
| ------------------------- | --------------- |
| `pm2 status`              | List processes  |
| `pm2 logs weather-bot`    | Follow logs     |
| `pm2 restart weather-bot` | Restart         |
| `pm2 stop weather-bot`    | Stop            |
| `pm2 delete weather-bot`  | Remove from PM2 |

### Optional: ecosystem file

For a fixed config (e.g. cwd and env), create `ecosystem.config.cjs` in the repo root:

```javascript
// ecosystem.config.cjs
module.exports = {
  apps: [
    {
      name: "weather-bot",
      script: "bun",
      args: "run src/index.ts",
      cwd: "/home/YOUR_VPS_USERNAME/weather-report",
      env_file: ".env",
      autorestart: true,
      watch: false,
    },
  ],
}
```

Then: `pm2 start ecosystem.config.cjs`

---

## 8. Updating after code changes

From your **local machine**, push changes to GitHub. Then on the VPS:

```bash
cd ~/weather-report
git pull
bun install
sudo systemctl restart weather-bot
```

**If using PM2:**

```bash
cd ~/weather-report
git pull
bun install
pm2 restart weather-bot
```

---

## 10. Optional: run as a dedicated user

For better isolation, you can run the bot as a separate user:

```bash
# Create user (no login shell)
sudo useradd -r -s /bin/false weatherbot

# Clone repo to a place you choose, e.g. /opt
sudo git clone https://github.com/chunghn9/weather-report.git /opt/weather-report
cd /opt/weather-report
sudo bun install   # or install bun for root, or use node

# Config: copy .env into /opt/weather-report and set permissions
sudo nano /opt/weather-report/.env
sudo chown -R weatherbot:weatherbot /opt/weather-report
```

Then in the systemd unit use `User=weatherbot`, `WorkingDirectory=/opt/weather-report`, and the same `ExecStart`/`EnvironmentFile` paths. For PM2, run `pm2 start` as that user from `/opt/weather-report`.

---

## Troubleshooting

### Bot doesn’t start

- Run manually: `cd ~/weather-report && bun run src/index.ts` and read the error.
- Check `.env`: no quotes around values, no trailing spaces.
- Check logs: `sudo journalctl -u weather-bot -n 100 --no-pager`.

### No Telegram message

- Confirm bot token and chat IDs (message @userinfobot for your chat ID).
- Confirm the bot was started in a chat (send it `/start` once).
- Check logs: `sudo journalctl -u weather-bot -f` around the scheduled time.

### Wrong time / timezone

- Set `TIMEZONE=Asia/Hong_Kong` (or your timezone) in `.env`.
- On the server: `timedatectl` to see server timezone; the bot uses `TIMEZONE` for the schedule.

### “bun: command not found” in systemd

- Use full path in `ExecStart`. Run `which bun` as the same user that runs the service and put that path in the unit file.
