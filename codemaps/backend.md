# Backend Architecture

**Last Updated:** 2026-01-29
**Runtime:** Bun (TypeScript)
**Entry Point:** `src/index.ts`

## Structure

```
src/
├── index.ts      # Entry point, cron scheduler
├── config.ts     # Environment config loader
├── weather.ts    # Open-Meteo API client
├── formatter.ts  # Message formatting (繁體中文)
├── telegram.ts   # Telegram Bot API client
└── types.ts      # TypeScript type definitions
```

## Key Modules

| Module         | Purpose                          | Exports                                                              | Dependencies                                |
| -------------- | -------------------------------- | -------------------------------------------------------------------- | ------------------------------------------- |
| `index.ts`     | Entry point, orchestrates flow   | (none)                                                               | config, weather, formatter, telegram, types |
| `config.ts`    | Loads and validates env vars     | `loadConfig()`                                                       | types                                       |
| `weather.ts`   | Fetches weather from Open-Meteo  | `fetchWeather()`, `fetchWeatherWithRetry()`, `getWeatherCondition()` | types                                       |
| `formatter.ts` | Formats weather data to 繁體中文 | `formatWeatherMessage()`, `formatErrorMessage()`                     | types                                       |
| `telegram.ts`  | Sends messages via Telegram API  | `sendMessage()`, `sendMessageWithRetry()`, `broadcastMessage()`      | types                                       |

## API Clients

### Open-Meteo API (`weather.ts`)

**Endpoint:** `https://api.open-meteo.com/v1/forecast`

**Features:**

- Fetches current weather and daily forecast
- Retry logic with exponential backoff (3 attempts)
- 10-second timeout per request
- WMO weather code translation to 繁體中文

**Functions:**

- `fetchWeather(lat, lon)` - Single API call
- `fetchWeatherWithRetry(lat, lon, maxRetries)` - With retry logic
- `getWeatherCondition(code)` - WMO code → 繁體中文

### Telegram Bot API (`telegram.ts`)

**Endpoint:** `https://api.telegram.org/bot{token}/sendMessage`

**Features:**

- Sends messages to single or multiple chat IDs
- Retry logic with exponential backoff (3 attempts)
- 10-second timeout per request
- Rate limiting protection (100ms delay between sends)

**Functions:**

- `sendMessage(botToken, chatId, message)` - Single message
- `sendMessageWithRetry(...)` - With retry logic
- `broadcastMessage(botToken, chatIds[], message)` - Multiple recipients

## Configuration (`config.ts`)

**Environment Variables:**

- `TELEGRAM_BOT_TOKEN` - Bot token from @BotFather
- `TELEGRAM_CHAT_IDS` - Comma-separated chat IDs
- `LOCATION_NAME` - Display name (e.g., 香港)
- `LOCATION_LAT` / `LOCATION_LON` - Coordinates
- `SCHEDULE_HOUR` / `SCHEDULE_MINUTE` - 24-hour format
- `TIMEZONE` - IANA timezone (default: Asia/Hong_Kong)

**Validation:**

- Required fields checked
- Latitude: -90 to 90
- Longitude: -180 to 180
- Hour: 0-23, Minute: 0-59
- At least one chat ID required

## Scheduling (`index.ts`)

**Cron Expression:** `${minute} ${hour} * * *` (daily)

**Features:**

- Timezone-aware scheduling
- Optional startup test message (`SEND_ON_STARTUP=true`)
- Graceful shutdown handlers (SIGINT, SIGTERM)

## Error Handling

- **Weather API**: Retry with exponential backoff (1s, 2s, 4s)
- **Telegram API**: Retry with exponential backoff (1s, 2s, 4s)
- **Config**: Throws descriptive errors for missing/invalid values
- **Fallback**: Error messages formatted in 繁體中文

## Related Areas

- [Architecture Overview](./architecture.md) - Overall system design
- [Data Models](./data.md) - TypeScript interfaces
