"use client"

import { useEffect, useRef } from "react"
import Image from "next/image"
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion"

import LocalizedClientLink from "@modules/common/components/localized-client-link"
import CountUp from "@modules/common/components/count-up"
import { EASE_OUT } from "@lib/util/motion"

export type HeroCategory = { name: string; handle: string }

const HEADLINE_WORDS = ["PROOF.", "NOT", "PROMISES."]

const ATHLETE_IMAGE =
  "https://pub-180ab5eb49854df5a790e2b99c1c0be9.r2.dev/onyxgenetics/Esthetic.jpg"

/**
 * Big Split hero (2026 pattern: oversized type + single subject + one primary
 * CTA). Left: type-led offer. Right: the athlete ("who this is for"). A live
 * category ticker below spells out "what we sell" instantly and doubles as
 * quick-nav. Depth from scroll parallax (layers at different speeds) plus a
 * subtle pointer parallax on desktop — disabled on touch / reduced motion.
 */
const Hero = ({ categories }: { categories: HeroCategory[] }) => {
  const sectionRef = useRef<HTMLDivElement>(null)
  const reducedMotion = useReducedMotion()

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  })

  const gridY = useTransform(scrollYProgress, [0, 1], [0, 120])
  const athleteY = useTransform(scrollYProgress, [0, 1], [0, -80])
  const athleteScale = useTransform(scrollYProgress, [0, 1], [1, 1.12])
  const glowY = useTransform(scrollYProgress, [0, 1], [0, 190])
  const contentY = useTransform(scrollYProgress, [0, 1], [0, 60])
  const contentOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0.35])

  // Pointer parallax — normalized -1..1 from viewport center, spring-smoothed.
  const px = useMotionValue(0)
  const py = useMotionValue(0)
  const pointerX = useSpring(px, { stiffness: 60, damping: 18 })
  const pointerY = useSpring(py, { stiffness: 60, damping: 18 })

  const athletePX = useTransform(pointerX, (v) => v * 20)
  const athletePY = useTransform(pointerY, (v) => v * 14)
  const glowPX = useTransform(pointerX, (v) => v * -34)
  const glowPY = useTransform(pointerY, (v) => v * -22)

  useEffect(() => {
    if (reducedMotion) return
    if (
      typeof window !== "undefined" &&
      window.matchMedia?.("(pointer: coarse)").matches
    ) {
      return
    }
    const onMove = (e: PointerEvent) => {
      px.set((e.clientX / window.innerWidth) * 2 - 1)
      py.set((e.clientY / window.innerHeight) * 2 - 1)
    }
    window.addEventListener("pointermove", onMove)
    return () => window.removeEventListener("pointermove", onMove)
  }, [reducedMotion, px, py])

  return (
    <div
      ref={sectionRef}
      className="relative w-full min-h-[100svh] md:min-h-[92vh] overflow-hidden bg-[#0A0B0D] text-white selection:bg-[#ccff00] selection:text-black flex flex-col"
    >
      {/* Layer 1: lab grid */}
      <motion.div
        aria-hidden="true"
        style={{ y: gridY }}
        className="absolute inset-[-10%] z-0 opacity-[0.04]"
      >
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)`,
            backgroundSize: "4rem 4rem",
          }}
        />
      </motion.div>

      {/* Layer 2: acid glow — rim light behind the athlete + left ambience */}
      <motion.div
        aria-hidden="true"
        style={{ x: glowPX, y: glowPY }}
        className="absolute inset-0 z-0 pointer-events-none"
      >
        <motion.div style={{ y: glowY }} className="absolute inset-0">
          <div className="absolute top-[8%] right-[8%] w-[560px] h-[560px] rounded-full bg-[#ccff00]/[0.10] blur-[140px]" />
          <div className="absolute bottom-[10%] left-[-8%] w-[420px] h-[420px] rounded-full bg-[#ccff00]/[0.05] blur-[120px]" />
        </motion.div>
      </motion.div>

      {/* Layer 3: athlete — right half, present, cinematic duotone */}
      <motion.div
        aria-hidden="true"
        style={{ x: athletePX, y: athletePY }}
        className="absolute inset-y-[-6%] right-0 w-full md:w-[60%] z-[1] pointer-events-none"
      >
        <motion.div
          style={{ y: athleteY, scale: athleteScale }}
          className="absolute inset-0 origin-top-right"
        >
          <Image
            src={ATHLETE_IMAGE}
            alt=""
            fill
            sizes="(max-width: 768px) 100vw, 60vw"
            className="object-cover object-[center_10%] grayscale-[0.6] contrast-105 opacity-40 md:opacity-90"
            priority
          />
          {/* Blend into the copy side / page base */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#0A0B0D] via-[#0A0B0D]/50 md:via-[#0A0B0D]/20 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0B0D] via-transparent to-[#0A0B0D]/70" />
          {/* Acid wash keeps the photo in the palette */}
          <div className="absolute inset-0 bg-[#ccff00]/[0.05] mix-blend-overlay" />
        </motion.div>
      </motion.div>

      {/* Layer 4: content */}
      <motion.div
        style={{ y: contentY, opacity: contentOpacity }}
        className="relative z-10 content-container flex-1 flex flex-col justify-center pt-28 md:pt-32 pb-10"
      >
        <div className="max-w-xl">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: EASE_OUT, delay: 0.1 }}
            className="flex items-center gap-3 mb-6"
          >
            <span className="h-px w-10 bg-[#ccff00]/60" aria-hidden="true" />
            <span className="text-[#ccff00] font-mono text-[11px] md:text-xs uppercase tracking-[0.3em]">
              Pharma-grade · GMP-certified manufacturers
            </span>
          </motion.div>

          <h1 className="text-[17vw] sm:text-7xl md:text-8xl lg:text-[7.5rem] font-black tracking-tight leading-[0.9] mb-6">
            {HEADLINE_WORDS.map((word, i) => (
              <motion.span
                key={word}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.6,
                  ease: EASE_OUT,
                  delay: 0.25 + i * 0.12,
                }}
                className={i === 0 ? "block text-[#ccff00]" : "block text-white"}
              >
                {word}
              </motion.span>
            ))}
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: EASE_OUT, delay: 0.7 }}
            className="text-gray-300 text-base md:text-lg leading-relaxed max-w-md mb-8"
          >
            For athletes who check the numbers — real pharma factories,
            independent spot-checks by Janoshik, stealth shipping, reshipped
            free if seized.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: EASE_OUT, delay: 0.85 }}
            className="flex flex-wrap items-center gap-4"
          >
            <LocalizedClientLink
              href="/store"
              className="inline-flex items-center justify-center px-9 py-4 bg-[#ccff00] text-black font-black uppercase tracking-wide text-sm rounded-lg shadow-[0_0_30px_rgba(204,255,0,0.25)] hover:bg-[#b8ff2b] hover:shadow-[0_0_50px_rgba(204,255,0,0.5)] transition-all duration-200"
            >
              Shop Compounds
            </LocalizedClientLink>
            <LocalizedClientLink
              href="/lab-results"
              className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-gray-400 hover:text-[#ccff00] transition-colors duration-200 underline-offset-4 hover:underline"
            >
              See lab reports →
            </LocalizedClientLink>
          </motion.div>
        </div>

        {/* Category ticker — instant "what we sell" + quick nav */}
        {categories.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.95 }}
            className="mt-12 md:mt-14 border-y border-white/10 py-3 overflow-hidden"
          >
            <CategoryTicker
              categories={categories}
              reducedMotion={!!reducedMotion}
            />
          </motion.div>
        )}

        {/* Trust stat ticker */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE_OUT, delay: 1.05 }}
          className="mt-8 grid grid-cols-3 gap-4 max-w-xl"
          data-testid="hero-stats"
        >
          <div>
            <div className="text-xl md:text-3xl font-black text-[#ccff00]">
              <CountUp value={10000} suffix="+" />
            </div>
            <div className="text-[10px] md:text-xs text-gray-500 uppercase tracking-widest mt-1">
              Warehouse shipments
            </div>
          </div>
          <div>
            <div className="text-xl md:text-3xl font-black text-[#ccff00]">
              <CountUp value={99.8} decimals={1} suffix="%" />
            </div>
            <div className="text-[10px] md:text-xs text-gray-500 uppercase tracking-widest mt-1">
              Delivery rate
            </div>
          </div>
          <div>
            <div className="text-xl md:text-3xl font-black text-white">HPLC</div>
            <div className="text-[10px] md:text-xs text-gray-500 uppercase tracking-widest mt-1">
              Independent spot-checks
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}

const CategoryTicker = ({
  categories,
  reducedMotion,
}: {
  categories: HeroCategory[]
  reducedMotion: boolean
}) => {
  if (reducedMotion) {
    return (
      <div
        className="flex gap-6 overflow-x-auto no-scrollbar"
        data-testid="hero-category-ticker"
      >
        <TickerSequence categories={categories} />
      </div>
    )
  }
  return (
    <div
      className="flex w-max animate-marquee hover:[animation-play-state:paused]"
      data-testid="hero-category-ticker"
    >
      <TickerSequence categories={categories} />
      <TickerSequence categories={categories} ariaHidden />
    </div>
  )
}

const TickerSequence = ({
  categories,
  ariaHidden = false,
}: {
  categories: HeroCategory[]
  ariaHidden?: boolean
}) => (
  <div aria-hidden={ariaHidden} className="flex items-center gap-6 pr-6 shrink-0">
    {categories.map((category) => (
      <LocalizedClientLink
        key={`${ariaHidden ? "b" : "a"}-${category.handle}`}
        href={`/categories/${category.handle}`}
        className="flex items-center gap-6 whitespace-nowrap text-xs md:text-sm font-bold uppercase tracking-[0.2em] text-gray-400 hover:text-[#ccff00] transition-colors"
        tabIndex={ariaHidden ? -1 : undefined}
      >
        {category.name}
        <span className="text-[#ccff00]/40" aria-hidden="true">
          ·
        </span>
      </LocalizedClientLink>
    ))}
  </div>
)

export default Hero
