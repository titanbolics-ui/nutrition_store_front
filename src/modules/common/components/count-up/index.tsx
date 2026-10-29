"use client"

import { useEffect, useRef, useState } from "react"
import { animate, useReducedMotion } from "framer-motion"

/**
 * Animated number for trust stats. Renders the FINAL value on the server (and
 * anywhere IntersectionObserver is unavailable or reduced motion is on) so the
 * real number is always in the HTML; the count-up is a progressive enhancement
 * that runs once when the element scrolls into view.
 */
const CountUp = ({
  value,
  decimals = 0,
  prefix = "",
  suffix = "",
  className,
  "data-testid": dataTestId,
}: {
  value: number
  decimals?: number
  prefix?: string
  suffix?: string
  className?: string
  "data-testid"?: string
}) => {
  const ref = useRef<HTMLSpanElement>(null)
  const reducedMotion = useReducedMotion()

  const format = (v: number) =>
    v.toLocaleString("en-US", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    })

  const [display, setDisplay] = useState(() => format(value))

  useEffect(() => {
    const el = ref.current
    if (!el || reducedMotion || typeof IntersectionObserver === "undefined") {
      setDisplay(format(value))
      return
    }

    let controls: ReturnType<typeof animate> | undefined
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          observer.disconnect()
          controls = animate(0, value, {
            duration: 0.6,
            ease: "easeOut",
            onUpdate: (v) => setDisplay(format(v)),
          })
        }
      },
      { threshold: 0.5 }
    )
    observer.observe(el)

    return () => {
      observer.disconnect()
      controls?.stop()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, decimals, reducedMotion])

  return (
    <span ref={ref} className={className} data-testid={dataTestId}>
      {prefix}
      {display}
      {suffix}
    </span>
  )
}

export default CountUp
