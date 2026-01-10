"use client"

import { useEffect, useState } from "react"
import { ChevronDown } from "@medusajs/icons"

export default function ScrollIndicator() {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const handleScroll = () => {
      //Ховати коли користувач почав скролити
      if (window.scrollY > 100) {
        setIsVisible(false)
      }
    }

    window.addEventListener("scroll", handleScroll)
    
    // Автоматично сховати через 5 секунд
    const timer = setTimeout(() => {
      setIsVisible(false)
    }, 5000)

    return () => {
      window.removeEventListener("scroll", handleScroll)
      clearTimeout(timer)
    }
  }, [])

  if (!isVisible) return null

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-10 small:hidden animate-bounce">
      <div className="flex flex-col items-center gap-1 text-ui-fg-muted">
        <span className="text-xs font-medium">Scroll down</span>
        <ChevronDown className="w-6 h-6" />
      </div>
    </div>
  )
}

