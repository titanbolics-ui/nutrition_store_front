"use client"

import { useActionState, useState } from "react"
import { useSearchParams, usePathname } from "next/navigation"
import ErrorMessage from "@modules/checkout/components/error-message"
import Input from "@modules/common/components/input"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import { resetPasswordConfirm } from "@lib/data/customer"

const ResetPasswordForm = () => {
  const [state, formAction] = useActionState(resetPasswordConfirm, {
    success: false,
    error: null,
  })

  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [clientError, setClientError] = useState<string | null>(null)

  const searchParams = useSearchParams()
  const pathname = usePathname()

  const token = searchParams.get("token")
  const email = searchParams.get("email")

  // Extract countryCode from pathname: /us/reset-password → "us"
  const countryCode = pathname.split("/")[1] || "us"

  const handleClientValidation = (e: React.FormEvent<HTMLFormElement>) => {
    setClientError(null)

    if (password !== confirmPassword) {
      e.preventDefault()
      setClientError("Passwords do not match")
      return
    }

    if (password.length < 8) {
      e.preventDefault()
      setClientError("Password must be at least 8 characters long")
      return
    }
  }

  if (!token || !email) {
    return (
      <div className="max-w-sm w-full flex flex-col items-center py-24">
        <h1 className="text-large-semi uppercase mb-6 text-white">Invalid Link</h1>
        <p className="text-center text-base-regular text-gray-400 mb-8">
          This password reset link is invalid or has expired. Please request a
          new password reset link.
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-sm w-full flex flex-col items-center py-24">
      <h1 className="text-large-semi uppercase mb-6 text-white">Reset Password</h1>
      <p className="text-center text-base-regular text-gray-400 mb-8">
        Enter your new password below.
      </p>

      <form
        className="w-full"
        action={formAction}
        onSubmit={handleClientValidation}
      >
        <input type="hidden" name="token" value={token} />
        <input type="hidden" name="email" value={email} />
        <input type="hidden" name="country_code" value={countryCode} />

        <div className="flex flex-col w-full gap-y-2">
          <Input
            label="New Password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Input
            label="Confirm Password"
            name="confirm_password"
            type="password"
            autoComplete="new-password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>

        {(clientError || state?.error) && (
          <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
            <ErrorMessage error={clientError || state?.error} />
          </div>
        )}

        <SubmitButton className="w-full mt-6">Reset Password</SubmitButton>
      </form>
    </div>
  )
}

export default ResetPasswordForm
