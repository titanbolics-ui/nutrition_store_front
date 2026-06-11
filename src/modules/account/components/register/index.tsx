"use client"

import { useState, useEffect } from "react"
import Input from "@modules/common/components/input"
import { LOGIN_VIEW } from "@modules/account/templates/login-template"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { requestRegistration } from "@lib/data/magic-link"
import posthog from "posthog-js"

type Props = {
  setCurrentView: (view: LOGIN_VIEW) => void
}

const Register = ({ setCurrentView }: Props) => {
  const [firstName, setFirstName] = useState("")
  const [lastName,  setLastName]  = useState("")
  const [email,     setEmail]     = useState("")
  const [phone,     setPhone]     = useState("")

  const [state, setState] = useState<"idle" | "sending" | "sent">("idle")
  const [cooldown, setCooldown] = useState(0)

  useEffect(() => {
    if (cooldown <= 0) return
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000)
    return () => clearTimeout(t)
  }, [cooldown])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (state === "sending" || cooldown > 0) return
    setState("sending")

    if (posthog) {
      posthog.capture("registration_attempted")
      if (email) posthog.setPersonProperties({ $email: email })
    }

    await requestRegistration({
      email: email.trim(),
      first_name: firstName.trim() || undefined,
      last_name:  lastName.trim()  || undefined,
      phone:      phone.trim()     || undefined,
    })

    setState("sent")
    setCooldown(60)
  }

  return (
    <div
      className="max-w-sm flex flex-col items-center bg-[#111111] border border-gray-800 p-8 rounded-xl shadow-2xl"
      data-testid="register-page"
    >
      <h1 className="text-large-semi uppercase mb-6 text-white font-bold tracking-wider">
        Become an Onyx Genetics Member
      </h1>

      {state === "sent" ? (
        <div className="w-full text-center">
          <div className="text-[#b8ff2b] text-3xl mb-3">✓</div>
          <p className="text-white font-semibold mb-1">Check your inbox</p>
          <p className="text-gray-400 text-sm mb-4">
            A confirmation link was sent to <strong className="text-white">{email}</strong>.
            It expires in 15 minutes.
          </p>
          {cooldown > 0 ? (
            <p className="text-gray-500 text-xs">Resend available in {cooldown}s</p>
          ) : (
            <button
              onClick={() => { setState("idle"); setCooldown(0) }}
              className="text-gray-400 text-xs underline hover:text-white transition-colors"
            >
              Send again
            </button>
          )}
        </div>
      ) : (
        <>
          <p className="text-center text-base-regular text-gray-400 mb-4">
            Create your account — no password needed. We'll send you a one-click confirmation link.
          </p>
          <form className="w-full flex flex-col" onSubmit={handleSubmit}>
            <div className="flex flex-col w-full gap-y-4">
              <Input
                label="First name"
                name="first_name"
                required
                autoComplete="given-name"
                data-testid="first-name-input"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
              <Input
                label="Last name"
                name="last_name"
                required
                autoComplete="family-name"
                data-testid="last-name-input"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
              <Input
                label="Email"
                name="email"
                required
                type="email"
                autoComplete="email"
                data-testid="email-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <div>
                <Input
                  label="Phone (optional)"
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  data-testid="phone-input"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
                <p className="text-gray-600 text-xs mt-1 px-1">
                  For WhatsApp order updates
                </p>
              </div>
            </div>

            <span className="text-center text-gray-400 text-small-regular mt-6">
              By creating an account, you agree to Onyx Genetics&apos;s{" "}
              <LocalizedClientLink
                href="/content/privacy-policy"
                className="underline text-[#ccff00] hover:text-white"
              >
                Privacy Policy
              </LocalizedClientLink>{" "}
              and{" "}
              <LocalizedClientLink
                href="/content/terms-of-use"
                className="underline text-[#ccff00] hover:text-white"
              >
                Terms of Use
              </LocalizedClientLink>
              .
            </span>

            <button
              type="submit"
              disabled={!firstName || !lastName || !email || state === "sending"}
              className="w-full mt-6 bg-[#ccff00] text-black font-bold py-3 rounded-lg text-sm uppercase tracking-wider disabled:opacity-40 hover:opacity-90 transition-opacity"
              data-testid="register-button"
            >
              {state === "sending" ? "Sending…" : "Create account →"}
            </button>
          </form>
        </>
      )}

      <span className="text-center text-gray-400 text-small-regular mt-6">
        Already a member?{" "}
        <button
          onClick={() => setCurrentView(LOGIN_VIEW.SIGN_IN)}
          className="underline text-[#ccff00] hover:text-white"
        >
          Sign in
        </button>
        .
      </span>
    </div>
  )
}

export default Register
