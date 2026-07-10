"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Script from "next/script"
import { joinWaitlist, WaitlistResult } from "@lib/actions/waitlist"

type Phase = "idle" | "submitting" | "success" | "error"

const COOLDOWN_MS = 60_000

declare global {
  interface Window {
    turnstile?: {
      render: (container: HTMLElement, options: Record<string, unknown>) => string
      reset: (widgetId?: string) => void
      remove: (widgetId?: string) => void
    }
  }
}

type WaitlistFormProps = {
  variantId: string
  submitAction?: (data: {
    email: string
    variant_id: string
    marketing_consent: boolean
    turnstile_token: string
  }) => Promise<WaitlistResult>
}

export default function WaitlistForm({
  variantId,
  submitAction = joinWaitlist,
}: WaitlistFormProps) {
  const [email, setEmail] = useState("")
  const [consent, setConsent] = useState(false)
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)
  const [phase, setPhase] = useState<Phase>("idle")
  const [message, setMessage] = useState<string | null>(null)
  const [scriptLoaded, setScriptLoaded] = useState(false)

  const containerRef = useRef<HTMLDivElement>(null)
  const widgetIdRef = useRef<string | undefined>(undefined)
  // Refs (not state) so the double-submit guard is synchronous — a second
  // click dispatched before React re-renders the disabled button still sees
  // the up-to-date value.
  const submittingRef = useRef(false)
  const cooldownUntilRef = useRef(0)

  useEffect(() => {
    // Runs on mount too, not just when `scriptLoaded` flips true — if
    // `window.turnstile` already exists (e.g. stubbed in tests, or a cached
    // script on a client-side nav) there's no `load` event left to wait for.
    if (widgetIdRef.current || !containerRef.current || !window.turnstile) return
    const sitekey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY
    if (!sitekey) return

    // Idempotency insurance: guarantees no orphaned widget/iframe survives
    // into this render, regardless of the remount path (dev Fast Refresh in
    // particular doesn't always line up cleanly with our own ref bookkeeping).
    containerRef.current.innerHTML = ""

    widgetIdRef.current = window.turnstile.render(containerRef.current, {
      sitekey,
      theme: "dark",
      callback: (token: string) => setTurnstileToken(token),
      "expired-callback": () => setTurnstileToken(null),
    })

    return () => {
      // Reset the ref too, not just remove the widget — StrictMode's dev-only
      // mount/cleanup/mount double-invoke would otherwise leave a stale id
      // behind, the guard above would skip re-rendering, and the token that
      // eventually arrives would belong to an already-removed widget
      // (Cloudflare siteverify then rejects it with invalid-input-response).
      window.turnstile?.remove(widgetIdRef.current)
      widgetIdRef.current = undefined
    }
  }, [scriptLoaded])

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      if (submittingRef.current || Date.now() < cooldownUntilRef.current) return
      if (!email.trim() || !turnstileToken) return

      submittingRef.current = true
      setPhase("submitting")
      setMessage(null)

      const result = await submitAction({
        email: email.trim(),
        variant_id: variantId,
        marketing_consent: consent,
        turnstile_token: turnstileToken,
      })

      submittingRef.current = false

      if (result.status === 200) {
        cooldownUntilRef.current = Date.now() + COOLDOWN_MS
        setPhase("success")
        setMessage(result.message)
      } else {
        setPhase("error")
        setMessage(result.message)
        window.turnstile?.reset(widgetIdRef.current)
        setTurnstileToken(null)
      }
    },
    [email, consent, turnstileToken, variantId, submitAction]
  )

  if (phase === "success") {
    return (
      <div
        className="p-5 bg-[#ccff00]/10 border-2 border-[#ccff00]/40 rounded-xl text-[#ccff00] flex items-center gap-x-3"
        data-testid="waitlist-success"
      >
        <div className="w-8 h-8 rounded-full bg-[#ccff00]/20 flex items-center justify-center shrink-0">
          <svg
            className="w-4 h-4 text-[#ccff00]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <p className="text-sm font-medium">You&apos;re on the list — check your inbox.</p>
      </div>
    )
  }

  const submitDisabled = phase === "submitting" || !email.trim() || !turnstileToken

  return (
    <>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js"
        strategy="lazyOnload"
        onLoad={() => setScriptLoaded(true)}
      />
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-y-4 p-5 rounded-xl border-2 border-[#ccff00]/50 bg-gradient-to-b from-[#ccff00]/[0.07] to-gray-900/70 shadow-[0_0_24px_rgba(204,255,0,0.08)]"
        data-testid="waitlist-form"
      >
        <div>
          <p className="text-lg font-extrabold text-[#ccff00] leading-tight">
            Get 10% off your next order
          </p>
          <p className="text-sm text-gray-300 mt-1">
            Drop your email — we&apos;ll send your code the moment this is back in stock.
          </p>
        </div>

        <div>
          <label htmlFor="waitlist-email" className="sr-only">
            Email address
          </label>
          <input
            id="waitlist-email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full px-4 py-2.5 bg-black/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:border-[#ccff00] focus:ring-1 focus:ring-[#ccff00] transition-colors"
            data-testid="waitlist-email-input"
          />
        </div>

        <label className="flex items-start gap-x-2 text-xs text-gray-400 cursor-pointer">
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            className="mt-0.5 accent-[#ccff00]"
            data-testid="waitlist-consent-checkbox"
          />
          Also send me occasional product updates
        </label>

        <div
          ref={containerRef}
          className="min-h-[65px] overflow-hidden max-w-full"
          data-testid="turnstile-container"
        />

        {phase === "error" && message && (
          <div
            className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-xs"
            role="alert"
            data-testid="waitlist-error"
          >
            {message}
          </div>
        )}

        <button
          type="submit"
          disabled={submitDisabled}
          className="w-full py-3 bg-[#ccff00] text-black font-bold text-base rounded-lg hover:bg-[#b8e600] transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ccff00] focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900"
          data-testid="waitlist-submit-button"
        >
          {phase === "submitting" ? "Submitting..." : "Notify me"}
        </button>
      </form>
    </>
  )
}
