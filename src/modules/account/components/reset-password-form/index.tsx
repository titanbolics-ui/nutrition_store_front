"use client"

import { useActionState, useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
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
  const router = useRouter()

  const token = searchParams.get("token")
  const email = searchParams.get("email")

  useEffect(() => {
    if (state.success) {
      const timer = setTimeout(() => {
        router.push("/account")
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [state.success, router])

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
        <h1 className="text-large-semi uppercase mb-6">Invalid Link</h1>
        <p className="text-center text-base-regular text-ui-fg-base mb-8">
          This password reset link is invalid or has expired. Please request a
          new password reset link.
        </p>
      </div>
    )
  }

  if (state.success) {
    return (
      <div className="max-w-sm w-full flex flex-col items-center py-24">
        <h1 className="text-large-semi uppercase mb-6">
          Password Reset Successful
        </h1>
        <p className="text-center text-base-regular text-ui-fg-base mb-8">
          Your password has been successfully reset. Redirecting to login...
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-sm w-full flex flex-col items-center py-24">
      <h1 className="text-large-semi uppercase mb-6">Reset Password</h1>
      <p className="text-center text-base-regular text-ui-fg-base mb-8">
        Enter your new password below.
      </p>

      <form
        className="w-full"
        action={formAction}
        onSubmit={handleClientValidation}
      >
        {/* Hidden fields for context transfer to Server Action */}
        <input type="hidden" name="token" value={token} />
        <input type="hidden" name="email" value={email} />

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

        {/* Display errors (client or server) */}
        {(clientError || state.error) && (
          <div className="mt-2">
            <ErrorMessage error={clientError || state.error} />
          </div>
        )}

        <SubmitButton className="w-full mt-6">Reset Password</SubmitButton>
      </form>
    </div>
  )
}

export default ResetPasswordForm
