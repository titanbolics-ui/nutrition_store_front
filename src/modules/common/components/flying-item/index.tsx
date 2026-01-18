"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { useFlyToCart } from "@lib/context/fly-to-cart-context"

const FlyingItem = () => {
  const { flyingItem, onAnimationComplete } = useFlyToCart()

  if (!flyingItem) return null

  const { imageSrc, startX, startY, endX, endY } = flyingItem

  // Calculate the control point for a nice arc
  const midX = (startX + endX) / 2
  const midY = Math.min(startY, endY) - 150 // Arc goes higher

  return (
    <motion.div
      key={flyingItem.id}
      className="fixed z-[9999] pointer-events-none"
      initial={{
        left: startX - 30,
        top: startY - 30,
        scale: 1,
        opacity: 1,
      }}
      animate={{
        left: [startX - 30, midX - 25, endX - 15],
        top: [startY - 30, midY - 25, endY - 15],
        scale: [1, 0.7, 0.2],
        opacity: [1, 1, 0],
      }}
      transition={{
        duration: 0.7,
        ease: [0.25, 0.1, 0.25, 1],
        times: [0, 0.6, 1],
      }}
      onAnimationComplete={onAnimationComplete}
    >
      {/* Product thumbnail */}
      <div className="w-[60px] h-[60px] bg-white rounded-xl shadow-2xl overflow-hidden border-2 border-[#ccff00]">
        {imageSrc ? (
          <div className="relative w-full h-full">
            <Image
              src={imageSrc}
              alt="Product"
              fill
              className="object-contain p-1"
              sizes="60px"
              unoptimized
            />
          </div>
        ) : (
          <div className="w-full h-full bg-[#ccff00] flex items-center justify-center">
            <svg
              className="w-6 h-6 text-black"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        )}
      </div>
      {/* Glow trail */}
      <motion.div
        className="absolute inset-0 rounded-xl"
        initial={{ boxShadow: "0 0 0 0 rgba(204, 255, 0, 0.8)" }}
        animate={{
          boxShadow: [
            "0 0 0 0 rgba(204, 255, 0, 0.8)",
            "0 0 30px 15px rgba(204, 255, 0, 0.4)",
            "0 0 0 0 rgba(204, 255, 0, 0)",
          ],
        }}
        transition={{ duration: 0.7 }}
      />
    </motion.div>
  )
}

export default FlyingItem

