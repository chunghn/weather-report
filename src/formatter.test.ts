import { describe, it, expect } from "bun:test"
import { formatWeatherMessage, formatErrorMessage } from "./formatter"
import type { WeatherData } from "./types"

const sampleWeather: WeatherData = {
  temperature: 25,
  temperatureMax: 28,
  temperatureMin: 22,
  humidity: 75,
  uvIndex: 5,
  weatherCode: 1,
  condition: "大致晴朗",
}

describe("formatWeatherMessage", () => {
  it("includes location name", () => {
    const msg = formatWeatherMessage(sampleWeather, "香港")
    expect(msg).toContain("香港")
  })

  it("includes temperature range", () => {
    const msg = formatWeatherMessage(sampleWeather, "Test")
    expect(msg).toContain("22")
    expect(msg).toContain("28")
  })

  it("includes humidity", () => {
    const msg = formatWeatherMessage(sampleWeather, "Test")
    expect(msg).toContain("75%")
  })

  it("includes UV index and level", () => {
    const msg = formatWeatherMessage(sampleWeather, "Test")
    expect(msg).toContain("5")
    expect(msg).toContain("中等")
  })

  it("includes weather condition", () => {
    const msg = formatWeatherMessage(sampleWeather, "Test")
    expect(msg).toContain("大致晴朗")
  })

  it("includes advice section", () => {
    const msg = formatWeatherMessage(sampleWeather, "Test")
    expect(msg).toContain("小提醒")
    expect(msg).toContain("•")
  })

  it("includes default positive advice when no specific conditions", () => {
    const mild: WeatherData = {
      ...sampleWeather,
      uvIndex: 1,
      weatherCode: 0,
      temperatureMin: 18,
      temperatureMax: 24,
      humidity: 60,
    }
    const msg = formatWeatherMessage(mild, "Test")
    expect(msg).toContain("美好嘅一日")
  })

  it("includes rain advice when weather code indicates rain", () => {
    const rainy: WeatherData = {
      ...sampleWeather,
      weatherCode: 61,
      condition: "小雨",
    }
    const msg = formatWeatherMessage(rainy, "Test")
    expect(msg).toContain("雨")
    expect(msg).toContain("遮")
  })

  it("includes UV advice when uvIndex >= 6", () => {
    const highUV: WeatherData = {
      ...sampleWeather,
      uvIndex: 8,
    }
    const msg = formatWeatherMessage(highUV, "Test")
    expect(msg).toContain("紫外線")
  })

  it("includes cold advice when temperatureMin <= 15", () => {
    const cold: WeatherData = {
      ...sampleWeather,
      temperatureMin: 12,
      temperatureMax: 18,
    }
    const msg = formatWeatherMessage(cold, "Test")
    expect(msg).toContain("涼")
  })

  it("includes heat advice when temperatureMax >= 32", () => {
    const hot: WeatherData = {
      ...sampleWeather,
      temperatureMax: 34,
      temperatureMin: 26,
    }
    const msg = formatWeatherMessage(hot, "Test")
    expect(msg).toContain("熱")
  })

  it("uses snow emoji for weather code 68-77", () => {
    const snow: WeatherData = {
      ...sampleWeather,
      weatherCode: 71,
      condition: "小雪",
    }
    const msg = formatWeatherMessage(snow, "Test")
    expect(msg).toContain("❄️")
  })

  it("uses shower emoji for weather code 78-82", () => {
    const shower: WeatherData = {
      ...sampleWeather,
      weatherCode: 80,
      condition: "陣雨",
    }
    const msg = formatWeatherMessage(shower, "Test")
    expect(msg).toContain("🌦️")
  })

  it("uses thunderstorm emoji for weather code 83+", () => {
    const thunder: WeatherData = {
      ...sampleWeather,
      weatherCode: 95,
      condition: "雷暴",
    }
    const msg = formatWeatherMessage(thunder, "Test")
    expect(msg).toContain("⛈️")
  })

  it("shows 極高 UV level when uvIndex > 10", () => {
    const extremeUV: WeatherData = {
      ...sampleWeather,
      uvIndex: 11,
    }
    const msg = formatWeatherMessage(extremeUV, "Test")
    expect(msg).toContain("極高")
    expect(msg).toContain("11")
  })

  it("includes shower advice when weather code 80-82", () => {
    const shower: WeatherData = {
      ...sampleWeather,
      weatherCode: 80,
      condition: "陣雨",
    }
    const msg = formatWeatherMessage(shower, "Test")
    expect(msg).toContain("陣雨")
    expect(msg).toContain("雨傘")
  })
})

describe("formatErrorMessage", () => {
  it("includes location name", () => {
    const msg = formatErrorMessage("台北", "API error")
    expect(msg).toContain("台北")
  })

  it("includes error reason", () => {
    const msg = formatErrorMessage("Test", "Network timeout")
    expect(msg).toContain("Network timeout")
  })

  it("starts with greeting", () => {
    const msg = formatErrorMessage("Test", "err")
    expect(msg).toContain("早安")
  })

  it("ends with positive wish", () => {
    const msg = formatErrorMessage("Test", "err")
    expect(msg).toContain("美好嘅一日")
  })
})
