import type { WeatherData } from "./types"

/**
 * Get weather emoji based on weather code
 */
function getWeatherEmoji(code: number): string {
  if (code === 0) return "☀️"
  if (code <= 3) return "🌤️"
  if (code <= 48) return "🌫️"
  if (code <= 67) return "🌧️"
  if (code <= 77) return "❄️"
  if (code <= 82) return "🌦️"
  return "⛈️"
}

/**
 * Get UV level description and emoji
 */
function getUVDescription(uvIndex: number): { emoji: string; level: string } {
  if (uvIndex <= 2) return { emoji: "🟢", level: "低" }
  if (uvIndex <= 5) return { emoji: "🟡", level: "中等" }
  if (uvIndex <= 7) return { emoji: "🟠", level: "高" }
  if (uvIndex <= 10) return { emoji: "🔴", level: "非常高" }
  return { emoji: "🟣", level: "極高" }
}

/**
 * Generate weather advice based on conditions
 */
function generateAdvice(weather: WeatherData): string[] {
  const advice: string[] = []

  // UV advice
  if (weather.uvIndex >= 6) {
    advice.push("紫外線偏高，記得搽防曬呀～ 🧴")
  } else if (weather.uvIndex >= 3) {
    advice.push("紫外線中等，出門記得戴帽或太陽眼鏡 🕶️")
  }

  // Rain advice
  if (weather.weatherCode >= 51 && weather.weatherCode <= 67) {
    advice.push("今日有雨，記得帶遮呀！ ☂️")
  } else if (weather.weatherCode >= 80 && weather.weatherCode <= 82) {
    advice.push("可能會有陣雨，帶把雨傘以防萬一 🌂")
  }

  // Temperature advice
  if (weather.temperatureMin <= 15) {
    advice.push("朝早會涼涼哋，記得著多件衫呀～ 🧥")
  } else if (weather.temperatureMax >= 32) {
    advice.push("今日好熱，記得多飲水！ 💧")
  } else if (weather.temperatureMax >= 25 && weather.temperatureMax <= 28) {
    advice.push("今日氣溫舒適，出門會好開心！ 🌈")
  }

  // Humidity advice
  if (weather.humidity >= 85) {
    advice.push("濕度好高，可能會焗焗哋 💦")
  }

  // Default positive message if no specific advice
  if (advice.length === 0) {
    advice.push("今日天氣唔錯，祝你有美好嘅一日！ ✨")
  }

  return advice
}

/**
 * Format date in Traditional Chinese
 */
function formatDate(): string {
  const now = new Date()
  const options: Intl.DateTimeFormatOptions = {
    timeZone: "Asia/Hong_Kong",
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  }

  return new Intl.DateTimeFormat("zh-TW", options).format(now)
}

/**
 * Format weather data into a cute Traditional Chinese message
 */
export function formatWeatherMessage(
  weather: WeatherData,
  locationName: string,
): string {
  const weatherEmoji = getWeatherEmoji(weather.weatherCode)
  const uv = getUVDescription(weather.uvIndex)
  const advice = generateAdvice(weather)
  const dateStr = formatDate()

  const message = `
🌈 早安呀～今日天氣報告 ${weatherEmoji}

📍 ${locationName}
📅 ${dateStr}

🌡️ 溫度：${weather.temperatureMin}°C（最低）～ ${weather.temperatureMax}°C（最高）
💧 濕度：${weather.humidity}%
${uv.emoji} 紫外線指數：${weather.uvIndex}（${uv.level}）
${weatherEmoji} 天氣：${weather.condition}

💡 小提醒：
${advice.map((a) => `• ${a}`).join("\n")}

祝你有美好嘅一日 💕
`.trim()

  return message
}

/**
 * Format error message when weather fetch fails
 */
export function formatErrorMessage(
  locationName: string,
  error: string,
): string {
  return `
🌈 早安呀～

😅 今日天氣資料暫時攞唔到...
📍 ${locationName}

錯誤原因：${error}

不過都祝你有美好嘅一日！💕
`.trim()
}
