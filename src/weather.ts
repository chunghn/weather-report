import type { WeatherResult, OpenMeteoResponse } from "./types"

/**
 * WMO Weather interpretation codes
 * https://open-meteo.com/en/docs
 */
const WEATHER_CODES: Record<number, string> = {
  0: "晴天",
  1: "大致晴朗",
  2: "局部多雲",
  3: "多雲",
  45: "有霧",
  48: "霧凇",
  51: "微雨",
  53: "小雨",
  55: "中雨",
  56: "凍雨",
  57: "凍雨",
  61: "小雨",
  63: "中雨",
  65: "大雨",
  66: "凍雨",
  67: "凍雨",
  71: "小雪",
  73: "中雪",
  75: "大雪",
  77: "雪粒",
  80: "陣雨",
  81: "陣雨",
  82: "大陣雨",
  85: "小陣雪",
  86: "大陣雪",
  95: "雷暴",
  96: "雷暴夾雹",
  99: "雷暴夾大雹",
}

/**
 * Get weather condition description from WMO code
 */
export function getWeatherCondition(code: number): string {
  return WEATHER_CODES[code] || "未知天氣"
}

/**
 * Fetch weather data from Open-Meteo API
 */
export async function fetchWeather(
  latitude: number,
  longitude: number,
): Promise<WeatherResult> {
  const url = new URL("https://api.open-meteo.com/v1/forecast")
  url.searchParams.set("latitude", latitude.toString())
  url.searchParams.set("longitude", longitude.toString())
  url.searchParams.set(
    "current",
    "temperature_2m,relative_humidity_2m,weather_code",
  )
  url.searchParams.set(
    "daily",
    "temperature_2m_max,temperature_2m_min,uv_index_max",
  )
  url.searchParams.set("timezone", "Asia/Hong_Kong")
  url.searchParams.set("forecast_days", "1")

  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10s timeout

    const response = await fetch(url.toString(), {
      signal: controller.signal,
    })
    clearTimeout(timeoutId)

    if (!response.ok) {
      return {
        success: false,
        error: `Weather API returned ${response.status}: ${response.statusText}`,
      }
    }

    const data = (await response.json()) as OpenMeteoResponse

    return {
      success: true,
      data: {
        temperature: Math.round(data.current.temperature_2m),
        temperatureMax: Math.round(data.daily.temperature_2m_max[0]),
        temperatureMin: Math.round(data.daily.temperature_2m_min[0]),
        humidity: Math.round(data.current.relative_humidity_2m),
        uvIndex: Math.round(data.daily.uv_index_max[0]),
        weatherCode: data.current.weather_code,
        condition: getWeatherCondition(data.current.weather_code),
      },
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error"
    return {
      success: false,
      error: `Failed to fetch weather: ${message}`,
    }
  }
}

/**
 * Fetch weather with retry logic
 */
export async function fetchWeatherWithRetry(
  latitude: number,
  longitude: number,
  maxRetries: number = 3,
): Promise<WeatherResult> {
  let lastError: string | undefined

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const result = await fetchWeather(latitude, longitude)

    if (result.success) {
      return result
    }

    lastError = result.error
    console.log(
      `Weather fetch attempt ${attempt}/${maxRetries} failed: ${lastError}`,
    )

    if (attempt < maxRetries) {
      // Exponential backoff: 1s, 2s, 4s
      const delay = Math.pow(2, attempt - 1) * 1000
      await new Promise((resolve) => setTimeout(resolve, delay))
    }
  }

  return {
    success: false,
    error: lastError || "Failed to fetch weather after retries",
  }
}
