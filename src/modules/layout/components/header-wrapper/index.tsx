"use client"

import { useState, useEffect, useRef } from "react"
import { useFlyToCart } from "@lib/context/fly-to-cart-context"

interface HeaderWrapperProps {
  children: React.ReactNode
}

export default function HeaderWrapper({ children }: HeaderWrapperProps) {
  const [isVisible, setIsVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)
  const ticking = useRef(false)
  const { isAnimating } = useFlyToCart()

  useEffect(() => {
    const handleScroll = () => {
      if (!ticking.current) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY

          // Only apply hide/show logic on mobile (< 768px)
          if (window.innerWidth < 768) {
            if (currentScrollY < 50) {
              // Always show header at the top
              setIsVisible(true)
            } else if (currentScrollY > lastScrollY && currentScrollY > 100) {
              // Scrolling down & past threshold - hide
              setIsVisible(false)
            } else if (currentScrollY < lastScrollY) {
              // Scrolling up - show
              setIsVisible(true)
            }
          } else {
            // On desktop, always visible
            setIsVisible(true)
          }

          setLastScrollY(currentScrollY)
          ticking.current = false
        })
        ticking.current = true
      }
    }

    window.addEventListener("scroll", handleScroll, { passive: true })

    return () => {
      window.removeEventListener("scroll", handleScroll)
    }
  }, [lastScrollY])

  // Force show header when fly-to-cart animation is active
  const shouldShow = isVisible || isAnimating

  return (
    <div
      className={`fixed top-0 inset-x-0 z-50 transition-transform duration-300 ease-in-out ${
        shouldShow ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      {children}
    </div>
  )
}
