"use client"

import { Button, Heading } from "@medusajs/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { useState, useEffect } from "react"

const Hero = () => {
  const [animationComplete, setAnimationComplete] = useState(false)
  const [showWorkout, setShowWorkout] = useState(false)
  const [workoutPhase, setWorkoutPhase] = useState<
    "typing" | "erasing" | "retyping"
  >("typing")
  const [workoutText, setWorkoutText] = useState("")

  const text = "GENETICS"
  const workout = "UNLOCK YOUR POTENTIAL"

  // Typing/Erasing animation for WORKOUT
  useEffect(() => {
    if (!showWorkout) return

    const typeWorkout = () => {
      let currentIndex = 0
      const typingInterval = setInterval(() => {
        if (currentIndex <= workout.length) {
          setWorkoutText(workout.slice(0, currentIndex))
          currentIndex++
        } else {
          clearInterval(typingInterval)
          // Wait before erasing
          setTimeout(() => {
            setWorkoutPhase("erasing")
          }, 500)
        }
      }, 100)
    }

    const eraseWorkout = () => {
      const targetLength = Math.floor(workout.length / 2)
      let currentIndex = workout.length
      const erasingInterval = setInterval(() => {
        if (currentIndex > targetLength) {
          setWorkoutText(workout.slice(0, currentIndex))
          currentIndex--
        } else {
          clearInterval(erasingInterval)
          // Wait before retyping
          setTimeout(() => {
            setWorkoutPhase("retyping")
          }, 300)
        }
      }, 50)
    }

    const retypeWorkout = () => {
      const startLength = Math.floor(workout.length / 2)
      let currentIndex = startLength
      const retypingInterval = setInterval(() => {
        if (currentIndex <= workout.length) {
          setWorkoutText(workout.slice(0, currentIndex))
          currentIndex++
        } else {
          clearInterval(retypingInterval)
          setAnimationComplete(true)
        }
      }, 100)
    }

    if (workoutPhase === "typing") {
      typeWorkout()
    } else if (workoutPhase === "erasing") {
      eraseWorkout()
    } else if (workoutPhase === "retyping") {
      retypeWorkout()
    }
  }, [showWorkout, workoutPhase, workout])

  return (
    <div className="relative w-full h-[90vh] overflow-hidden bg-[#0a0a0a] text-white selection:bg-[#ccff00] selection:text-black">
      {/* 1. BACKGROUND & LIGHTING */}
      <div className="absolute inset-0 z-0">
        {/* Radial Spotlight */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-gray-800/30 via-[#0a0a0a] to-[#0a0a0a]" />

        {/* Grid Texture */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)`,
            backgroundSize: "4rem 4rem",
          }}
        />
      </div>

      {/* 2. HUGE BACKGROUND TEXT (Magazine Layering) - BEHIND ATHLETE */}
      <div className="absolute inset-0 z-0 flex flex-col items-center justify-start pt-24 pointer-events-none">
        <div className="text-[12vw] leading-[0.85] font-black text-white/5 tracking-tighter mix-blend-overlay">
          {text.split("").map((char, i) => (
            <motion.span
              key={i}
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{
                duration: 0.8,
                delay: 0.5 + i * 0.1,
                ease: [0.6, 0.05, 0.01, 0.9],
              }}
              className="inline-block"
            >
              {char}
            </motion.span>
          ))}
        </div>
        <div className="text-[12vw] leading-[0.85] font-black text-transparent bg-clip-text bg-gradient-to-b from-white/10 to-transparent tracking-tighter mt-[-2vw]">
          EVOLUTION
        </div>
      </div>

      {/* 3. ATHLETE IMAGE (Z-10) */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{
          duration: 0.5,
          delay: 1.5,
        }}
        className="absolute z-10"
        style={{
          width: "750px",
          height: "85vh",
          top: "60%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }}
      >
        <div className="relative w-full h-full">
          {/* Venetian Blinds Strips */}
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{
                duration: 0.6,
                delay: 1.5 + i * 0.08,
                ease: "easeOut",
              }}
              style={{
                position: "absolute",
                top: `${(i * 100) / 12}%`,
                left: 0,
                right: 0,
                height: `${100 / 12}%`,
                originY: 0,
                overflow: "hidden",
              }}
            >
              <Image
                src="https://pub-180ab5eb49854df5a790e2b99c1c0be9.r2.dev/onyxgenetics/hero.webp"
                alt="Athlete"
                width={750}
                height={1000}
                className="object-contain object-center"
                style={{
                  width: "750px",
                  height: "85vh",
                  transform: `translateY(-${(i * 100) / 12}%)`,
                }}
                priority
              />
            </motion.div>
          ))}
          {/* Shadow/Grounding at feet */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0a0a0a] to-transparent opacity-80" />
        </div>
      </motion.div>

      {/* 4. FOREGROUND CONTENT (Text Overlay & Buttons) (Z-20) */}

      {/* "WORKOUT" TYPING TEXT (Over the athlete) */}
      <div className="absolute top-[38%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 text-center w-full px-4">
        <div
          className="text-4xl sm:text-5xl md:text-6xl lg:text-8xl font-black text-white tracking-tight drop-shadow-2xl mix-blend-difference leading-[1.1]"
          onAnimationEnd={() => setShowWorkout(true)} // Trigger logic shim
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.2 }}
            onAnimationComplete={() => setShowWorkout(true)}
          >
            <span className="relative">
              {workoutText}
              {!animationComplete && (
                <span className="animate-pulse inline-block w-[3px] sm:w-[4px] h-[0.8em] bg-[#ccff00] ml-1 sm:ml-2 align-middle" />
              )}
            </span>
          </motion.div>
        </div>
      </div>

      {/* NEON BUTTONS - Centered on screen */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.8,
          delay: 2.8,
          ease: [0.6, 0.05, 0.01, 0.9],
        }}
        className="absolute z-20 left-0 right-0 flex flex-col md:flex-row gap-3 md:gap-6 items-center justify-center px-4 md:px-0"
        style={{
          top: "52%",
          transform: "translateY(-50%)",
        }}
      >
        <LocalizedClientLink
          href="/store"
          className="w-full max-w-[280px] md:w-auto md:max-w-none"
        >
          <Button
            size="large"
            className="w-full md:w-auto bg-[#ccff00] text-black hover:bg-[#b3e600] px-8 md:px-10 py-4 md:py-5 text-base md:text-lg font-black italic rounded-none md:skew-x-[-10deg] shadow-[0_0_30px_rgba(204,255,0,0.3)] hover:shadow-[0_0_50px_rgba(204,255,0,0.6)] transition-all duration-300 border-none"
          >
            <span className="md:skew-x-[10deg] inline-block">
              START YOUR CYCLE
            </span>
          </Button>
        </LocalizedClientLink>
        <LocalizedClientLink
          href="/store"
          className="w-full max-w-[280px] md:w-auto md:max-w-none"
        >
          <Button
            size="large"
            variant="transparent"
            className="w-full md:w-auto bg-transparent border border-white/30 text-white hover:bg-white/10 px-8 md:px-10 py-4 md:py-5 text-base md:text-lg font-black italic rounded-none md:skew-x-[-10deg] backdrop-blur-sm transition-all duration-300"
          >
            <span className="md:skew-x-[10deg] inline-block">EXPLORE ALL</span>
          </Button>
        </LocalizedClientLink>
      </motion.div>

      {/* TRUST BADGE - Social Proof */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 3.2 }}
        className="absolute bottom-4 right-4 md:bottom-12 md:right-12 z-20"
      >
        <div className="backdrop-blur-md bg-black/60 border border-gray-700/50 rounded-xl p-3 md:p-4 space-y-2 md:space-y-3 max-w-[200px] md:max-w-xs">
          {/* Rating */}
          <div className="flex items-center gap-2">
            <span className="text-[#ccff00] text-lg">⭐</span>
            <div>
              <span className="text-white font-bold text-sm">4.9/5</span>
              <span className="text-gray-400 text-xs ml-1">Rating</span>
            </div>
          </div>

          {/* Delivery Guarantee */}
          <div className="flex items-center gap-2">
            <span className="text-[#ccff00] text-lg">📦</span>
            <div>
              <span className="text-white font-bold text-sm">100%</span>
              <span className="text-gray-400 text-xs ml-1">Delivery</span>
            </div>
          </div>

          {/* Lab Tested */}
          <div className="flex items-center gap-2">
            <span className="text-[#ccff00] text-lg">🔬</span>
            <div>
              <span className="text-white font-bold text-sm">&gt;98%</span>
              <span className="text-gray-400 text-xs ml-1">Purity</span>
            </div>
          </div>

          {/* Verified Badge */}
          <div className="pt-2 border-t border-gray-700/50">
            <div className="flex items-center gap-1 text-[#ccff00] text-[10px] md:text-xs font-bold tracking-wider">
              <span>✓</span>
              <span>VERIFIED QUALITY</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default Hero
