"use client"

import { useEffect } from "react"
import { usePathname, useSearchParams } from "next/navigation"

// This component scrolls to top when the page loads
// Useful for ensuring the homepage always starts at the top
const ScrollToTop = () => {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Scroll to top on route change
    window.scrollTo(0, 0)
  }, [pathname, searchParams])

  return null
}

export default ScrollToTop

