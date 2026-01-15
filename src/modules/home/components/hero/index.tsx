"use client"

import { Button, Heading } from "@medusajs/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { motion, AnimatePresence } from "framer-motion"
import { useState, useEffect } from "react"

const Hero = () => {
  const [animationComplete, setAnimationComplete] = useState(false)
  const [showWorkout, setShowWorkout] = useState(false)
  const [workoutPhase, setWorkoutPhase] = useState<
    "typing" | "erasing" | "retyping"
  >("typing")
  const [workoutText, setWorkoutText] = useState("")

  const text = "GEAR UP"
  const workout = "WORKOUT!"

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
          EVERY SEASON
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
              <img
                src="/hero.png"
                alt="Athlete"
                style={{
                  width: "750px",
                  height: "85vh",
                  objectFit: "contain",
                  objectPosition: "center",
                  transform: `translateY(-${(i * 100) / 12}%)`,
                }}
              />
            </motion.div>
          ))}
          {/* Shadow/Grounding at feet */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0a0a0a] to-transparent opacity-80" />
        </div>
      </motion.div>

      {/* 4. FOREGROUND CONTENT (Text Overlay & Buttons) (Z-20) */}

      {/* "WORKOUT" TYPING TEXT (Over the athlete) */}
      <div className="absolute top-[40%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 text-center w-full">
        <div
          className="text-6xl medium:text-8xl font-black text-white tracking-tight drop-shadow-2xl mix-blend-difference"
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
                <span className="animate-pulse inline-block w-[4px] h-[0.8em] bg-[#ccff00] ml-2 align-middle" />
              )}
            </span>
          </motion.div>
        </div>
      </div>

      {/* NEON BUTTONS */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.8,
          delay: 2.8,
          ease: [0.6, 0.05, 0.01, 0.9],
        }}
        className="absolute z-20 flex gap-6"
        style={{
          top: "60%",
          left: "calc(50% - 175px)", // Aligning with athlete center-ish
          transform: "translate(-50%, -50%)",
        }}
      >
        <LocalizedClientLink href="/store">
          <Button
            size="large"
            className="bg-[#ccff00] text-black hover:bg-[#b3e600] px-10 py-5 text-lg font-black italic rounded-none skew-x-[-10deg] shadow-[0_0_30px_rgba(204,255,0,0.3)] hover:shadow-[0_0_50px_rgba(204,255,0,0.6)] transition-all duration-300 border-none"
          >
            <span className="skew-x-[10deg] inline-block">SHOP NOW</span>
          </Button>
        </LocalizedClientLink>
        <Button
          size="large"
          variant="transparent"
          className="bg-transparent border border-white/30 text-white hover:bg-white/10 px-10 py-5 text-lg font-black italic rounded-none skew-x-[-10deg] backdrop-blur-sm transition-all duration-300"
        >
          <span className="skew-x-[10deg] inline-block">EXPLORE ALL</span>
        </Button>
      </motion.div>

      {/* BOTTOM INFO */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 3.0 }}
        className="absolute bottom-12 left-12 z-20 max-w-xs"
      >
        <div className="w-12 h-1 bg-[#ccff00] mb-4" />
        <p className="text-gray-400 text-sm leading-relaxed">
          Stay cozy without compromising your range of motion. Engineered for
          the modern athlete.
        </p>
      </motion.div>

      {/* VIDEO PREVIEW */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 3.2 }}
        className="absolute bottom-12 right-12 z-20 group cursor-pointer"
      >
        <div className="relative w-48 h-28 bg-gray-900 border border-gray-800 rounded overflow-hidden">
          <div className="absolute inset-0 bg-black/40 group-hover:bg-transparent transition-all duration-500" />
          <img
            src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400"
            alt="Video"
            className="w-full h-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-10 h-10 rounded-full border border-[#ccff00] flex items-center justify-center bg-black/50 backdrop-blur-md">
              <div className="w-0 h-0 border-t-[5px] border-t-transparent border-l-[8px] border-l-[#ccff00] border-b-[5px] border-b-transparent ml-1" />
            </div>
          </div>
        </div>
        <div className="text-[#ccff00] text-xs font-bold mt-2 tracking-widest uppercase text-right">
          Watch Film
        </div>
      </motion.div>
    </div>
  )
}

export default Hero
