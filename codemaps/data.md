# Data Models

**Last Updated:** 2026-01-29
**Location:** `src/types.ts`

## Type Definitions

### Config

```typescript
interface Config {
  telegram: {
    botToken: string
    chatIds: string[]
  }
  location: {
    name: string
    latitude: number
    longitude: number
  }
  schedule: {
    hour: number
    minute: number
    timezone: string
  }
}
```

**Purpose:** Application configuration loaded from environment variables

**Usage:** Passed to `sendWeatherReport()` function

---

### WeatherData

```typescript
interface WeatherData {
  temperature: number // Current temperature (°C)
  temperatureMax: number // Daily maximum (°C)
  temperatureMin: number // Daily minimum (°C)
  humidity: number // Relative humidity (%)
  uvIndex: number // UV index (0-11+)
  weatherCode: number // WMO weather code
  condition: string // 繁體中文 condition description
}
```

**Purpose:** Processed weather data ready for formatting

**Source:** Transformed from `OpenMeteoResponse`

---

### WeatherResult

```typescript
interface WeatherResult {
  success: boolean
  data?: WeatherData
  error?: string
}
```

**Purpose:** Result wrapper for weather fetch operations

**Usage:** Returned by `fetchWeather()` and `fetchWeatherWithRetry()`

---

### OpenMeteoResponse

```typescript
interface OpenMeteoResponse {
  current: {
    temperature_2m: number
    relative_humidity_2m: number
    weather_code: number
  }
  daily: {
    temperature_2m_max: number[]
    temperature_2m_min: number[]
    uv_index_max: number[]
  }
}
```

**Purpose:** Raw API response structure from Open-Meteo

**Usage:** Parsed and transformed into `WeatherData`

---

### TelegramResponse

```typescript
interface TelegramResponse {
  ok: boolean
  result?: {
    message_id: number
    chat: {
      id: number
    }
  }
  description?: string
}
```

**Purpose:** Telegram Bot API response structure

**Usage:** Parsed from `sendMessage()` API calls

---

## Data Flow

```
Environment Variables
    ↓
Config (loadConfig)
    ↓
Open-Meteo API
    ↓
OpenMeteoResponse
    ↓
WeatherData (transformed)
    ↓
Formatted Message (string)
    ↓
Telegram API
    ↓
TelegramResponse
```

## Type Exports

All types are exported from `src/types.ts`:

- `Config` - Application configuration
- `WeatherData` - Processed weather data
- `WeatherResult` - Weather fetch result wrapper
- `OpenMeteoResponse` - Open-Meteo API response
- `TelegramResponse` - Telegram API response

## Related Areas

- [Architecture Overview](./architecture.md) - How data flows through the system
- [Backend Structure](./backend.md) - API clients that use these types
