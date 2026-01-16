"use client"

import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  MotionValue,
} from "framer-motion"
import { useRef, useState, useEffect } from "react"
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

// Mobile Card Component - Full screen design with peek of next card
const MobileCard = ({
  category,
  index,
}: {
  category: CategoryCard
  index: number
}) => (
  // Width is 88vw so next card peeks through
  <div className="flex-shrink-0 w-[88vw] h-full snap-center flex items-center justify-center first:ml-[6vw]">
    <div className="relative w-full h-[85vh] flex flex-col pt-16">
      {/* Image Section */}
      <div className="relative w-full h-[35vh] overflow-hidden flex-shrink-0">
        <div
          className="absolute inset-0"
          style={{
            clipPath: "polygon(0 0, 100% 0, 100% 90%, 0 100%)",
          }}
        >
          <Image
            src={category.image}
            alt={category.title}
            fill
            className="object-cover object-top"
            sizes="100vw"
            priority={index < 2}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0a0a0a]" />
          <div
            className="absolute inset-0 opacity-30"
            style={{
              background: `linear-gradient(135deg, ${category.accent}20 0%, transparent 50%)`,
            }}
          />
        </div>

        {/* Number Badge */}
        <div
          className="absolute top-4 left-4 text-6xl font-black pointer-events-none"
          style={{ color: category.accent, opacity: 0.3 }}
        >
          0{index + 1}
        </div>
      </div>

      {/* Content Section */}
      <div className="relative flex-1 flex flex-col justify-start px-2 pt-4">
        {/* Subtitle */}
        <div className="flex items-center gap-2 mb-2">
          <div
            className="w-6 h-[2px]"
            style={{ backgroundColor: category.accent }}
          />
          <span
            className="text-xs font-bold tracking-[0.15em]"
            style={{ color: category.accent }}
          >
            {category.subtitle}
          </span>
        </div>

        {/* Title */}
        <h2 className="text-3xl font-black text-white mb-3 tracking-tight leading-[1.1]">
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
        </h2>

        {/* Description */}
        <p className="text-sm text-gray-400 mb-4 leading-relaxed">
          {category.description}
        </p>

        {/* Products Row */}
        <div className="mb-4">
          <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-2">
            {category.isExploreAll ? "Browse" : "Popular Products"}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {category.products.map((product, i) => (
              <span
                key={i}
                className="px-2.5 py-1.5 text-xs font-bold border"
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
        </div>

        {/* CTA Button */}
        <div className="mt-auto pb-4">
          <LocalizedClientLink href={category.href}>
            <button
              className="w-full px-6 py-3 font-black text-sm tracking-wider"
              style={{
                backgroundColor: category.accent,
                border: `2px solid ${category.accent}`,
                color: "#0a0a0a",
              }}
            >
              {category.isExploreAll ? "VIEW ALL →" : "EXPLORE →"}
            </button>
          </LocalizedClientLink>
        </div>
      </div>

      {/* Background Accent Glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(circle at 50% 30%, ${category.accent}08 0%, transparent 50%)`,
        }}
      />
    </div>
  </div>
)

// Progress bar component that uses pre-computed transforms
const ProgressBar = ({
  accent,
  scaleX,
}: {
  accent: string
  scaleX: MotionValue<number>
}) => (
  <motion.div className="w-8 h-1 bg-white/20 rounded-full overflow-hidden">
    <motion.div
      className="h-full rounded-full"
      style={{
        backgroundColor: accent,
        scaleX,
        transformOrigin: "left",
      }}
    />
  </motion.div>
)

// Number display component
const NumberDisplay = ({
  index,
  display,
}: {
  index: number
  display: MotionValue<string>
}) => (
  <motion.span style={{ display: display as any }}>0{index + 1}</motion.span>
)

const HorizontalScrollSection = () => {
  const containerRef = useRef<HTMLDivElement>(null)
  const mobileScrollRef = useRef<HTMLDivElement>(null)
  const [hoveredCard, setHoveredCard] = useState<string | null>(null)
  const [isMobile, setIsMobile] = useState(false)
  const [activeCardIndex, setActiveCardIndex] = useState(0)

  // All hooks must be called unconditionally at the top level
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  })

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  })

  // Desktop horizontal scroll transform
  const x = useTransform(smoothProgress, [0, 0.85, 1], ["0%", "-80%", "-80%"])

  // Pre-compute all progress bar transforms (must be called unconditionally)
  const progressScales = [
    useTransform(smoothProgress, [0, 0.17], [0, 1]),
    useTransform(smoothProgress, [0.17, 0.34], [0, 1]),
    useTransform(smoothProgress, [0.34, 0.51], [0, 1]),
    useTransform(smoothProgress, [0.51, 0.68], [0, 1]),
    useTransform(smoothProgress, [0.68, 0.85], [0, 1]),
  ]

  // Pre-compute all number display transforms
  const numberDisplays = [
    useTransform(smoothProgress, [0, 0.085, 0.17], ["none", "inline", "none"]),
    useTransform(
      smoothProgress,
      [0.17, 0.255, 0.34],
      ["none", "inline", "none"]
    ),
    useTransform(
      smoothProgress,
      [0.34, 0.425, 0.51],
      ["none", "inline", "none"]
    ),
    useTransform(
      smoothProgress,
      [0.51, 0.595, 0.68],
      ["none", "inline", "none"]
    ),
    useTransform(smoothProgress, [0.68, 0.85, 1.1], ["none", "inline", "none"]),
  ]

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  // Track active card on mobile scroll
  useEffect(() => {
    const scrollContainer = mobileScrollRef.current
    if (!scrollContainer || !isMobile) return

    const handleScroll = () => {
      const scrollLeft = scrollContainer.scrollLeft
      const cardWidth = scrollContainer.offsetWidth * 0.85
      const newIndex = Math.round(scrollLeft / cardWidth)
      setActiveCardIndex(Math.min(newIndex, categories.length - 1))
    }

    scrollContainer.addEventListener("scroll", handleScroll)
    return () => scrollContainer.removeEventListener("scroll", handleScroll)
  }, [isMobile])

  // Mobile version - horizontal swipe with full-screen cards
  if (isMobile) {
    return (
      <section className="relative bg-[#0a0a0a] h-screen overflow-hidden">
        {/* Background Grid */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)`,
            backgroundSize: "4rem 4rem",
          }}
        />

        {/* Header - Fixed */}
        <div className="absolute top-4 left-4 z-30">
          <div className="flex items-center gap-2">
            <div className="w-6 h-[2px] bg-[#ccff00]" />
            <span className="text-[#ccff00] text-xs font-bold tracking-[0.2em]">
              CATEGORIES
            </span>
          </div>
        </div>

        {/* Progress Dots - Fixed */}
        <div className="absolute top-4 right-4 z-30 flex items-center gap-2">
          {categories.map((cat, i) => (
            <div
              key={cat.id}
              className="w-2 h-2 rounded-full transition-all duration-300"
              style={{
                backgroundColor:
                  i === activeCardIndex ? cat.accent : "rgba(255,255,255,0.2)",
                transform: i === activeCardIndex ? "scale(1.3)" : "scale(1)",
              }}
            />
          ))}
          <span className="text-white/50 text-xs font-mono ml-1">
            0{activeCardIndex + 1}/05
          </span>
        </div>

        {/* Horizontal Scroll Container */}
        <div
          ref={mobileScrollRef}
          className="flex h-full overflow-x-auto snap-x snap-mandatory scrollbar-hide"
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            WebkitOverflowScrolling: "touch",
          }}
        >
          {categories.map((category, index) => (
            <MobileCard key={category.id} category={category} index={index} />
          ))}
          {/* End spacer */}
          <div className="flex-shrink-0 w-[6vw]" />
        </div>

        {/* Swipe Hint Overlay - Shows on first card with animated arrow */}
        {activeCardIndex === 0 && (
          <motion.div
            className="absolute inset-0 pointer-events-none z-20"
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            transition={{ delay: 4, duration: 0.5 }}
          >
            {/* Gradient overlay on right edge */}
            <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-[#ccff00]/20 to-transparent" />

            {/* Animated swipe indicator */}
            <motion.div
              className="absolute right-3 top-1/2 -translate-y-1/2 flex flex-col items-center gap-2"
              animate={{
                x: [0, -12, 0],
                opacity: [0.9, 1, 0.9],
              }}
              transition={{
                duration: 1.2,
                repeat: 5,
                ease: "easeInOut",
              }}
            >
              <div className="w-11 h-11 rounded-full bg-[#ccff00] flex items-center justify-center shadow-lg shadow-[#ccff00]/40">
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="text-black"
                >
                  <path
                    d="M9 18l6-6-6-6"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <span className="text-[#ccff00] text-[10px] font-bold tracking-widest uppercase">
                Swipe
              </span>
            </motion.div>
          </motion.div>
        )}

        {/* Bottom Swipe Hint */}
        <motion.div
          className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <motion.div
            className="flex items-center gap-3 px-5 py-2.5 bg-black/70 backdrop-blur-md rounded-full border border-[#ccff00]/40"
            animate={{ x: [0, 6, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          >
            <span className="text-white text-sm font-semibold tracking-wide">
              swipe
            </span>
            <motion.div
              animate={{ x: [0, 4, 0] }}
              transition={{
                duration: 0.7,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                className="text-[#ccff00]"
              >
                <path
                  d="M5 12h14m0 0l-6-6m6 6l-6 6"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Hide scrollbar */}
        <style jsx>{`
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
        `}</style>
      </section>
    )
  }

  // Desktop version - scroll-driven animation
  return (
    <section
      ref={containerRef}
      className="relative bg-[#0a0a0a]"
      style={{ height: "600vh" }}
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

        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="absolute top-20 left-8 z-30"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-[2px] bg-[#ccff00]" />
            <span className="text-[#ccff00] text-sm font-bold tracking-[0.3em]">
              CATEGORIES
            </span>
          </div>
        </motion.div>

        {/* Progress Indicator */}
        <div className="absolute top-20 right-8 z-30 flex items-center gap-4">
          <div className="flex gap-2">
            {categories.map((cat, i) => (
              <ProgressBar
                key={cat.id}
                accent={cat.accent}
                scaleX={progressScales[i]}
              />
            ))}
          </div>
          <span className="text-white/50 text-sm font-mono">
            {categories.map((_, i) => (
              <NumberDisplay key={i} index={i} display={numberDisplays[i]} />
            ))}
            /05
          </span>
        </div>

        {/* Horizontal Scrolling Cards Container */}
        <motion.div style={{ x }} className="flex h-full w-[500vw]">
          {categories.map((category, index) => (
            <div
              key={category.id}
              className="relative w-screen h-full flex items-center justify-center px-8"
              onMouseEnter={() => setHoveredCard(category.id)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              {/* Card Container */}
              <div className="relative w-full max-w-6xl h-[75vh] flex flex-row pt-8">
                {/* Left Side - Image */}
                <motion.div
                  className="relative w-1/2 h-full overflow-hidden flex-shrink-0"
                  initial={{ opacity: 0, x: -100 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                >
                  <div
                    className="absolute inset-0"
                    style={{
                      clipPath: "polygon(0 0, 100% 0, 100% 90%, 0 100%)",
                    }}
                  >
                    <Image
                      src={category.image}
                      alt={category.title}
                      fill
                      className="object-cover object-top"
                      sizes="50vw"
                      priority={index < 2}
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-[#0a0a0a]" />
                    <div
                      className="absolute inset-0 opacity-30"
                      style={{
                        background: `linear-gradient(135deg, ${category.accent}20 0%, transparent 50%)`,
                      }}
                    />
                  </div>

                  {/* Floating Number */}
                  <div
                    className="absolute -right-16 top-1/2 -translate-y-1/2 text-[20rem] font-black leading-none pointer-events-none select-none"
                    style={{
                      color: "transparent",
                      WebkitTextStroke: `1px ${category.accent}30`,
                    }}
                  >
                    0{index + 1}
                  </div>
                </motion.div>

                {/* Right Side - Content */}
                <motion.div
                  className="relative w-1/2 h-full flex flex-col justify-center pl-16"
                  initial={{ opacity: 0, x: 100 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                >
                  {/* Subtitle */}
                  <motion.div
                    className="flex items-center gap-3 mb-4"
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <div
                      className="w-8 h-[2px]"
                      style={{ backgroundColor: category.accent }}
                    />
                    <span
                      className="text-sm font-bold tracking-[0.2em]"
                      style={{ color: category.accent }}
                    >
                      {category.subtitle}
                    </span>
                  </motion.div>

                  {/* Title */}
                  <motion.h2
                    className="text-7xl font-black text-white mb-6 tracking-tight leading-[0.95]"
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
                    className="text-lg text-gray-400 mb-8 max-w-md leading-relaxed"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    {category.description}
                  </motion.p>

                  {/* Products Row */}
                  <motion.div
                    className="mb-10"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <div className="text-xs text-gray-500 uppercase tracking-wider mb-3">
                      {category.isExploreAll ? "Browse" : "Popular Products"}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {category.products.map((product, i) => (
                        <span
                          key={i}
                          className="px-4 py-2 text-sm font-bold border transition-all duration-300 hover:scale-105 cursor-default"
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
                        className="group relative px-10 py-5 font-black text-lg tracking-wider overflow-hidden transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]"
                        style={{
                          backgroundColor: category.accent,
                          border: `2px solid ${category.accent}`,
                          color: "#0a0a0a",
                        }}
                      >
                        <span className="relative z-10">
                          {category.isExploreAll ? "VIEW ALL" : "EXPLORE"}
                        </span>
                        <span className="relative z-10 ml-3 inline-block">
                          →
                        </span>
                      </button>
                    </LocalizedClientLink>
                  </motion.div>

                  {/* Decorative Elements */}
                  <div
                    className="absolute top-10 right-10 w-32 h-32 border opacity-20"
                    style={{ borderColor: category.accent }}
                  />
                  <div
                    className="absolute bottom-10 right-20 w-16 h-16 opacity-10"
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

        {/* Desktop Scroll Hint */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-2"
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
