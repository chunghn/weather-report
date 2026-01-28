# 🌈 Weather Report Bot

A lightweight Telegram bot that sends daily weather reports in **Traditional Chinese (繁體中文)** with a cute, casual tone. Runs on a small VPS with minimal resource usage.

## Features

- **Scheduled reports** – Sends at a configurable time (e.g. 6:45 HK time)
- **Configurable location** – Any city via latitude/longitude
- **Weather details** – Condition, temperature, humidity, UV index
- **Cute 繁體中文 messages** – Personalized tips and emojis
- **Multiple recipients** – Send to you and your girlfriend (or anyone)
- **Lightweight** – Bun + TypeScript, low memory footprint

## Tech Stack

- **Runtime**: [Bun](https://bun.sh/)
- **Weather API**: [Open-Meteo](https://open-meteo.com/) (free, no API key)
- **Messaging**: Telegram Bot API
- **Scheduler**: node-cron

## Prerequisites

- [Bun](https://bun.sh/) (or Node.js 18+)
- A Telegram bot token from [@BotFather](https://t.me/BotFather)
- Chat ID(s) from [@userinfobot](https://t.me/userinfobot)

## Quick Start

### 1. Clone and install

```bash
git clone https://github.com/chunghn9/weather-report.git
cd weather-report
bun install
```

### 2. Configure

```bash
cp .env.example .env
```

Edit `.env` with your values:

| Variable                            | Description                                 |
| ----------------------------------- | ------------------------------------------- |
| `TELEGRAM_BOT_TOKEN`                | Bot token from @BotFather                   |
| `TELEGRAM_CHAT_IDS`                 | Comma-separated chat IDs (you + girlfriend) |
| `LOCATION_NAME`                     | Display name (e.g. 香港)                    |
| `LOCATION_LAT` / `LOCATION_LON`     | Coordinates                                 |
| `SCHEDULE_HOUR` / `SCHEDULE_MINUTE` | 24-hour format (e.g. 6, 45)                 |
| `TIMEZONE`                          | e.g. Asia/Hong_Kong                         |

### 3. Run

```bash
bun start
```

The bot will schedule daily reports. To send a test message immediately:

```bash
SEND_ON_STARTUP=true bun start
```

## Scripts

| Command             | Description                            |
| ------------------- | -------------------------------------- |
| `bun start`         | Start the bot (scheduled daily report) |
| `bun run dev`       | Start with watch mode                  |
| `bun run typecheck` | Run TypeScript check                   |
| `bun test`          | Run tests                              |
| `bun test:watch`    | Run tests in watch mode                |
| `bun test:coverage` | Run tests with coverage report         |

## Project Structure

```
src/
├── index.ts      # Entry point, cron scheduler
├── config.ts     # Environment config loader
├── weather.ts    # Open-Meteo API client
├── formatter.ts  # 繁體中文 message builder
├── telegram.ts   # Telegram sender
└── types.ts      # TypeScript types
```

## Architecture Documentation

For detailed architecture documentation, see [codemaps/](./codemaps/INDEX.md):

- [Architecture Overview](./codemaps/architecture.md) - System design and data flow
- [Backend Structure](./codemaps/backend.md) - API clients and configuration
- [Data Models](./codemaps/data.md) - TypeScript interfaces

## Deployment (VPS)

**→ Full step-by-step guide: [DEPLOY.md](./DEPLOY.md)**

Summary:

1. Install Bun on your VPS.
2. Clone the repo and set up `.env`.
3. Run with systemd so it restarts on reboot and survives disconnects.

Example systemd unit (save as `/etc/systemd/system/weather-bot.service`):

```ini
[Unit]
Description=Weather Report Telegram Bot
After=network.target

[Service]
Type=simple
User=your-user
WorkingDirectory=/path/to/weather-report
ExecStart=/path/to/bun run src/index.ts
Restart=always
RestartSec=10
EnvironmentFile=/path/to/weather-report/.env

[Install]
WantedBy=multi-user.target
```

Then:

```bash
sudo systemctl enable weather-bot
sudo systemctl start weather-bot
```

## Security

- **Never commit `.env`** – It’s in `.gitignore`. Use `.env.example` as a template.
- Bot token and chat IDs are loaded from environment variables only.

## License

MIT
