"use client"

import { MotionConfig } from "framer-motion"

// Global framer-motion config: every motion component in the app respects the
// user's prefers-reduced-motion setting without per-component wiring.
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>
}
