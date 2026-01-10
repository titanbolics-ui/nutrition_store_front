"use client"

import { ArrowLeftMini } from "@medusajs/icons"
import { useRouter } from "next/navigation"

type BackButtonProps = {
  label?: string
  fallbackHref?: string
}

export default function BackButton({
  label = "Back",
  fallbackHref,
}: BackButtonProps) {
  const router = useRouter()

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back()
    } else if (fallbackHref) {
      router.push(fallbackHref)
    } else {
      router.push("/")
    }
  }

  return (
    <button
      onClick={handleBack}
      className="inline-flex items-center gap-1 text-sm text-ui-fg-muted hover:text-ui-fg-base transition-colors"
      aria-label={label}
    >
      <ArrowLeftMini className="w-4 h-4" />
      <span>{label}</span>
    </button>
  )
}
