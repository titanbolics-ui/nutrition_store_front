"use client"

import { useState } from "react"
import { sdk } from "@lib/config"
import { LOGIN_VIEW } from "@modules/account/templates/login-template"
import Input from "@modules/common/components/input" // Використовуємо ваш компонент Input
import { SubmitButton } from "@modules/checkout/components/submit-button" // Використовуємо вашу кнопку
import ErrorMessage from "@modules/checkout/components/error-message" // Для виводу помилок

type Props = {
  setCurrentView: (view: LOGIN_VIEW) => void
}

const ForgotPassword = ({ setCurrentView }: Props) => {
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)

    if (!email) {
      setError("Email is required")
      return
    }
    setLoading(true)

    try {
      await sdk.auth.resetPassword("customer", "emailpass", {
        identifier: email,
      })
      setSuccess(true)
    } catch (err: any) {
      setError(err.message || "Something went wrong, please try again.")
    } finally {
      setLoading(false)
    }
  }

  // Якщо успішно відправлено, показуємо повідомлення замість форми
  if (success) {
    return (
      <div
        className="max-w-sm w-full flex flex-col items-center"
        data-testid="forgot-password-success"
      >
        <h1 className="text-large-semi uppercase mb-6">Check your inbox</h1>
        <p className="text-center text-base-regular text-ui-fg-base mb-8">
          If an account exists with the email <strong>{email}</strong>, you will
          receive instructions to reset your password shortly.
        </p>
        <button
          onClick={() => setCurrentView(LOGIN_VIEW.SIGN_IN)}
          className="text-small-regular text-ui-fg-base underline"
        >
          Back to Sign In
        </button>
      </div>
    )
  }

  return (
    <div
      className="max-w-sm w-full flex flex-col items-center"
      data-testid="forgot-password-page"
    >
      <h1 className="text-large-semi uppercase mb-6">Reset Password</h1>
      <p className="text-center text-base-regular text-ui-fg-base mb-8">
        Enter the email address associated with your account, and we'll send you
        a link to reset your password.
      </p>

      <form className="w-full" onSubmit={handleSubmit}>
        <div className="flex flex-col w-full gap-y-2">
          <Input
            label="Email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            data-testid="email-input"
          />
        </div>

        {error && (
          <div className="mt-2">
            <ErrorMessage error={error} data-testid="forgot-password-error" />
          </div>
        )}

        <SubmitButton
          className="w-full mt-6"
          isLoading={loading}
          data-testid="submit-button"
        >
          Send Reset Instructions
        </SubmitButton>
      </form>

      <span className="text-center text-ui-fg-base text-small-regular mt-6">
        Remember your password?{" "}
        <button
          onClick={() => setCurrentView(LOGIN_VIEW.SIGN_IN)}
          className="underline"
        >
          Sign in
        </button>
      </span>
    </div>
  )
}

export default ForgotPassword
