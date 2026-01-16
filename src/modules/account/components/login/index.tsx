"use client"

import { login } from "@lib/data/customer"
import { LOGIN_VIEW } from "@modules/account/templates/login-template"
import ErrorMessage from "@modules/checkout/components/error-message"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import Input from "@modules/common/components/input"
import { useActionState } from "react"
import posthog from "posthog-js"

type Props = {
  setCurrentView: (view: LOGIN_VIEW) => void
}

const Login = ({ setCurrentView }: Props) => {
  const [message, formAction] = useActionState(login, null)

  // Трекаємо email для PostHog
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const email = e.target.value
    if (email && email.includes("@") && posthog) {
      posthog.setPersonProperties({
        $email: email,
      })
    }
  }

  // Обробник сабміту форми - трекаємо спробу логіну
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    if (posthog) {
      posthog.capture("login_attempted")
    }
  }

  return (
    <div
      className="max-w-sm w-full flex flex-col items-center bg-[#111111] border border-gray-800 p-8 rounded-xl shadow-2xl"
      data-testid="login-page"
    >
      <h1 className="text-large-semi uppercase mb-6 text-white font-bold tracking-wider">
        Welcome back
      </h1>
      <p className="text-center text-base-regular text-gray-400 mb-8">
        Sign in to access an enhanced shopping experience.
      </p>
      <form className="w-full" action={formAction} onSubmit={handleSubmit}>
        <div className="flex flex-col w-full gap-y-4">
          <Input
            label="Email"
            name="email"
            type="email"
            title="Enter a valid email address."
            autoComplete="email"
            required
            data-testid="email-input"
            onChange={handleEmailChange}
          />
          <Input
            label="Password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            data-testid="password-input"
          />
        </div>
        <div className="flex justify-end mt-4">
          <button
            type="button" // Важливо, щоб не сабмітило форму
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
      <span className="text-center text-gray-400 text-small-regular mt-6">
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

export default Login
