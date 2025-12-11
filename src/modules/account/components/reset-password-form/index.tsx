"use client"

import { useState } from "react"
import { useSearchParams, useRouter, useParams } from "next/navigation"
import { sdk } from "@lib/config"
import ErrorMessage from "@modules/checkout/components/error-message"
import Input from "@modules/common/components/input"
import { SubmitButton } from "@modules/checkout/components/submit-button"

const ResetPasswordForm = () => {
  const [loading, setLoading] = useState(false)
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const searchParams = useSearchParams()
  const router = useRouter()
  const params = useParams()
  const countryCode = params?.countryCode as string

  const token = searchParams?.get("token")
  const email = searchParams?.get("email")

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)

    if (!token) {
      setError("Invalid reset link. Please request a new password reset.")
      return
    }

    if (!email) {
      setError("Email is missing from the reset link.")
      return
    }

    if (!password) {
      setError("Password is required")
      return
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long")
      return
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    setLoading(true)

    try {
      await sdk.auth.updateProvider(
        "customer",
        "emailpass",
        {
          email: decodeURIComponent(email),
          password,
        },
        token
      )

      setSuccess(true)
      setTimeout(() => {
        router.push(`/${countryCode}/account`)
      }, 2000)
    } catch (err: any) {
      setError(
        err?.message || "Failed to reset password. The link may have expired."
      )
    } finally {
      setLoading(false)
    }
  }

  if (!token || !email) {
    return (
      <div className="max-w-sm w-full flex flex-col items-center">
        <h1 className="text-large-semi uppercase mb-6">Invalid Link</h1>
        <p className="text-center text-base-regular text-ui-fg-base mb-8">
          This password reset link is invalid or has expired. Please request a
          new password reset link.
        </p>
      </div>
    )
  }

  if (success) {
    return (
      <div className="max-w-sm w-full flex flex-col items-center">
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
    <div className="max-w-sm w-full flex flex-col items-center">
      <h1 className="text-large-semi uppercase mb-6">Reset Password</h1>
      <p className="text-center text-base-regular text-ui-fg-base mb-8">
        Enter your new password below.
      </p>
      <form className="w-full" onSubmit={handleSubmit}>
        <div className="flex flex-col w-full gap-y-2">
          <Input
            label="New Password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Input
            label="Confirm Password"
            name="confirm_password"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>
        {error && <ErrorMessage error={error} />}
        <SubmitButton className="w-full mt-6" disabled={loading}>
          {loading ? "Resetting..." : "Reset Password"}
        </SubmitButton>
      </form>
    </div>
  )
}

export default ResetPasswordForm
