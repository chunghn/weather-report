import { describe, it, expect, beforeEach, afterEach } from "bun:test"
import { loadConfig } from "./config"

const requiredEnv = {
  TELEGRAM_BOT_TOKEN: "test-token",
  TELEGRAM_CHAT_IDS: "123,456",
  LOCATION_NAME: "香港",
  LOCATION_LAT: "22.3193",
  LOCATION_LON: "114.1694",
}

function setEnv(env: Record<string, string>) {
  for (const [k, v] of Object.entries(env)) {
    process.env[k] = v
  }
}

function unsetEnv(keys: string[]) {
  for (const k of keys) {
    delete process.env[k]
  }
}

describe("loadConfig", () => {
  beforeEach(() => {
    setEnv(requiredEnv)
  })

  afterEach(() => {
    unsetEnv([
      "TELEGRAM_BOT_TOKEN",
      "TELEGRAM_CHAT_IDS",
      "LOCATION_NAME",
      "LOCATION_LAT",
      "LOCATION_LON",
      "SCHEDULE_HOUR",
      "SCHEDULE_MINUTE",
      "TIMEZONE",
    ])
  })

  it("returns config when all required env vars are set", () => {
    const config = loadConfig()
    expect(config.telegram.botToken).toBe("test-token")
    expect(config.telegram.chatIds).toEqual(["123", "456"])
    expect(config.location.name).toBe("香港")
    expect(config.location.latitude).toBe(22.3193)
    expect(config.location.longitude).toBe(114.1694)
    expect(config.schedule.hour).toBe(6)
    expect(config.schedule.minute).toBe(45)
    expect(config.schedule.timezone).toBe("Asia/Hong_Kong")
  })

  it("throws when TELEGRAM_BOT_TOKEN is missing", () => {
    delete process.env.TELEGRAM_BOT_TOKEN
    expect(() => loadConfig()).toThrow("Missing TELEGRAM_BOT_TOKEN")
  })

  it("throws when TELEGRAM_CHAT_IDS is missing", () => {
    delete process.env.TELEGRAM_CHAT_IDS
    expect(() => loadConfig()).toThrow("Missing TELEGRAM_CHAT_IDS")
  })

  it("throws when LOCATION_NAME is missing", () => {
    delete process.env.LOCATION_NAME
    expect(() => loadConfig()).toThrow("Missing LOCATION_NAME")
  })

  it("throws when LOCATION_LAT is missing", () => {
    delete process.env.LOCATION_LAT
    expect(() => loadConfig()).toThrow("Missing LOCATION_LAT or LOCATION_LON")
  })

  it("throws when LOCATION_LON is missing", () => {
    delete process.env.LOCATION_LON
    expect(() => loadConfig()).toThrow("Missing LOCATION_LAT or LOCATION_LON")
  })

  it("throws when LOCATION_LAT is not a number", () => {
    process.env.LOCATION_LAT = "not-a-number"
    expect(() => loadConfig()).toThrow(
      "Invalid LOCATION_LAT or LOCATION_LON - must be numbers",
    )
  })

  it("throws when LOCATION_LAT is out of range", () => {
    process.env.LOCATION_LAT = "91"
    expect(() => loadConfig()).toThrow(
      "LOCATION_LAT must be between -90 and 90",
    )
  })

  it("throws when LOCATION_LON is out of range", () => {
    process.env.LOCATION_LON = "181"
    expect(() => loadConfig()).toThrow(
      "LOCATION_LON must be between -180 and 180",
    )
  })

  it("throws when TELEGRAM_CHAT_IDS is empty after trim", () => {
    process.env.TELEGRAM_CHAT_IDS = "  ,  , "
    expect(() => loadConfig()).toThrow(
      "TELEGRAM_CHAT_IDS must contain at least one chat ID",
    )
  })

  it("uses SCHEDULE_HOUR and SCHEDULE_MINUTE when set", () => {
    process.env.SCHEDULE_HOUR = "8"
    process.env.SCHEDULE_MINUTE = "30"
    const config = loadConfig()
    expect(config.schedule.hour).toBe(8)
    expect(config.schedule.minute).toBe(30)
  })

  it("throws when SCHEDULE_HOUR is invalid", () => {
    process.env.SCHEDULE_HOUR = "24"
    expect(() => loadConfig()).toThrow("SCHEDULE_HOUR must be between 0 and 23")
  })

  it("throws when SCHEDULE_MINUTE is invalid", () => {
    process.env.SCHEDULE_MINUTE = "60"
    expect(() => loadConfig()).toThrow(
      "SCHEDULE_MINUTE must be between 0 and 59",
    )
  })

  it("uses TIMEZONE when set", () => {
    process.env.TIMEZONE = "Asia/Taipei"
    const config = loadConfig()
    expect(config.schedule.timezone).toBe("Asia/Taipei")
  })
})
