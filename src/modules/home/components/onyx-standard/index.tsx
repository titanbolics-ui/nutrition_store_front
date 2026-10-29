"use client"

import { motion } from "framer-motion"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import CountUp from "@modules/common/components/count-up"
import { fadeUp, staggerContainer, fadeUpChild } from "@lib/util/motion"

const ShieldIcon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="w-10 h-10 md:w-12 md:h-12"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z"
    />
  </svg>
)

const BeakerIcon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="w-10 h-10 md:w-12 md:h-12"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9.75 3.104v5.714a2.25 2.25 0 0 1-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 0 1 4.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0 1 12 15a9.065 9.065 0 0 1-6.23.693L5 15.3m14.8 0 .21 1.047a2.118 2.118 0 0 1-1.536 2.506l-5.34 1.336a2.25 2.25 0 0 1-1.135 0l-5.34-1.336a2.118 2.118 0 0 1-1.536-2.506L5 15.3"
    />
  </svg>
)

const EyeOffIcon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="w-10 h-10 md:w-12 md:h-12"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88"
    />
  </svg>
)

const OnyxStandard = () => {
  return (
    <section className="relative bg-black py-16 md:py-24 overflow-hidden">
      {/* Background Grid */}
      <div
        className="absolute inset-0 opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)`,
          backgroundSize: "4rem 4rem",
        }}
      />

      {/* Accent Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-[#ccff00]/5 blur-[150px] rounded-full pointer-events-none" />

      <div className="content-container relative z-10">
        {/* Section Header */}
        <motion.div {...fadeUp} className="text-center mb-12 md:mb-20">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="w-12 h-[1px] bg-[#ccff00]/50" />
            <span className="text-[#ccff00] text-xs font-mono uppercase tracking-[0.3em]">
              Why Choose Us
            </span>
            <div className="w-12 h-[1px] bg-[#ccff00]/50" />
          </div>
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-black text-white uppercase tracking-tight">
            THE ONYX <span className="text-[#ccff00]">STANDARD</span>
          </h2>
        </motion.div>

        {/* Bento Grid: the guarantee is the strongest offer — it gets the big cell */}
        <motion.div
          {...staggerContainer}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8"
        >
          {/* 01 — Seizure Insurance (large, 2 columns) */}
          <motion.div {...fadeUpChild} className="group relative md:col-span-2">
            <div className="relative h-full p-8 md:p-12 bg-[#0a0a0a] border border-[#ccff00]/25 rounded-xl hover:border-[#ccff00]/50 transition-all duration-500 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-[#ccff00]/[0.07] to-transparent pointer-events-none" />
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-[#ccff00]">{ShieldIcon}</span>
                  <span className="text-[#ccff00] font-mono text-[11px] uppercase tracking-[0.3em]">
                    Our guarantee
                  </span>
                </div>
                <div className="absolute top-0 right-0 text-7xl md:text-8xl font-black text-white/5 leading-none">
                  01
                </div>
                <h3 className="text-2xl md:text-3xl font-black text-white uppercase tracking-wide mb-4 group-hover:text-[#ccff00] transition-colors duration-300">
                  Seizure Insurance
                </h3>
                <p className="text-gray-400 text-base md:text-lg leading-relaxed max-w-xl">
                  We guarantee delivery. If your package is seized by customs or
                  lost in transit, we re-ship your entire order 100% FREE of
                  charge.
                </p>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#ccff00]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>
          </motion.div>

          {/* 02 — Total Anonymity */}
          <motion.div {...fadeUpChild} className="group relative">
            <div className="relative h-full p-6 md:p-8 bg-[#0a0a0a] border border-gray-800 rounded-xl hover:border-[#ccff00]/30 transition-all duration-500">
              <div className="absolute inset-0 bg-gradient-to-b from-[#ccff00]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl" />
              <div className="relative z-10">
                <div className="text-[#ccff00] mb-6 group-hover:scale-110 transition-transform duration-300">
                  {EyeOffIcon}
                </div>
                <div className="absolute top-6 right-6 text-6xl md:text-7xl font-black text-white/5 leading-none">
                  02
                </div>
                <h3 className="text-lg md:text-xl font-black text-white uppercase tracking-wide mb-4 group-hover:text-[#ccff00] transition-colors duration-300">
                  Total Anonymity
                </h3>
                <p className="text-gray-400 text-sm md:text-base leading-relaxed">
                  Stealth shipping protocols. Plain boxes with no logos or
                  medical labels. Your data is encrypted and deleted after
                  delivery.
                </p>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#ccff00]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>
          </motion.div>

          {/* 03 — Pharmaceutical Grade (wide, honest GMP framing) */}
          <motion.div {...fadeUpChild} className="group relative md:col-span-3">
            <div className="relative h-full p-6 md:p-8 bg-[#0a0a0a] border border-gray-800 rounded-xl hover:border-[#ccff00]/30 transition-all duration-500">
              <div className="absolute inset-0 bg-gradient-to-b from-[#ccff00]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl" />
              <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-6">
                <div className="text-[#ccff00] shrink-0 group-hover:scale-110 transition-transform duration-300">
                  {BeakerIcon}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg md:text-xl font-black text-white uppercase tracking-wide mb-2 group-hover:text-[#ccff00] transition-colors duration-300">
                    Pharmaceutical Grade
                  </h3>
                  <p className="text-gray-400 text-sm md:text-base leading-relaxed max-w-3xl">
                    Direct from GMP-certified pharma factories with in-house QC
                    labs. No bathtub brews, no underdosed gear — and we send
                    random batches for independent verification.
                  </p>
                </div>
                <LocalizedClientLink
                  href="/lab-results"
                  className="shrink-0 inline-flex items-center justify-center px-6 py-3 border border-white/25 text-white font-bold uppercase tracking-wide text-xs rounded-lg hover:border-[#ccff00] hover:text-[#ccff00] transition-all duration-200"
                >
                  See the reports
                </LocalizedClientLink>
                <div className="absolute top-0 right-0 text-6xl md:text-7xl font-black text-white/5 leading-none pointer-events-none">
                  03
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#ccff00]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>
          </motion.div>
        </motion.div>

        {/* Bottom Trust Indicators */}
        <motion.div
          {...fadeUp}
          className="mt-12 md:mt-16 pt-8 border-t border-gray-800/50"
        >
          <div className="flex flex-wrap justify-center items-center gap-6 md:gap-12 text-gray-500">
            <div className="flex items-center gap-2">
              <span className="text-[#ccff00]">✓</span>
              <span className="text-xs md:text-sm uppercase tracking-wider">
                <CountUp
                  value={10000}
                  suffix="+"
                  className="text-white font-bold"
                />{" "}
                Warehouse Shipments
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[#ccff00]">✓</span>
              <span className="text-xs md:text-sm uppercase tracking-wider">
                <CountUp
                  value={99.8}
                  decimals={1}
                  suffix="%"
                  className="text-white font-bold"
                />{" "}
                Delivery Rate
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[#ccff00]">✓</span>
              <span className="text-xs md:text-sm uppercase tracking-wider">
                Independently verified by Janoshik Analytics
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default OnyxStandard
