import cron from "node-cron"
import { loadConfig } from "./config"
import { fetchWeatherWithRetry } from "./weather"
import { formatWeatherMessage, formatErrorMessage } from "./formatter"
import { broadcastMessage } from "./telegram"
import type { Config } from "./types"

/**
 * Main function to fetch weather and send messages
 */
async function sendWeatherReport(config: Config): Promise<void> {
  const { telegram, location } = config

  console.log(`\n📍 Fetching weather for ${location.name}...`)

  const weatherResult = await fetchWeatherWithRetry(
    location.latitude,
    location.longitude,
  )

  let message: string

  if (weatherResult.success && weatherResult.data) {
    console.log("✓ Weather data fetched successfully")
    message = formatWeatherMessage(weatherResult.data, location.name)
  } else {
    console.error(`✗ Weather fetch failed: ${weatherResult.error}`)
    message = formatErrorMessage(
      location.name,
      weatherResult.error || "Unknown error",
    )
  }

  console.log("\n📤 Sending messages...")
  const result = await broadcastMessage(
    telegram.botToken,
    telegram.chatIds,
    message,
  )

  console.log(
    `\n📊 Results: ${result.successful.length} sent, ${result.failed.length} failed`,
  )

  if (result.failed.length > 0) {
    console.error("Failed sends:", result.failed)
  }
}

/**
 * Format cron schedule string
 */
function getCronSchedule(hour: number, minute: number): string {
  return `${minute} ${hour} * * *`
}

/**
 * Main entry point
 */
async function main(): Promise<void> {
  console.log("🌈 Weather Report Bot Starting...\n")

  // Load and validate configuration
  let config: Config
  try {
    config = loadConfig()
    console.log("✓ Configuration loaded")
    console.log(`  📍 Location: ${config.location.name}`)
    console.log(`  👥 Recipients: ${config.telegram.chatIds.length} chat(s)`)
    console.log(
      `  ⏰ Schedule: ${config.schedule.hour}:${config.schedule.minute.toString().padStart(2, "0")} ${config.schedule.timezone}`,
    )
  } catch (error) {
    console.error(
      "✗ Configuration error:",
      error instanceof Error ? error.message : error,
    )
    process.exit(1)
  }

  const cronSchedule = getCronSchedule(
    config.schedule.hour,
    config.schedule.minute,
  )

  // Validate cron expression
  if (!cron.validate(cronSchedule)) {
    console.error(`✗ Invalid cron schedule: ${cronSchedule}`)
    process.exit(1)
  }

  console.log(`\n⏰ Scheduling daily report at cron: ${cronSchedule}`)

  // Schedule the job
  cron.schedule(
    cronSchedule,
    async () => {
      const now = new Date().toLocaleString("zh-TW", {
        timeZone: config.schedule.timezone,
      })
      console.log(`\n🕐 [${now}] Running scheduled weather report...`)
      await sendWeatherReport(config)
    },
    {
      timezone: config.schedule.timezone,
    },
  )

  console.log("\n✓ Bot is running! Press Ctrl+C to stop.\n")

  // Send a test message on startup (optional - for verification)
  if (process.env.SEND_ON_STARTUP === "true") {
    console.log("📤 Sending startup test message...")
    await sendWeatherReport(config)
  }

  // Keep the process alive
  process.on("SIGINT", () => {
    console.log("\n\n👋 Shutting down gracefully...")
    process.exit(0)
  })

  process.on("SIGTERM", () => {
    console.log("\n\n👋 Received SIGTERM, shutting down...")
    process.exit(0)
  })
}

// Run the bot
main().catch((error) => {
  console.error("Fatal error:", error)
  process.exit(1)
})
