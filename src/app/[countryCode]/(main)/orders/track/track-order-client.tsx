"use client"

import { useState } from "react"
import { sdk } from "@lib/config"

type LookupResult = {
  found: boolean
  status?: string
  fulfillment_status?: string
  tracking_numbers?: string[]
  tracking_links?: { tracking_number: string; url?: string }[]
  created_at?: string
}

type UIState = "idle" | "loading" | "found" | "not-found" | "link-sent"

export default function TrackOrderClient({ countryCode }: { countryCode: string }) {
  const [email, setEmail] = useState("")
  const [displayId, setDisplayId] = useState("")
  const [result, setResult] = useState<LookupResult | null>(null)
  const [state, setState] = useState<UIState>("idle")
  const [linkCooldown, setLinkCooldown] = useState(0)

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault()
    setState("loading")
    try {
      const data = await sdk.client.fetch<LookupResult>("/store/orders/lookup", {
        method: "POST",
        body: { email, display_id: displayId },
      })
      setResult(data)
      setState(data.found ? "found" : "not-found")
    } catch {
      setState("not-found")
    }
  }

  const handleSendLink = async () => {
    if (linkCooldown > 0) return
    try {
      await sdk.client.fetch("/store/orders/lookup/send-link", {
        method: "POST",
        body: { email, display_id: displayId },
      })
    } catch {
      // ignore — always respond same
    }
    setState("link-sent")
    setLinkCooldown(60)
    const tick = setInterval(() => {
      setLinkCooldown((c) => {
        if (c <= 1) { clearInterval(tick); return 0 }
        return c - 1
      })
    }, 1000)
  }

  return (
    <div className="py-8 px-4 max-w-sm mx-auto">
      <p className="text-[#b8ff2b] text-xs font-bold uppercase tracking-widest mb-4">
        ONYX GENETICS
      </p>
      <h1 className="text-white text-2xl font-bold mb-2">Track your order</h1>
      <p className="text-gray-400 text-sm mb-6">
        Enter your email and order number to check the status.
      </p>

      <form onSubmit={handleLookup} className="flex flex-col gap-3 mb-6">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email address"
          className="w-full bg-[#0d0d0d] border border-gray-700 rounded-lg px-4 py-3 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-[#b8ff2b]"
        />
        <input
          type="text"
          required
          value={displayId}
          onChange={(e) => setDisplayId(e.target.value)}
          placeholder="Order number (e.g. 1234 or ONX-1234)"
          className="w-full bg-[#0d0d0d] border border-gray-700 rounded-lg px-4 py-3 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-[#b8ff2b]"
        />
        <button
          type="submit"
          disabled={state === "loading"}
          className="w-full bg-[#b8ff2b] text-black font-bold py-3 rounded-lg text-sm uppercase tracking-wider disabled:opacity-50 hover:opacity-90 transition-opacity"
        >
          {state === "loading" ? "Looking up…" : "Find order"}
        </button>
      </form>

      {state === "not-found" && (
        <div className="bg-[#1a0700] border border-orange-800/30 rounded-xl p-4 text-center">
          <p className="text-orange-400 text-sm font-semibold mb-1">Order not found</p>
          <p className="text-gray-400 text-xs">
            Check that the email and order number match exactly.
          </p>
        </div>
      )}

      {(state === "found" || state === "link-sent") && result && (
        <div className="flex flex-col gap-3">
          <div className="bg-[#111111] border border-gray-800 rounded-xl p-4">
            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">
              Order status
            </p>
            <p className="text-white text-sm font-semibold capitalize">
              {result.status?.replace(/_/g, " ")}
            </p>
            {result.tracking_links && result.tracking_links.length > 0 && (
              <div className="mt-2">
                <p className="text-gray-500 text-xs mb-1">Tracking</p>
                {result.tracking_links.map((t, i) => (
                  <p key={i} className="text-white font-mono text-xs">
                    {t.url ? (
                      <a
                        href={t.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline hover:text-[#b8ff2b] transition-colors"
                      >
                        {t.tracking_number} →
                      </a>
                    ) : (
                      t.tracking_number
                    )}
                  </p>
                ))}
              </div>
            )}
          </div>

          {state === "link-sent" ? (
            <div className="text-center">
              <p className="text-[#b8ff2b] text-sm font-semibold">
                Order link sent — check your inbox.
              </p>
              {linkCooldown > 0 && (
                <p className="text-gray-500 text-xs mt-1">Resend in {linkCooldown}s</p>
              )}
            </div>
          ) : (
            <button
              onClick={handleSendLink}
              disabled={linkCooldown > 0}
              className="w-full bg-[#1f1f1f] border border-gray-700 text-gray-300 font-semibold py-3 rounded-lg text-sm hover:bg-[#2a2a2a] transition-colors disabled:opacity-40"
            >
              Send order link to email
            </button>
          )}
        </div>
      )}

      <div className="mt-6 text-center">
        <a
          href={`/${countryCode}/account`}
          className="text-gray-500 text-xs hover:text-gray-300 transition-colors"
        >
          Have an account? Sign in →
        </a>
      </div>
    </div>
  )
}
