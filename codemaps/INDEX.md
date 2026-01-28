# Codemaps Index

**Last Updated:** 2026-01-29

## Overview

This directory contains architectural documentation generated from the codebase structure. Each codemap focuses on a specific area of the system.

## Available Codemaps

| Codemap                           | Description                                | Last Updated |
| --------------------------------- | ------------------------------------------ | ------------ |
| [Architecture](./architecture.md) | Overall system architecture and data flow  | 2026-01-29   |
| [Backend](./backend.md)           | API clients, configuration, and scheduling | 2026-01-29   |
| [Data](./data.md)                 | TypeScript interfaces and data models      | 2026-01-29   |

## Project Structure

```
weather-report/
├── src/
│   ├── index.ts      # Entry point
│   ├── config.ts     # Configuration loader
│   ├── weather.ts    # Weather API client
│   ├── formatter.ts  # Message formatter
│   ├── telegram.ts   # Telegram API client
│   └── types.ts      # Type definitions
├── codemaps/         # Architecture documentation
└── docs/             # Guides and documentation
```

## Quick Reference

- **Entry Point**: `src/index.ts`
- **Runtime**: Bun (TypeScript)
- **External APIs**: Open-Meteo (weather), Telegram Bot API
- **Scheduler**: node-cron

## Related Documentation

- [README.md](../README.md) - Project overview and setup
- [DEPLOY.md](../DEPLOY.md) - Deployment guide
