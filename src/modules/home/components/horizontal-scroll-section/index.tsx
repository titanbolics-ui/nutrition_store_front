"use client"

import { motion, useScroll, useTransform, useSpring } from "framer-motion"
import { useRef, useState } from "react"
import Image from "next/image"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

interface CategoryCard {
  id: string
  title: string
  subtitle: string
  description: string
  image: string
  href: string
  accent: string
  products: string[]
  isExploreAll?: boolean
}

const categories: CategoryCard[] = [
  {
    id: "bulking",
    title: "MASS & STRENGTH",
    subtitle: "BULKING CYCLE",
    description:
      "Build serious mass and raw power with proven anabolic compounds designed for maximum muscle growth.",
    image:
      "https://pub-180ab5eb49854df5a790e2b99c1c0be9.r2.dev/onyxgenetics/muscle.jpg",
    href: "/collections/bulking",
    accent: "#ccff00",
    products: ["Test", "Deca", "D-bol", "Anadrol"],
  },
  {
    id: "cutting",
    title: "LEAN & SHREDDED",
    subtitle: "CUTTING CYCLE",
    description:
      "Get competition-ready with compounds that preserve muscle while torching fat. Veins, striations, the works.",
    image:
      "https://pub-180ab5eb49854df5a790e2b99c1c0be9.r2.dev/onyxgenetics/Esthetic.jpg",
    href: "/collections/cutting",
    accent: "#00d4ff",
    products: ["Masteron", "Tren", "Winstrol", "Clenbuterol"],
  },
  {
    id: "peptides",
    title: "PEPTIDES & GLP-1",
    subtitle: "FAT LOSS / HEALING",
    description:
      "Next-generation peptides for accelerated fat loss, tissue repair, and metabolic optimization.",
    image:
      "https://pub-180ab5eb49854df5a790e2b99c1c0be9.r2.dev/onyxgenetics/model_female.jpg",
    href: "/categories/peptides",
    accent: "#ff6b9d",
    products: ["Tirzepatide", "Semaglutide", "BPC-157"],
  },
  {
    id: "antiaging",
    title: "ANTI-AGING & HGH",
    subtitle: "LONGEVITY",
    description:
      "Turn back the clock with growth hormone and TRT protocols. Look better, feel younger, perform at any age.",
    image:
      "https://pub-180ab5eb49854df5a790e2b99c1c0be9.r2.dev/onyxgenetics/silver_fox.jpg",
    href: "/collections/longevity",
    accent: "#ff6b35",
    products: ["HGH Kits", "TRT Doses", "MK-677"],
  },
  {
    id: "explore",
    title: "NOT SURE?",
    subtitle: "EXPLORE EVERYTHING",
    description:
      "Browse our complete catalog. Find the perfect compound for your goals with our guided selection.",
    image:
      "https://pub-180ab5eb49854df5a790e2b99c1c0be9.r2.dev/onyxgenetics/hero.webp",
    href: "/store",
    accent: "#a855f7",
    products: ["All Products", "Best Sellers", "New Arrivals"],
    isExploreAll: true,
  },
]

const HorizontalScrollSection = () => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [hoveredCard, setHoveredCard] = useState<string | null>(null)

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  })

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  })

  // Horizontal scroll transform - stops at last card and holds it
  const x = useTransform(smoothProgress, [0, 0.85, 1], ["0%", "-80%", "-80%"])

  return (
    <section
      ref={containerRef}
      className="relative bg-[#0a0a0a]"
      style={{ height: "600vh" }} // Extra height so last card stays visible longer
    >
      {/* Fixed Container for Horizontal Scroll */}
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        {/* Background Grid */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)`,
            backgroundSize: "4rem 4rem",
          }}
        />

        {/* Section Header - Fixed */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="absolute top-16 left-4 md:top-20 md:left-8 z-30"
        >
          <div className="flex items-center gap-2 md:gap-4">
            <div className="w-6 md:w-12 h-[2px] bg-[#ccff00]" />
            <span className="text-[#ccff00] text-xs md:text-sm font-bold tracking-[0.2em] md:tracking-[0.3em]">
              CATEGORIES
            </span>
          </div>
        </motion.div>

        {/* Progress Indicator */}
        <div className="absolute top-16 right-4 md:top-20 md:right-8 z-30 flex items-center gap-2 md:gap-4">
          <div className="flex gap-1 md:gap-2">
            {categories.map((cat, i) => (
              <motion.div
                key={cat.id}
                className="w-4 md:w-8 h-1 bg-white/20 rounded-full overflow-hidden"
              >
                <motion.div
                  className="h-full rounded-full"
                  style={{
                    backgroundColor: cat.accent,
                    scaleX: useTransform(
                      smoothProgress,
                      [(i * 0.85) / 5, ((i + 1) * 0.85) / 5],
                      [0, 1]
                    ),
                    transformOrigin: "left",
                  }}
                />
              </motion.div>
            ))}
          </div>
          <span className="text-white/50 text-xs md:text-sm font-mono">
            <motion.span>
              {categories.map((_, i) => {
                const isLast = i === categories.length - 1
                const start = (i * 0.85) / 5
                const mid = ((i + 0.5) * 0.85) / 5
                const end = isLast ? 1.1 : ((i + 1) * 0.85) / 5
                return (
                  <motion.span
                    key={i}
                    style={{
                      display: useTransform(
                        smoothProgress,
                        [start, mid, end],
                        ["none", "inline", "none"]
                      ) as any,
                    }}
                  >
                    0{i + 1}
                  </motion.span>
                )
              })}
            </motion.span>
            /05
          </span>
        </div>

        {/* Horizontal Scrolling Cards Container */}
        <motion.div
          style={{ x }}
          className="flex h-full w-[500vw]" // 5 cards x 100vw each
        >
          {categories.map((category, index) => (
            <div
              key={category.id}
              className="relative w-screen h-full flex items-center justify-center px-4 md:px-8"
              onMouseEnter={() => setHoveredCard(category.id)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              {/* Card Container - Vertical on mobile, horizontal on desktop */}
              <div className="relative w-full max-w-6xl h-[85vh] md:h-[75vh] flex flex-col md:flex-row pt-20 md:pt-8">
                {/* Left Side - Image */}
                <motion.div
                  className="relative w-full md:w-1/2 h-[35vh] md:h-full overflow-hidden flex-shrink-0"
                  initial={{ opacity: 0, x: -100 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                >
                  {/* Image Container with Clip Path */}
                  <div
                    className="absolute inset-0 md:clip-path-none"
                    style={{
                      clipPath: "polygon(0 0, 100% 0, 100% 90%, 0 100%)",
                    }}
                  >
                    <Image
                      src={category.image}
                      alt={category.title}
                      fill
                      className="object-cover object-top"
                      sizes="(max-width: 768px) 100vw, 50vw"
                      priority={index < 2}
                    />
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-b md:bg-gradient-to-r from-transparent via-transparent to-[#0a0a0a]" />
                    <div
                      className="absolute inset-0 opacity-30"
                      style={{
                        background: `linear-gradient(135deg, ${category.accent}20 0%, transparent 50%)`,
                      }}
                    />
                  </div>

                  {/* Floating Number - Hidden on mobile */}
                  <div
                    className="hidden md:block absolute -right-16 top-1/2 -translate-y-1/2 text-[20rem] font-black leading-none pointer-events-none select-none"
                    style={{
                      color: "transparent",
                      WebkitTextStroke: `1px ${category.accent}30`,
                    }}
                  >
                    0{index + 1}
                  </div>

                  {/* Mobile Number Badge */}
                  <div
                    className="md:hidden absolute top-4 left-4 text-6xl font-black pointer-events-none"
                    style={{ color: category.accent, opacity: 0.3 }}
                  >
                    0{index + 1}
                  </div>
                </motion.div>

                {/* Right Side - Content */}
                <motion.div
                  className="relative w-full md:w-1/2 flex-1 md:h-full flex flex-col justify-start md:justify-center px-2 md:pl-16 pt-4 md:pt-0"
                  initial={{ opacity: 0, x: 100 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                >
                  {/* Subtitle */}
                  <motion.div
                    className="flex items-center gap-2 md:gap-3 mb-2 md:mb-4"
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <div
                      className="w-6 md:w-8 h-[2px]"
                      style={{ backgroundColor: category.accent }}
                    />
                    <span
                      className="text-xs md:text-sm font-bold tracking-[0.15em] md:tracking-[0.2em]"
                      style={{ color: category.accent }}
                    >
                      {category.subtitle}
                    </span>
                  </motion.div>

                  {/* Title - Simple on mobile, animated on desktop */}
                  <motion.h2
                    className="text-3xl md:text-7xl font-black text-white mb-3 md:mb-6 tracking-tight leading-[1.1] md:leading-[0.95]"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                  >
                    {category.title.includes("&") ? (
                      <>
                        <span className="block">
                          {category.title.split("&")[0].trim()}{" "}
                          <span style={{ color: category.accent }}>&</span>
                        </span>
                        <span className="block">
                          {category.title.split("&")[1].trim()}
                        </span>
                      </>
                    ) : (
                      category.title
                    )}
                  </motion.h2>

                  {/* Description */}
                  <motion.p
                    className="text-sm md:text-lg text-gray-400 mb-4 md:mb-8 max-w-md leading-relaxed"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    {category.description}
                  </motion.p>

                  {/* Products Row */}
                  <motion.div
                    className="mb-4 md:mb-10"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <div className="text-[10px] md:text-xs text-gray-500 uppercase tracking-wider mb-2 md:mb-3">
                      {category.isExploreAll ? "Browse" : "Popular Products"}
                    </div>
                    <div className="flex flex-wrap gap-1.5 md:gap-2">
                      {category.products.map((product, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-1.5 md:px-4 md:py-2 text-xs md:text-sm font-bold border transition-all duration-300 hover:scale-105 cursor-default"
                          style={{
                            borderColor: `${category.accent}50`,
                            color: category.accent,
                            backgroundColor: `${category.accent}10`,
                          }}
                        >
                          {product}
                        </span>
                      ))}
                    </div>
                  </motion.div>

                  {/* CTA Button */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                  >
                    <LocalizedClientLink href={category.href}>
                      <button
                        className="group relative w-full md:w-auto px-6 py-3 md:px-10 md:py-5 font-black text-sm md:text-lg tracking-wider overflow-hidden transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]"
                        style={{
                          backgroundColor: category.accent,
                          border: `2px solid ${category.accent}`,
                          color: "#0a0a0a",
                        }}
                      >
                        <span className="relative z-10">
                          {category.isExploreAll ? "VIEW ALL" : "EXPLORE"}
                        </span>
                        <span className="relative z-10 ml-2 md:ml-3 inline-block">
                          →
                        </span>
                      </button>
                    </LocalizedClientLink>
                  </motion.div>

                  {/* Decorative Elements - Hidden on mobile */}
                  <div
                    className="hidden md:block absolute top-10 right-10 w-32 h-32 border opacity-20"
                    style={{ borderColor: category.accent }}
                  />
                  <div
                    className="hidden md:block absolute bottom-10 right-20 w-16 h-16 opacity-10"
                    style={{ backgroundColor: category.accent }}
                  />
                </motion.div>
              </div>

              {/* Background Accent Glow */}
              <motion.div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: `radial-gradient(circle at 70% 50%, ${category.accent}08 0%, transparent 50%)`,
                  opacity: hoveredCard === category.id ? 1 : 0.5,
                  transition: "opacity 0.5s ease",
                }}
              />
            </div>
          ))}
        </motion.div>

        {/* Scroll Hint - Hidden on mobile to save space */}
        <motion.div
          className="hidden md:flex absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex-col items-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <span className="text-white/30 text-xs tracking-widest uppercase">
            Scroll to explore
          </span>
          <motion.div
            className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center pt-2"
            animate={{ y: [0, 5, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <motion.div
              className="w-1.5 h-3 bg-[#ccff00] rounded-full"
              animate={{ y: [0, 8, 0], opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

export default HorizontalScrollSection
