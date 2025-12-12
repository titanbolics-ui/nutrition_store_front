"use client"

import { Button, Heading } from "@medusajs/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { motion } from "framer-motion"
import { Variants } from "framer-motion"

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
      {/* 1. BACKGROUND IMAGE WITH ZOOM EFFECT */}
      <div className="absolute inset-0 z-0">
        <motion.img
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 2.5, ease: "easeOut" }}
          src="https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?q=80&w=2574&auto=format&fit=crop"
          alt="Performance Background"
          className="w-full h-full object-cover opacity-50 grayscale"
        />
        {/* Градієнти для читабельності */}
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
      </div>

      {/* 2. CONTENT CONTAINER */}
      <div className="relative z-10 h-full content-container flex flex-col justify-center items-start max-w-[1440px] mx-auto px-6 small:px-12">
        {/* Animated Badge */}
        <motion.div
          custom={0} // черга 1
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="mb-6 inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-gray-700 bg-gray-900/60 backdrop-blur-md"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
          </span>
          <span className="text-[10px] font-mono font-bold text-gray-300 uppercase tracking-[0.2em]">
            Premium Lab Grade • USA Shipping
          </span>
        </motion.div>

        {/* Headline */}
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
            Unleash Your <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-200 via-gray-400 to-gray-600">
              True Potential
            </span>
          </Heading>
        </motion.div>

        {/* Subtext */}
        <motion.p
          custom={2}
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="text-lg small:text-xl text-gray-400 max-w-lg mb-10 leading-relaxed font-light tracking-wide"
        >
          Elite pharmacology for serious athletes. Pure compounds, verified
          potency, and discrete delivery directly to your door.
        </motion.p>

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
              WhatsApp
            </Button>
          </a>
        </motion.div>
      </div>

      {/* 3. TECHNICAL FOOTER (Ticker) */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="absolute bottom-0 left-0 right-0 z-20 border-t border-white/10 bg-black/60 backdrop-blur-md"
      >
        <div className="content-container py-5 flex flex-col small:flex-row justify-between items-center text-gray-500 text-[10px] font-mono uppercase tracking-[0.2em] px-6">
          <div className="flex gap-8 mb-2 small:mb-0">
            <span className="flex items-center gap-2">
              <span className="text-green-500">●</span> 99.8% PURITY GUARANTEED
            </span>
            <span className="flex items-center gap-2 hidden small:flex">
              <span className="text-green-500">●</span> HPLC TESTED
            </span>
            <span className="flex items-center gap-2">
              <span className="text-green-500">●</span> SECURE PAYMENT
            </span>
          </div>
          <div>EST. 2025 // NO COMPROMISE</div>
        </div>
      </motion.div>
    </div>
  )
}

export default Hero
