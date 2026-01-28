import type { TelegramResponse } from "./types"

const TELEGRAM_API_BASE = "https://api.telegram.org"

/**
 * Send a message to a Telegram chat
 */
export async function sendMessage(
  botToken: string,
  chatId: string,
  message: string,
): Promise<{ success: boolean; error?: string }> {
  const url = `${TELEGRAM_API_BASE}/bot${botToken}/sendMessage`

  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10s timeout

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: "HTML",
      }),
      signal: controller.signal,
    })
    clearTimeout(timeoutId)

    const data = (await response.json()) as TelegramResponse

    if (!data.ok) {
      return {
        success: false,
        error: data.description || "Unknown Telegram error",
      }
    }

    return { success: true }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "Unknown error"
    return {
      success: false,
      error: `Failed to send Telegram message: ${errorMsg}`,
    }
  }
}

/**
 * Send a message with retry logic
 */
export async function sendMessageWithRetry(
  botToken: string,
  chatId: string,
  message: string,
  maxRetries: number = 3,
): Promise<{ success: boolean; error?: string }> {
  let lastError: string | undefined

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const result = await sendMessage(botToken, chatId, message)

    if (result.success) {
      return result
    }

    lastError = result.error
    console.log(
      `Telegram send attempt ${attempt}/${maxRetries} to ${chatId} failed: ${lastError}`,
    )

    if (attempt < maxRetries) {
      // Exponential backoff: 1s, 2s, 4s
      const delay = Math.pow(2, attempt - 1) * 1000
      await new Promise((resolve) => setTimeout(resolve, delay))
    }
  }

  return {
    success: false,
    error: lastError || "Failed to send message after retries",
  }
}

/**
 * Send a message to multiple chat IDs
 */
export async function broadcastMessage(
  botToken: string,
  chatIds: string[],
  message: string,
): Promise<{
  successful: string[]
  failed: { chatId: string; error: string }[]
}> {
  const results = {
    successful: [] as string[],
    failed: [] as { chatId: string; error: string }[],
  }

  for (const chatId of chatIds) {
    const result = await sendMessageWithRetry(botToken, chatId, message)

    if (result.success) {
      results.successful.push(chatId)
      console.log(`✓ Message sent to ${chatId}`)
    } else {
      results.failed.push({ chatId, error: result.error || "Unknown error" })
      console.error(`✗ Failed to send to ${chatId}: ${result.error}`)
    }

    // Small delay between sends to avoid rate limiting
    if (chatIds.indexOf(chatId) < chatIds.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 100))
    }
  }

  return results
}
