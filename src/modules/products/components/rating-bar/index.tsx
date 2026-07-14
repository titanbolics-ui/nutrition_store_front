"use client"

import { motion, useReducedMotion } from "framer-motion"
import { useEffect, useState } from "react"
import SpecRow from "../spec-row"

type RatingBarProps = {
  label: string
  value: string
  max?: number
}

const DEFAULT_MAX = 500

export function parseRating(value: string): number | null {
  const match = value.match(/^\s*(\d+(?:\.\d+)?)/)
  if (!match) return null
  return parseFloat(match[1])
}

const RatingBar = ({ label, value, max = DEFAULT_MAX }: RatingBarProps) => {
  const reduceMotion = useReducedMotion()
  const parsed = parseRating(value)
  // See fade-in-section for why this is deferred to an effect rather than
  // checked during render: it must match the server's render exactly on
  // the client's first (hydrating) pass, or React flags a hydration error.
  const [canAnimate, setCanAnimate] = useState(false)

  useEffect(() => {
    if (typeof IntersectionObserver !== "undefined") {
      setCanAnimate(true)
    }
  }, [])

  if (parsed === null) {
    return <SpecRow label={label} value={value} />
  }

  const percent = Math.min(100, (parsed / max) * 100)
  const skipAnimation = !canAnimate || reduceMotion

  return (
    <div className="rounded-lg border border-gray-800 bg-gray-900/50 p-4 transition-all duration-[120ms] motion-safe:hover:-translate-y-0.5 hover:border-[#ccff00]/40 hover:shadow-[0_0_20px_-4px_rgba(204,255,0,0.35)]">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">
          {label}
        </span>
        <span className="text-sm font-bold text-[#ccff00]">{value}</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-gray-700" aria-hidden="true">
        {skipAnimation ? (
          <div
            className="h-1.5 rounded-full bg-[#ccff00]"
            style={{ width: `${percent}%` }}
          />
        ) : (
          <motion.div
            className="h-1.5 rounded-full bg-[#ccff00]"
            initial={{ width: 0 }}
            whileInView={{ width: `${percent}%` }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />
        )}
      </div>
    </div>
  )
}

export default RatingBar
