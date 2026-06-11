"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { exchangeMagicLinkToken, requestMagicLink } from "@lib/data/magic-link"

type State = "loading" | "success" | "error" | "no-token"

export default function VerifyClient({
  token,
  countryCode,
}: {
  token?: string
  countryCode: string
}) {
  const router = useRouter()
  const [state, setState] = useState<State>(token ? "loading" : "no-token")
  const [error, setError] = useState<string>("")
  const [resendEmail, setResendEmail] = useState("")
  const [resendSent, setResendSent] = useState(false)
  const [cooldown, setCooldown] = useState(0)
  // useRef guard prevents double-exchange in React Strict Mode and on remount
  const exchanged = useRef(false)

  useEffect(() => {
    if (!token) return
    if (exchanged.current) return
    exchanged.current = true

    // POST happens only on client mount — never during SSR.
    // This protects against email scanners (Outlook, etc.) that follow href links
    // on GET but cannot trigger client-side JavaScript.
    void exchangeMagicLinkToken(token).then((result) => {
      if (result.ok) {
        setState("success")
        router.push(`/${countryCode}/account`)
      } else {
        setState("error")
        setError(result.error ?? "Invalid or expired login link.")
      }
    })
  }, [token, countryCode, router])

  // 60-second cooldown countdown after resend
  useEffect(() => {
    if (cooldown <= 0) return
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000)
    return () => clearTimeout(t)
  }, [cooldown])

  const handleResend = async () => {
    if (!resendEmail || cooldown > 0) return
    await requestMagicLink(resendEmail)
    setResendSent(true)
    setCooldown(60)
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="max-w-sm w-full bg-[#111111] border border-gray-800 rounded-xl p-8 text-center">
        <p className="text-[#b8ff2b] text-xs font-bold uppercase tracking-widest mb-4">
          ONYX GENETICS
        </p>

        {state === "loading" && (
          <>
            <div className="w-8 h-8 border-2 border-[#b8ff2b] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-white font-semibold text-lg">Signing you in…</p>
          </>
        )}

        {state === "success" && (
          <>
            <div className="text-[#b8ff2b] text-4xl mb-3">✓</div>
            <p className="text-white font-semibold text-lg">Signed in!</p>
            <p className="text-gray-400 text-sm mt-2">Redirecting to your account…</p>
          </>
        )}

        {state === "no-token" && (
          <>
            <p className="text-white font-semibold text-lg mb-2">Invalid link</p>
            <p className="text-gray-400 text-sm mb-6">
              This link is missing or malformed. Request a new one below.
            </p>
            <ResendForm
              email={resendEmail}
              onEmailChange={setResendEmail}
              onResend={handleResend}
              sent={resendSent}
              cooldown={cooldown}
              countryCode={countryCode}
            />
          </>
        )}

        {state === "error" && (
          <>
            <p className="text-white font-semibold text-lg mb-2">Link expired</p>
            <p className="text-gray-400 text-sm mb-6">
              {error} Login links are valid for <strong className="text-white">15 minutes</strong>.
            </p>
            <ResendForm
              email={resendEmail}
              onEmailChange={setResendEmail}
              onResend={handleResend}
              sent={resendSent}
              cooldown={cooldown}
              countryCode={countryCode}
            />
          </>
        )}
      </div>
    </div>
  )
}

function ResendForm({
  email,
  onEmailChange,
  onResend,
  sent,
  cooldown,
  countryCode,
}: {
  email: string
  onEmailChange: (v: string) => void
  onResend: () => void
  sent: boolean
  cooldown: number
  countryCode: string
}) {
  if (sent && cooldown > 0) {
    return (
      <div className="text-center">
        <p className="text-[#b8ff2b] text-sm font-semibold mb-1">New link sent — check your inbox.</p>
        <p className="text-gray-500 text-xs">
          Resend available in {cooldown}s
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <input
        type="email"
        value={email}
        onChange={(e) => onEmailChange(e.target.value)}
        placeholder="Your email address"
        className="w-full bg-[#0d0d0d] border border-gray-700 rounded-lg px-4 py-3 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-[#b8ff2b]"
      />
      <button
        onClick={onResend}
        disabled={!email || cooldown > 0}
        className="w-full bg-[#b8ff2b] text-black font-bold py-3 rounded-lg text-sm uppercase tracking-wider disabled:opacity-40 hover:opacity-90 transition-opacity"
      >
        {cooldown > 0 ? `Wait ${cooldown}s` : "Send new login link"}
      </button>
      <a
        href={`/${countryCode}/account`}
        className="text-gray-500 text-xs text-center hover:text-gray-300 transition-colors"
      >
        Back to sign in
      </a>
    </div>
  )
}
