"use client"

import { useRef } from "react"
import Image from "next/image"
import { motion, useScroll, useTransform } from "framer-motion"

import LocalizedClientLink from "@modules/common/components/localized-client-link"
import ProductRail, {
  RailProduct,
} from "@modules/store/components/product-rail"
import { fadeUp } from "@lib/util/motion"

export type GoalPanel = {
  id: string
  title: string
  subtitle: string
  description: string
  image: string
  imagePosition: string
  href: string
  products: RailProduct[]
}

/**
 * One goal = one normal-flow section with its OWN parallax (no pinning — the
 * pinned crossfade version overlapped chapters and was scrapped after user
 * testing). Background drifts slower than the scroll, the giant chapter
 * number drifts faster; layout alternates sides per section so the text
 * always sits on the darkened half and the photo's face stays visible.
 */
const GoalSection = ({ panel, index }: { panel: GoalPanel; index: number }) => {
  const sectionRef = useRef<HTMLElement>(null)
  const textLeft = index % 2 === 0

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  })

  // Deliberately strong layer separation: background ±12% + slow zoom, the
  // chapter number races the other way, content drifts a third speed.
  const imageY = useTransform(scrollYProgress, [0, 1], ["-12%", "12%"])
  const imageScale = useTransform(scrollYProgress, [0, 1], [1.05, 1.15])
  const numberY = useTransform(scrollYProgress, [0, 1], [220, -220])
  const contentY = useTransform(scrollYProgress, [0.15, 0.85], [30, -30])

  return (
    <section
      ref={sectionRef}
      className="relative min-h-[80vh] md:min-h-[90vh] overflow-hidden bg-[#0A0B0D] flex items-center py-16 md:py-20"
      data-testid="goal-section"
    >
      {/* Background image with per-section parallax; visible, not buried */}
      <motion.div
        aria-hidden="true"
        style={{ y: imageY, scale: imageScale }}
        className="absolute inset-[-14%]"
      >
        <Image
          src={panel.image}
          alt=""
          fill
          sizes="100vw"
          className="object-cover saturate-[0.35] opacity-55"
          style={{ objectPosition: panel.imagePosition }}
          priority={index === 0}
        />
      </motion.div>

      {/* Side gradient: dark on the text side, photo breathes on the other */}
      <div
        aria-hidden="true"
        className={
          textLeft
            ? "absolute inset-0 bg-gradient-to-r from-[#0A0B0D] via-[#0A0B0D]/75 to-[#0A0B0D]/15"
            : "absolute inset-0 bg-gradient-to-l from-[#0A0B0D] via-[#0A0B0D]/75 to-[#0A0B0D]/15"
        }
      />
      {/* Bottom anchor so the rail always sits on solid ground */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-[#0A0B0D] to-transparent"
      />
      {/* Section light scene — green glow, position varies per section */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(circle at ${
            textLeft ? "18% 30%" : "82% 30%"
          }, rgba(204,255,0,0.07) 0%, rgba(0,0,0,0) 55%)`,
        }}
      />

      {/* Giant stroked chapter number — its own parallax speed */}
      <motion.div
        aria-hidden="true"
        style={{ y: numberY }}
        className={
          "absolute top-[8%] text-[8rem] md:text-[15rem] font-black leading-none pointer-events-none select-none " +
          (textLeft ? "right-[4%]" : "left-[4%]")
        }
      >
        <span
          style={{
            color: "transparent",
            WebkitTextStroke: "1px rgba(204,255,0,0.20)",
          }}
        >
          0{index + 1}
        </span>
      </motion.div>

      {/* Content */}
      <motion.div
        style={{ y: contentY }}
        className="content-container relative z-10 w-full"
      >
        <div
          className={
            "max-w-2xl " + (textLeft ? "" : "md:ml-auto md:text-left")
          }
        >
          <motion.div {...fadeUp}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-[2px] bg-[#ccff00]" />
              <span className="text-[#ccff00] text-xs md:text-sm font-bold tracking-[0.2em]">
                {panel.subtitle} · 0{index + 1}
              </span>
            </div>

            <h2 className="text-4xl md:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[0.95] mb-4">
              {panel.title.includes("&") ? (
                <>
                  {panel.title.split("&")[0].trim()}{" "}
                  <span className="text-[#ccff00]">&</span>{" "}
                  {panel.title.split("&")[1].trim()}
                </>
              ) : (
                panel.title
              )}
            </h2>

            <p className="text-sm md:text-lg text-gray-300 max-w-xl leading-relaxed mb-8">
              {panel.description}
            </p>
          </motion.div>
        </div>

        {/* Top-5 rail — full width under the copy */}
        <motion.div {...fadeUp} className="mb-8">
          <ProductRail products={panel.products} />
        </motion.div>

        <motion.div {...fadeUp}>
          <LocalizedClientLink
            href={panel.href}
            className="inline-flex items-center gap-2 px-7 py-3.5 bg-[#ccff00] text-black font-black uppercase tracking-wider text-sm rounded-lg hover:bg-[#b8ff2b] shadow-[0_0_25px_rgba(204,255,0,0.25)] transition-all duration-200"
          >
            Explore {panel.subtitle.split("/")[0].trim().toLowerCase()} →
          </LocalizedClientLink>
        </motion.div>
      </motion.div>
    </section>
  )
}

export default GoalSection
