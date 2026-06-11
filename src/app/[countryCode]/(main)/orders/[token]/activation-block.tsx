"use client"

import { useState } from "react"
import { requestActivation } from "@lib/data/magic-link"

export default function ActivationBlock({
  hasRegisteredAccount,
  orderViewToken,
  countryCode,
}: {
  hasRegisteredAccount: boolean
  orderViewToken: string
  countryCode: string
}) {
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [cooldown, setCooldown] = useState(0)

  const handleActivate = async () => {
    if (loading || cooldown > 0) return
    setLoading(true)
    await requestActivation(orderViewToken)
    setLoading(false)
    setSent(true)
    setCooldown(60)
    const tick = setInterval(() => {
      setCooldown((c) => {
        if (c <= 1) { clearInterval(tick); return 0 }
        return c - 1
      })
    }, 1000)
  }

  if (hasRegisteredAccount) {
    return (
      <div className="bg-[#0d1700] border border-[#b8ff2b]/20 rounded-xl p-5">
        <p className="text-[#b8ff2b] text-sm font-bold mb-1">Account detected</p>
        <p className="text-gray-400 text-sm mb-4">
          An account exists for this email. Log in to see all your orders in one place.
        </p>
        <a
          href={`/${countryCode}/account`}
          className="block w-full bg-[#b8ff2b] text-black font-bold py-3 rounded-lg text-sm uppercase tracking-wider text-center hover:opacity-90 transition-opacity"
        >
          Log in to my account
        </a>
      </div>
    )
  }

  return (
    <div className="bg-[#0d1700] border border-[#b8ff2b]/20 rounded-xl p-5">
      <p className="text-[#b8ff2b] text-sm font-bold mb-1">Track all your orders in one place</p>
      <p className="text-gray-400 text-sm mb-4">
        Activate your account — no password, one click. Every order you've placed
        will appear in your account automatically.
      </p>

      {sent ? (
        <div className="text-center">
          <p className="text-[#b8ff2b] text-sm font-semibold mb-1">
            Check your inbox for the activation link.
          </p>
          {cooldown > 0 && (
            <p className="text-gray-500 text-xs">Resend in {cooldown}s</p>
          )}
          {cooldown === 0 && (
            <button
              onClick={handleActivate}
              className="text-gray-400 text-xs underline hover:text-white mt-1"
            >
              Send again
            </button>
          )}
        </div>
      ) : (
        <button
          onClick={handleActivate}
          disabled={loading}
          className="w-full bg-[#b8ff2b] text-black font-bold py-3 rounded-lg text-sm uppercase tracking-wider disabled:opacity-50 hover:opacity-90 transition-opacity"
        >
          {loading ? "Sending…" : "Activate account →"}
        </button>
      )}
    </div>
  )
}
