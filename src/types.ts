/**
 * Configuration types for the weather bot
 */
export interface Config {
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

/**
 * Weather data from Open-Meteo API
 */
export interface WeatherData {
  temperature: number
  temperatureMax: number
  temperatureMin: number
  humidity: number
  uvIndex: number
  weatherCode: number
  condition: string
}

/**
 * Result wrapper for weather fetch operations
 */
export interface WeatherResult {
  success: boolean
  data?: WeatherData
  error?: string
}

/**
 * Open-Meteo API response structure
 */
export interface OpenMeteoResponse {
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

/**
 * Telegram sendMessage response
 */
export interface TelegramResponse {
  ok: boolean
  result?: {
    message_id: number
    chat: {
      id: number
    }
  }
  description?: string
}
