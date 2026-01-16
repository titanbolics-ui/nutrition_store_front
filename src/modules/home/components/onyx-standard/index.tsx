"use client"

import { motion } from "framer-motion"

const features = [
  {
    id: "quality",
    icon: (
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
    ),
    title: "PHARMACEUTICAL GRADE",
    description:
      "Direct from the ZPHC factory. No bathtub brews, no underdosed gear. Every batch is HPLC tested for >99% purity and sterility.",
  },
  {
    id: "guarantee",
    icon: (
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
    ),
    title: "SEIZURE INSURANCE",
    description:
      "We guarantee delivery. If your package is seized by customs or lost in transit, we re-ship your entire order 100% FREE of charge.",
  },
  {
    id: "privacy",
    icon: (
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
    ),
    title: "TOTAL ANONYMITY",
    description:
      "Stealth shipping protocols. Plain boxes with no logos or medical labels. Your data is encrypted and deleted after delivery.",
  },
]

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
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12 md:mb-20"
        >
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="w-12 h-[1px] bg-[#ccff00]/50" />
            <span className="text-[#ccff00] text-xs font-mono uppercase tracking-[0.3em]">
              Why Choose Us
            </span>
            <div className="w-12 h-[1px] bg-[#ccff00]/50" />
          </div>
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-black text-white uppercase tracking-tight">
            THE ONYX{" "}
            <span className="text-[#ccff00]">STANDARD</span>
          </h2>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              viewport={{ once: true }}
              className="group relative"
            >
              {/* Card */}
              <div className="relative h-full p-6 md:p-8 bg-[#0a0a0a] border border-gray-800 rounded-xl hover:border-[#ccff00]/30 transition-all duration-500">
                {/* Hover Glow */}
                <div className="absolute inset-0 bg-gradient-to-b from-[#ccff00]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl" />

                {/* Content */}
                <div className="relative z-10">
                  {/* Icon */}
                  <div className="text-[#ccff00] mb-6 group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </div>

                  {/* Number */}
                  <div className="absolute top-6 right-6 text-6xl md:text-7xl font-black text-white/5 leading-none">
                    0{index + 1}
                  </div>

                  {/* Title */}
                  <h3 className="text-lg md:text-xl font-black text-white uppercase tracking-wide mb-4 group-hover:text-[#ccff00] transition-colors duration-300">
                    {feature.title}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-400 text-sm md:text-base leading-relaxed">
                    {feature.description}
                  </p>
                </div>

                {/* Bottom Accent Line */}
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#ccff00]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom Trust Indicators */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          viewport={{ once: true }}
          className="mt-12 md:mt-16 pt-8 border-t border-gray-800/50"
        >
          <div className="flex flex-wrap justify-center items-center gap-6 md:gap-12 text-gray-500">
            <div className="flex items-center gap-2">
              <span className="text-[#ccff00]">✓</span>
              <span className="text-xs md:text-sm uppercase tracking-wider">
                10,000+ Orders Shipped
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[#ccff00]">✓</span>
              <span className="text-xs md:text-sm uppercase tracking-wider">
                99.8% Delivery Rate
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[#ccff00]">✓</span>
              <span className="text-xs md:text-sm uppercase tracking-wider">
                5-Star Reviews
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default OnyxStandard

