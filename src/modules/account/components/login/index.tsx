"use client"

import { useState, useEffect } from "react"
import { useActionState } from "react"
import { login } from "@lib/data/customer"
import { requestMagicLink } from "@lib/data/magic-link"
import { LOGIN_VIEW } from "@modules/account/templates/login-template"
import ErrorMessage from "@modules/checkout/components/error-message"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import Input from "@modules/common/components/input"
import posthog from "posthog-js"

type Props = {
  setCurrentView: (view: LOGIN_VIEW) => void
}

const Login = ({ setCurrentView }: Props) => {
  const [usePassword, setUsePassword] = useState(false)
  const [magicEmail, setMagicEmail] = useState("")
  const [magicState, setMagicState] = useState<"idle" | "sending" | "sent">("idle")
  const [cooldown, setCooldown] = useState(0)

  // Countdown timer for the cooldown
  useEffect(() => {
    if (cooldown <= 0) return
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000)
    return () => clearTimeout(t)
  }, [cooldown])

  const handleSendMagicLink = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!magicEmail || magicState === "sending" || cooldown > 0) return
    setMagicState("sending")
    if (posthog) posthog.capture("magic_link_requested")
    await requestMagicLink(magicEmail)
    setMagicState("sent")
    setCooldown(60)
  }

  // Password login
  const [message, formAction] = useActionState(login, null)

  if (usePassword) {
    return (
      <div
        className="max-w-sm w-full flex flex-col items-center bg-[#111111] border border-gray-800 p-8 rounded-xl shadow-2xl"
        data-testid="login-page"
      >
        <h1 className="text-large-semi uppercase mb-6 text-white font-bold tracking-wider">
          Sign in
        </h1>
        <form className="w-full" action={formAction}>
          <div className="flex flex-col w-full gap-y-4">
            <Input label="Email" name="email" type="email" autoComplete="email" required />
            <Input label="Password" name="password" type="password" autoComplete="current-password" required />
          </div>
          <div className="flex justify-end mt-4">
            <button
              type="button"
              onClick={() => setCurrentView(LOGIN_VIEW.FORGOT_PASSWORD)}
              className="text-small-regular text-gray-400 hover:text-white underline cursor-pointer transition-colors"
            >
              Forgot password?
            </button>
          </div>
          <ErrorMessage error={message} data-testid="login-error-message" />
          <SubmitButton
            data-testid="sign-in-button"
            className="w-full mt-6 bg-[#ccff00] text-black hover:opacity-90 font-bold uppercase tracking-wider border-none"
          >
            Sign in
          </SubmitButton>
        </form>
        <button
          type="button"
          onClick={() => setUsePassword(false)}
          className="text-gray-500 text-xs mt-4 hover:text-gray-300 transition-colors"
        >
          ← Use magic link instead
        </button>
        <span className="text-center text-gray-400 text-small-regular mt-4">
          Not a member?{" "}
          <button
            onClick={() => setCurrentView(LOGIN_VIEW.REGISTER)}
            className="underline text-[#ccff00] hover:text-white transition-colors"
            data-testid="register-button"
          >
            Join us
          </button>
          .
        </span>
      </div>
    )
  }

  // Magic link form (default)
  return (
    <div
      className="max-w-sm w-full flex flex-col items-center bg-[#111111] border border-gray-800 p-8 rounded-xl shadow-2xl"
      data-testid="login-page"
    >
      <h1 className="text-large-semi uppercase mb-2 text-white font-bold tracking-wider">
        Welcome back
      </h1>
      <p className="text-center text-sm text-gray-400 mb-7">
        Enter your email — we'll send you a sign-in link. No password needed.
      </p>

      {magicState === "sent" ? (
        <div className="w-full text-center">
          <div className="text-[#b8ff2b] text-3xl mb-3">✓</div>
          <p className="text-white font-semibold mb-1">Check your inbox</p>
          <p className="text-gray-400 text-sm mb-4">
            A sign-in link was sent to <strong className="text-white">{magicEmail}</strong>.
            It expires in 15 minutes.
          </p>
          {cooldown > 0 ? (
            <p className="text-gray-500 text-xs">Resend available in {cooldown}s</p>
          ) : (
            <button
              onClick={() => { setMagicState("idle"); setCooldown(0) }}
              className="text-gray-400 text-xs underline hover:text-white transition-colors"
            >
              Send again
            </button>
          )}
        </div>
      ) : (
        <form className="w-full" onSubmit={handleSendMagicLink}>
          <Input
            label="Email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={magicEmail}
            onChange={(e) => setMagicEmail(e.target.value)}
          />
          <button
            type="submit"
            disabled={!magicEmail || magicState === "sending" || cooldown > 0}
            className="w-full mt-5 bg-[#b8ff2b] text-black font-bold py-3 rounded-lg text-sm uppercase tracking-wider disabled:opacity-40 hover:opacity-90 transition-opacity"
          >
            {magicState === "sending" ? "Sending…" : cooldown > 0 ? `Wait ${cooldown}s` : "Send login link →"}
          </button>
        </form>
      )}

      <div className="mt-6 w-full border-t border-gray-800 pt-4 flex flex-col items-center gap-2">
        <button
          type="button"
          onClick={() => setUsePassword(true)}
          className="text-gray-500 text-xs hover:text-gray-300 transition-colors"
        >
          Sign in with password instead
        </button>
        <span className="text-center text-gray-400 text-small-regular">
          Not a member?{" "}
          <button
            onClick={() => setCurrentView(LOGIN_VIEW.REGISTER)}
            className="underline text-[#ccff00] hover:text-white transition-colors"
            data-testid="register-button"
          >
            Join us
          </button>
          .
        </span>
      </div>
    </div>
  )
}

export default Login
