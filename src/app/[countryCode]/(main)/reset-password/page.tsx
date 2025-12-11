import ResetPasswordForm from "@modules/account/components/reset-password-form"
import { Metadata } from "next"
import { Suspense } from "react"

export const metadata: Metadata = {
  title: "Reset Password",
  description: "Reset your account password",
}

export default function ResetPasswordPage() {
  return (
    <div className="flex justify-center py-24">
      <Suspense fallback={<div>Loading...</div>}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  )
}
