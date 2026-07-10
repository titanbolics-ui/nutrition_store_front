import { test, afterEach, beforeEach, mock } from "node:test"
import assert from "node:assert/strict"
import * as React from "react"
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react"
import WaitlistForm from "./index.tsx"
import type { WaitlistResult } from "@lib/actions/waitlist.ts"

const TEST_TOKEN = "test-turnstile-token"

beforeEach(() => {
  process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY = "test-sitekey"
  // Stub the Cloudflare widget: rendering "solves" it immediately so the
  // form's submit button is enabled without depending on the real script.
  ;(globalThis as any).window.turnstile = {
    render: (_el: HTMLElement, options: { callback: (token: string) => void }) => {
      options.callback(TEST_TOKEN)
      return "widget-1"
    },
    reset: mock.fn(),
    remove: mock.fn(),
  }
})

afterEach(() => {
  cleanup()
  delete (globalThis as any).window.turnstile
})

test("consent checkbox is unchecked on initial render", () => {
  render(<WaitlistForm variantId="variant_1" submitAction={async () => ({ status: 200, message: "ok" })} />)
  const checkbox = screen.getByTestId("waitlist-consent-checkbox") as HTMLInputElement
  assert.equal(checkbox.checked, false)
})

test("rapid double submit calls submitAction exactly once", async () => {
  const submitAction = mock.fn(async (): Promise<WaitlistResult> => ({ status: 200, message: "ok" }))
  render(<WaitlistForm variantId="variant_1" submitAction={submitAction} />)

  fireEvent.change(screen.getByTestId("waitlist-email-input"), {
    target: { value: "test@example.com" },
  })

  const button = screen.getByTestId("waitlist-submit-button")
  fireEvent.click(button)
  fireEvent.click(button)

  await waitFor(() => assert.equal(submitAction.mock.callCount(), 1))
})

test("success response shows the success state", async () => {
  const submitAction = async (): Promise<WaitlistResult> => ({
    status: 200,
    message: "You're on the waitlist.",
  })
  render(<WaitlistForm variantId="variant_1" submitAction={submitAction} />)

  fireEvent.change(screen.getByTestId("waitlist-email-input"), {
    target: { value: "test@example.com" },
  })
  fireEvent.click(screen.getByTestId("waitlist-submit-button"))

  await waitFor(() => screen.getByTestId("waitlist-success"))
})

test("400 response shows the exact backend message, form stays usable", async () => {
  const submitAction = async (): Promise<WaitlistResult> => ({
    status: 400,
    message: "You already have 5 active waitlist signups.",
  })
  render(<WaitlistForm variantId="variant_1" submitAction={submitAction} />)

  fireEvent.change(screen.getByTestId("waitlist-email-input"), {
    target: { value: "test@example.com" },
  })
  fireEvent.click(screen.getByTestId("waitlist-submit-button"))

  await waitFor(() => {
    const errorEl = screen.getByTestId("waitlist-error")
    assert.equal(errorEl.textContent, "You already have 5 active waitlist signups.")
  })

  // Form is still present/usable, not replaced by a dead end.
  assert.ok(screen.getByTestId("waitlist-form"))
})

test("429 response shows the rate-limit message", async () => {
  const submitAction = async (): Promise<WaitlistResult> => ({
    status: 429,
    message: "Too many requests. Please try again later.",
  })
  render(<WaitlistForm variantId="variant_1" submitAction={submitAction} />)

  fireEvent.change(screen.getByTestId("waitlist-email-input"), {
    target: { value: "test@example.com" },
  })
  fireEvent.click(screen.getByTestId("waitlist-submit-button"))

  await waitFor(() => {
    const errorEl = screen.getByTestId("waitlist-error")
    assert.equal(errorEl.textContent, "Too many requests. Please try again later.")
  })
})

test("Turnstile container reserves space (no layout shift once the widget mounts)", () => {
  render(<WaitlistForm variantId="variant_1" submitAction={async () => ({ status: 200, message: "ok" })} />)
  const container = screen.getByTestId("turnstile-container")
  assert.ok(container.className.includes("min-h-[65px]"))
})

test("at most one Turnstile widget ever sits in the DOM, even under StrictMode's dev double-invoke", () => {
  // StrictMode's dev-only mount→cleanup→mount legitimately calls render()
  // twice — that alone is fine. What must never happen is two *live* widget
  // nodes coexisting in the container. Mock render()/remove() to actually
  // touch the DOM (unlike the shared beforeEach's no-op stub) so this is a
  // real assertion, not just a call-count check.
  let nextId = 0
  const renderMock = mock.fn(
    (el: HTMLElement, options: { callback: (token: string) => void }) => {
      const id = `widget-${nextId++}`
      const node = document.createElement("div")
      node.setAttribute("data-widget-id", id)
      el.appendChild(node)
      options.callback(TEST_TOKEN)
      return id
    }
  )
  const removeMock = mock.fn((id?: string) => {
    document.querySelector(`[data-widget-id="${id}"]`)?.remove()
  })
  ;(globalThis as any).window.turnstile.render = renderMock
  ;(globalThis as any).window.turnstile.remove = removeMock

  render(
    <React.StrictMode>
      <WaitlistForm variantId="variant_1" submitAction={async () => ({ status: 200, message: "ok" })} />
    </React.StrictMode>
  )

  const container = screen.getByTestId("turnstile-container")
  assert.equal(container.children.length, 1)
})
