"use client"

import { useState } from "react"
import { useSearchParams } from "next/navigation"
import { CheckCircle } from "lucide-react"

import Register from "@modules/account/components/register"
import Login from "@modules/account/components/login"
import ForgotPassword from "../components/forgot-password"

export enum LOGIN_VIEW {
  SIGN_IN = "sign-in",
  REGISTER = "register",
  FORGOT_PASSWORD = "forgot-password",
}

const LoginTemplate = () => {
  const [currentView, setCurrentView] = useState("sign-in")
  const searchParams = useSearchParams()
  const resetSuccess = searchParams.get("reset") === "success"

  return (
    <div className="w-full flex justify-start px-8 py-8">
      <div className="max-w-sm w-full flex flex-col gap-3">
        {resetSuccess && (
          <div className="flex items-start gap-3 p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
            <CheckCircle className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-green-400 font-semibold text-sm">
                Password reset successfully!
              </p>
              <p className="text-green-300/70 text-xs mt-0.5">
                Please log in with your new password.
              </p>
            </div>
          </div>
        )}
        {currentView === "sign-in" ? (
          <Login setCurrentView={setCurrentView} />
        ) : currentView === "forgot-password" ? (
          <ForgotPassword setCurrentView={setCurrentView} />
        ) : (
          <Register setCurrentView={setCurrentView} />
        )}
      </div>
    </div>
  )
}

export default LoginTemplate
