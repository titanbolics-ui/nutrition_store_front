"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { confirmActivation } from "@lib/data/magic-link"

type State = "loading" | "success" | "error" | "no-token"

export default function ActivateClient({
  token,
  countryCode,
}: {
  token?: string
  countryCode: string
}) {
  const router = useRouter()
  const [state, setState] = useState<State>(token ? "loading" : "no-token")
  const [error, setError] = useState("")
  // useRef guard prevents double-activation in React Strict Mode
  const activated = useRef(false)

  useEffect(() => {
    if (!token) return
    if (activated.current) return
    activated.current = true

    // POST happens only on client mount — never during SSR
    void confirmActivation(token).then((result) => {
      if (result.ok) {
        setState("success")
        router.push(`/${countryCode}/account`)
      } else {
        setState("error")
        setError(result.error ?? "Invalid or expired activation link.")
      }
    })
  }, [token, countryCode, router])

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="max-w-sm w-full bg-[#111111] border border-gray-800 rounded-xl p-8 text-center">
        <p className="text-[#b8ff2b] text-xs font-bold uppercase tracking-widest mb-4">
          ONYX GENETICS
        </p>

        {state === "loading" && (
          <>
            <div className="w-8 h-8 border-2 border-[#b8ff2b] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-white font-semibold text-lg">Activating your account…</p>
            <p className="text-gray-400 text-sm mt-2">Your orders are being linked.</p>
          </>
        )}

        {state === "success" && (
          <>
            <div className="text-[#b8ff2b] text-4xl mb-3">✓</div>
            <p className="text-white font-semibold text-lg">Account activated!</p>
            <p className="text-gray-400 text-sm mt-2">Redirecting to your account…</p>
          </>
        )}

        {state === "no-token" && (
          <>
            <p className="text-white font-semibold text-lg mb-2">Invalid link</p>
            <p className="text-gray-400 text-sm mb-6">
              This activation link is missing or malformed.
            </p>
            <a
              href={`/${countryCode}/orders/track`}
              className="block w-full bg-[#b8ff2b] text-black font-bold py-3 rounded-lg text-sm uppercase tracking-wider text-center hover:opacity-90 transition-opacity"
            >
              Track your order
            </a>
          </>
        )}

        {state === "error" && (
          <>
            <p className="text-white font-semibold text-lg mb-2">Link expired</p>
            <p className="text-gray-400 text-sm mb-6">
              {error} Activation links are valid for{" "}
              <strong className="text-white">15 minutes</strong>. To get a new
              one, open your order page and click "Activate account".
            </p>
            <a
              href={`/${countryCode}/orders/track`}
              className="block w-full bg-[#1f1f1f] border border-gray-700 text-gray-300 font-semibold py-3 rounded-lg text-sm text-center hover:bg-[#2a2a2a] transition-colors"
            >
              Find my order
            </a>
          </>
        )}
      </div>
    </div>
  )
}
