import { describe, it, expect, mock } from "bun:test"
import { sendMessage, sendMessageWithRetry, broadcastMessage } from "./telegram"

describe("sendMessage", () => {
  it("returns success when Telegram API returns ok", async () => {
    const fetchMock = mock((url: string, init?: RequestInit) => {
      expect(url).toContain("api.telegram.org")
      expect(url).toContain("test-token")
      const body = JSON.parse(init?.body as string)
      expect(body.chat_id).toBe("123")
      expect(body.text).toBe("Hello")
      return Promise.resolve(
        new Response(JSON.stringify({ ok: true }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      )
    })
    const originalFetch = globalThis.fetch
    globalThis.fetch = fetchMock as typeof fetch

    const result = await sendMessage("test-token", "123", "Hello")

    globalThis.fetch = originalFetch

    expect(result.success).toBe(true)
    expect(result.error).toBeUndefined()
  })

  it("returns error when Telegram API returns not ok", async () => {
    const fetchMock = mock(() =>
      Promise.resolve(
        new Response(
          JSON.stringify({
            ok: false,
            description: "Bad Request: chat not found",
          }),
          {
            status: 200,
            headers: { "Content-Type": "application/json" },
          },
        ),
      ),
    )
    const originalFetch = globalThis.fetch
    globalThis.fetch = fetchMock as typeof fetch

    const result = await sendMessage("token", "999", "Hi")

    globalThis.fetch = originalFetch

    expect(result.success).toBe(false)
    expect(result.error).toContain("chat not found")
  })

  it("returns error when fetch throws", async () => {
    const fetchMock = mock(() => Promise.reject(new Error("Network failure")))
    const originalFetch = globalThis.fetch
    globalThis.fetch = fetchMock as typeof fetch

    const result = await sendMessage("token", "123", "Hi")

    globalThis.fetch = originalFetch

    expect(result.success).toBe(false)
    expect(result.error).toContain("Network failure")
  })

  it("returns Unknown Telegram error when API returns ok: false with no description", async () => {
    const fetchMock = mock(() =>
      Promise.resolve(
        new Response(JSON.stringify({ ok: false }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      ),
    )
    const originalFetch = globalThis.fetch
    globalThis.fetch = fetchMock as typeof fetch

    const result = await sendMessage("token", "123", "Hi")

    globalThis.fetch = originalFetch

    expect(result.success).toBe(false)
    expect(result.error).toBe("Unknown Telegram error")
  })
})

describe("sendMessageWithRetry", () => {
  it("returns success on first successful send", async () => {
    const fetchMock = mock(() =>
      Promise.resolve(
        new Response(JSON.stringify({ ok: true }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      ),
    )
    const originalFetch = globalThis.fetch
    globalThis.fetch = fetchMock as typeof fetch

    const result = await sendMessageWithRetry("token", "123", "Hi", 3)

    globalThis.fetch = originalFetch

    expect(result.success).toBe(true)
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it("returns error after maxRetries failed attempts", async () => {
    const fetchMock = mock(() =>
      Promise.resolve(
        new Response(JSON.stringify({ ok: false, description: "Error" }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      ),
    )
    const originalFetch = globalThis.fetch
    globalThis.fetch = fetchMock as typeof fetch

    const result = await sendMessageWithRetry("token", "123", "Hi", 2)

    globalThis.fetch = originalFetch

    expect(result.success).toBe(false)
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })
})

describe("broadcastMessage", () => {
  it("returns successful and failed lists based on send results", async () => {
    const fetchMock = mock((_url: string, init?: RequestInit) => {
      const body = init?.body ? JSON.parse(init.body as string) : {}
      const ok = body.chat_id === "chat1"
      return Promise.resolve(
        new Response(
          JSON.stringify({
            ok,
            description: ok ? undefined : "Forbidden",
          }),
          {
            status: 200,
            headers: { "Content-Type": "application/json" },
          },
        ),
      )
    })
    const originalFetch = globalThis.fetch
    globalThis.fetch = fetchMock as typeof fetch

    const result = await broadcastMessage("token", ["chat1", "chat2"], "Hello")

    globalThis.fetch = originalFetch

    expect(result.successful).toContain("chat1")
    expect(result.failed).toHaveLength(1)
    expect(result.failed[0].chatId).toBe("chat2")
    expect(result.failed[0].error).toContain("Forbidden")
  })

  it("returns all successful when all sends succeed", async () => {
    const fetchMock = mock(() =>
      Promise.resolve(
        new Response(JSON.stringify({ ok: true }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      ),
    )
    const originalFetch = globalThis.fetch
    globalThis.fetch = fetchMock as typeof fetch

    const result = await broadcastMessage("token", ["a", "b"], "Hi")

    globalThis.fetch = originalFetch

    expect(result.successful).toEqual(["a", "b"])
    expect(result.failed).toHaveLength(0)
  })
})
