import { describe, it, expect, mock } from "bun:test"
import {
  getWeatherCondition,
  fetchWeather,
  fetchWeatherWithRetry,
} from "./weather"
import type { OpenMeteoResponse } from "./types"

describe("getWeatherCondition", () => {
  it("returns 晴天 for code 0", () => {
    expect(getWeatherCondition(0)).toBe("晴天")
  })

  it("returns 多雲 for code 3", () => {
    expect(getWeatherCondition(3)).toBe("多雲")
  })

  it("returns 小雨 for code 61", () => {
    expect(getWeatherCondition(61)).toBe("小雨")
  })

  it("returns 雷暴 for code 95", () => {
    expect(getWeatherCondition(95)).toBe("雷暴")
  })

  it("returns 未知天氣 for unknown code", () => {
    expect(getWeatherCondition(999)).toBe("未知天氣")
  })
})

describe("fetchWeather", () => {
  const mockResponse: OpenMeteoResponse = {
    current: {
      temperature_2m: 25.5,
      relative_humidity_2m: 80,
      weather_code: 1,
    },
    daily: {
      temperature_2m_max: [28],
      temperature_2m_min: [22],
      uv_index_max: [5],
    },
  }

  it("returns weather data on successful API response", async () => {
    const fetchMock = mock((url: string) => {
      expect(url).toContain("api.open-meteo.com")
      expect(url).toContain("latitude=22.3")
      expect(url).toContain("longitude=114.2")
      return Promise.resolve(
        new Response(JSON.stringify(mockResponse), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      )
    })
    const originalFetch = globalThis.fetch
    globalThis.fetch = fetchMock as typeof fetch

    const result = await fetchWeather(22.3, 114.2)

    globalThis.fetch = originalFetch

    expect(result.success).toBe(true)
    expect(result.data).toBeDefined()
    expect(result.data!.temperature).toBe(26)
    expect(result.data!.temperatureMax).toBe(28)
    expect(result.data!.temperatureMin).toBe(22)
    expect(result.data!.humidity).toBe(80)
    expect(result.data!.uvIndex).toBe(5)
    expect(result.data!.weatherCode).toBe(1)
    expect(result.data!.condition).toBe("大致晴朗")
  })

  it("returns error when API returns non-OK status", async () => {
    const fetchMock = mock(() =>
      Promise.resolve(new Response("Server Error", { status: 500 })),
    )
    const originalFetch = globalThis.fetch
    globalThis.fetch = fetchMock as typeof fetch

    const result = await fetchWeather(0, 0)

    globalThis.fetch = originalFetch

    expect(result.success).toBe(false)
    expect(result.error).toContain("500")
  })

  it("returns error when fetch throws", async () => {
    const fetchMock = mock(() => Promise.reject(new Error("Network error")))
    const originalFetch = globalThis.fetch
    globalThis.fetch = fetchMock as typeof fetch

    const result = await fetchWeather(0, 0)

    globalThis.fetch = originalFetch

    expect(result.success).toBe(false)
    expect(result.error).toContain("Network error")
  })
})

describe("fetchWeatherWithRetry", () => {
  it("returns success on first successful fetch", async () => {
    const mockResponse: OpenMeteoResponse = {
      current: {
        temperature_2m: 20,
        relative_humidity_2m: 70,
        weather_code: 0,
      },
      daily: {
        temperature_2m_max: [24],
        temperature_2m_min: [18],
        uv_index_max: [3],
      },
    }
    const fetchMock = mock(() =>
      Promise.resolve(
        new Response(JSON.stringify(mockResponse), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      ),
    )
    const originalFetch = globalThis.fetch
    globalThis.fetch = fetchMock as typeof fetch

    const result = await fetchWeatherWithRetry(22, 114, 3)

    globalThis.fetch = originalFetch

    expect(result.success).toBe(true)
    expect(result.data).toBeDefined()
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it("returns error after all retries fail", async () => {
    const fetchMock = mock(() =>
      Promise.resolve(new Response("Error", { status: 500 })),
    )
    const originalFetch = globalThis.fetch
    globalThis.fetch = fetchMock as typeof fetch

    const result = await fetchWeatherWithRetry(0, 0, 2)

    globalThis.fetch = originalFetch

    expect(result.success).toBe(false)
    expect(result.error).toBeDefined()
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })
})
