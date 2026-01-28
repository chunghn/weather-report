# Architecture Codemap

**Last Updated:** 2026-01-29
**Entry Point:** `src/index.ts`
**Runtime:** Bun (TypeScript)

## Overview

A lightweight Telegram bot that sends daily weather reports in Traditional Chinese (繁體中文). The bot runs as a scheduled cron job on a VPS with minimal resource usage.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    Entry Point                          │
│                  src/index.ts                           │
│  • Loads config from environment                        │
│  • Sets up cron scheduler                               │
│  • Orchestrates weather fetch → format → send          │
└──────────────────┬──────────────────────────────────────┘
                   │
        ┌──────────┴──────────┐
        │                     │
┌───────▼────────┐   ┌────────▼──────────┐
│  Config Loader │   │   Cron Scheduler  │
│  src/config.ts │   │   (node-cron)     │
└───────┬────────┘   └───────────────────┘
        │
        │ Config
        │
┌───────▼──────────────────────────────────────────────┐
│              Weather Report Flow                      │
│                                                       │
│  1. fetchWeatherWithRetry()                          │
│     └─> Open-Meteo API                               │
│                                                       │
│  2. formatWeatherMessage()                           │
│     └─> Traditional Chinese formatting               │
│                                                       │
│  3. broadcastMessage()                               │
│     └─> Telegram Bot API                             │
└───────────────────────────────────────────────────────┘
```

## Module Dependencies

```
index.ts
├── config.ts (loadConfig)
├── weather.ts (fetchWeatherWithRetry)
├── formatter.ts (formatWeatherMessage, formatErrorMessage)
├── telegram.ts (broadcastMessage)
└── types.ts (Config, WeatherData, WeatherResult, etc.)
```

## Data Flow

1. **Startup**: `index.ts` → `loadConfig()` → Validates environment variables
2. **Scheduling**: `index.ts` → `cron.schedule()` → Sets up daily job
3. **Execution** (when cron fires):
   - `fetchWeatherWithRetry()` → Calls Open-Meteo API
   - `formatWeatherMessage()` → Converts weather data to 繁體中文 message
   - `broadcastMessage()` → Sends to multiple Telegram chat IDs

## External Dependencies

- **node-cron** (^3.0.3) - Cron scheduler
- **Open-Meteo API** - Free weather data (no API key required)
- **Telegram Bot API** - Message delivery

## Key Design Patterns

- **Separation of Concerns**: Each module has a single responsibility
- **Error Handling**: Retry logic with exponential backoff
- **Type Safety**: Full TypeScript with strict types
- **Configuration**: Environment-based config with validation

## Related Areas

- [Backend Structure](./backend.md) - API clients and services
- [Data Models](./data.md) - TypeScript interfaces
