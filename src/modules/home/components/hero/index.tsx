"use client"

import { Button, Heading } from "@medusajs/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { motion, Variants } from "framer-motion"

const Hero = () => {
  const fadeUp: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: (custom: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        delay: custom * 0.2,
        ease: "easeOut",
      },
    }),
  }

  return (
    <div className="relative w-full h-[90vh] overflow-hidden bg-black text-white">
      {/* 1. BACKGROUND IMAGE */}
      <div className="absolute inset-0 z-0">
        <motion.img
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 2.5, ease: "easeOut" }}
          src="https://pub-180ab5eb49854df5a790e2b99c1c0be9.r2.dev/onyxgenetics/Hero_img.jpeg"
          alt="Research Background"
          className="w-full h-full object-cover opacity-80"
        />

        {/* Mobile: darken the image by 60%, Desktop: rely on gradient */}
        <div className="absolute inset-0 bg-black/60 small:bg-transparent" />
        {/* Powerful gradient from left to right, so text is always black */}
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 small:via-black/60 to-transparent" />
        {/* Gradient from bottom to top */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
      </div>

      {/* 2. CONTENT CONTAINER */}
      <div className="relative z-10 h-full content-container flex flex-col justify-center items-start max-w-[1440px] mx-auto px-6 small:px-12">
        <motion.div
          custom={0}
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="mb-6 inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-gray-800 bg-gray-950/50 backdrop-blur-md"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-[10px] font-mono font-bold text-gray-300 uppercase tracking-[0.2em]">
            Verified Lab Grade • USA Shipping
          </span>
        </motion.div>

        <motion.div
          custom={1}
          initial="hidden"
          animate="visible"
          variants={fadeUp}
        >
          <Heading
            level="h1"
            className="text-5xl small:text-8xl font-black uppercase tracking-tighter leading-[0.9] mb-6"
          >
            Uncompromised <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-100 via-gray-300 to-gray-500">
              Purity
            </span>
          </Heading>
        </motion.div>

        <motion.div
          custom={2}
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="max-w-lg mb-10"
        >
          <h3 className="text-xl font-bold mb-3 text-white tracking-wide drop-shadow-md">
            PREMIUM GRADE COMPOUNDS.
          </h3>
          <p className="text-lg text-gray-200 leading-relaxed font-light drop-shadow-md">
            The highest purity standard available on the market. Rigorously
            tested (HPLC), verified potency, and secure shipping across the US.
          </p>
        </motion.div>

        {/* Buttons */}
        <motion.div
          custom={3}
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="flex flex-col small:flex-row gap-4 w-full small:w-auto"
        >
          <LocalizedClientLink href="/store">
            <Button className="w-full small:w-auto px-10 py-4 h-14 text-sm font-bold uppercase tracking-widest bg-white text-black hover:bg-gray-200 hover:scale-105 transition-transform duration-300 rounded-none border-none">
              Shop Catalog
            </Button>
          </LocalizedClientLink>

          <a
            href={process.env.NEXT_PUBLIC_WHATSAPP_URL ?? ""}
            target="_blank"
            rel="noreferrer"
          >
            <Button
              variant="secondary"
              className="w-full small:w-auto px-10 py-4 h-14 text-sm font-bold uppercase tracking-widest bg-transparent border border-gray-600 text-white hover:border-white hover:text-black hover:bg-white transition-all duration-300 rounded-none"
            >
              Contact Support
            </Button>
          </a>
        </motion.div>
      </div>

      {/* 3. TECHNICAL FOOTER (Ticker) */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="absolute bottom-0 left-0 right-0 z-20 border-t border-white/5 bg-black/80 backdrop-blur-sm"
      >
        <div className="content-container py-4 flex flex-col small:flex-row justify-between items-center text-gray-500 text-[10px] font-mono uppercase tracking-[0.2em] px-6">
          <div className="flex gap-6 mb-2 small:mb-0">
            <span className="flex items-center gap-2">
              <span className="text-emerald-500">●</span> 99.8% PURITY
              GUARANTEED
            </span>
            <span className="flex items-center gap-2 hidden small:flex">
              <span className="text-emerald-500">●</span> HPLC TESTED
            </span>
            <span className="flex items-center gap-2">
              <span className="text-emerald-500">●</span> SECURE & DISCRETE
            </span>
          </div>
          <div className="opacity-50">EST. 2025 // RESEARCH USE ONLY</div>
        </div>
      </motion.div>
    </div>
  )
}

export default Hero
