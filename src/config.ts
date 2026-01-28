import type { Config } from "./types"

/**
 * Load and validate configuration from environment variables
 */
export function loadConfig(): Config {
  const botToken = process.env.TELEGRAM_BOT_TOKEN
  const chatIdsRaw = process.env.TELEGRAM_CHAT_IDS
  const locationName = process.env.LOCATION_NAME
  const latRaw = process.env.LOCATION_LAT
  const lonRaw = process.env.LOCATION_LON
  const hourRaw = process.env.SCHEDULE_HOUR
  const minuteRaw = process.env.SCHEDULE_MINUTE
  const timezone = process.env.TIMEZONE

  // Validate required fields
  if (!botToken) {
    throw new Error("Missing TELEGRAM_BOT_TOKEN")
  }
  if (!chatIdsRaw) {
    throw new Error("Missing TELEGRAM_CHAT_IDS")
  }
  if (!locationName) {
    throw new Error("Missing LOCATION_NAME")
  }
  if (!latRaw || !lonRaw) {
    throw new Error("Missing LOCATION_LAT or LOCATION_LON")
  }

  const latitude = parseFloat(latRaw)
  const longitude = parseFloat(lonRaw)

  if (isNaN(latitude) || isNaN(longitude)) {
    throw new Error("Invalid LOCATION_LAT or LOCATION_LON - must be numbers")
  }

  if (latitude < -90 || latitude > 90) {
    throw new Error("LOCATION_LAT must be between -90 and 90")
  }

  if (longitude < -180 || longitude > 180) {
    throw new Error("LOCATION_LON must be between -180 and 180")
  }

  const chatIds = chatIdsRaw
    .split(",")
    .map((id) => id.trim())
    .filter((id) => id.length > 0)

  if (chatIds.length === 0) {
    throw new Error("TELEGRAM_CHAT_IDS must contain at least one chat ID")
  }

  const hour = hourRaw ? parseInt(hourRaw, 10) : 6
  const minute = minuteRaw ? parseInt(minuteRaw, 10) : 45

  if (isNaN(hour) || hour < 0 || hour > 23) {
    throw new Error("SCHEDULE_HOUR must be between 0 and 23")
  }

  if (isNaN(minute) || minute < 0 || minute > 59) {
    throw new Error("SCHEDULE_MINUTE must be between 0 and 59")
  }

  return {
    telegram: {
      botToken,
      chatIds,
    },
    location: {
      name: locationName,
      latitude,
      longitude,
    },
    schedule: {
      hour,
      minute,
      timezone: timezone || "Asia/Hong_Kong",
    },
  }
}
