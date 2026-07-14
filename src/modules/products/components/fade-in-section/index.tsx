"use client"

import { motion, useReducedMotion } from "framer-motion"
import { useEffect, useState, type ReactNode } from "react"

type FadeInSectionProps = {
  children: ReactNode
  className?: string
}

const FadeInSection = ({ children, className }: FadeInSectionProps) => {
  const reduceMotion = useReducedMotion()
  // Server has no window, so viewport-observer support can't be checked
  // during the initial render without diverging from the client's first
  // (hydrating) render and triggering a hydration mismatch. Deferring the
  // check to an effect keeps the first client render identical to the
  // server's, then upgrades to the animated version right after hydration.
  const [canAnimate, setCanAnimate] = useState(false)

  useEffect(() => {
    if (typeof IntersectionObserver !== "undefined") {
      setCanAnimate(true)
    }
  }, [])

  if (!canAnimate || reduceMotion) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  )
}

export default FadeInSection
