"use client"

import { useReducedMotion } from "framer-motion"
import { ShieldCheck } from "lucide-react"

// Risk-reversal marquee right under the hero. The guarantee is the strongest
// offer on the site — it must be seen before any product claim.
const ITEMS = [
  "SEIZED? RESHIPPED 100% FREE — EVERY ORDER",
  "PLAIN PACKAGING, NO LABELS",
  "GMP-CERTIFIED FACTORIES",
  "INDEPENDENTLY SPOT-CHECKED",
]

const Sequence = ({ ariaHidden = false }: { ariaHidden?: boolean }) => (
  <div
    aria-hidden={ariaHidden}
    className="flex items-center gap-8 pr-8 shrink-0"
  >
    {ITEMS.map((item) => (
      <span
        key={item}
        className="flex items-center gap-3 whitespace-nowrap font-mono text-[11px] md:text-xs uppercase tracking-[0.25em] text-black/80"
      >
        <ShieldCheck className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        {item}
      </span>
    ))}
  </div>
)

const GuaranteeStrip = () => {
  const reducedMotion = useReducedMotion()

  return (
    <section
      className="relative z-10 bg-[#ccff00] py-3 overflow-hidden"
      data-testid="guarantee-strip"
    >
      {reducedMotion ? (
        <div className="flex justify-center overflow-x-auto no-scrollbar px-4">
          <Sequence />
        </div>
      ) : (
        <div className="flex w-max animate-marquee hover:[animation-play-state:paused]">
          {/* Two copies make the loop seamless: when the first scrolls out, the
              second is in place and the animation snaps back invisibly. */}
          <Sequence />
          <Sequence ariaHidden />
        </div>
      )}
    </section>
  )
}

export default GuaranteeStrip
