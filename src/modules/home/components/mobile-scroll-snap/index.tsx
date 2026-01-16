"use client"

import { ReactNode } from "react"

interface HeroSnapContainerProps {
  children: ReactNode
}

// Simple wrapper - no scroll manipulation needed
// The scroll-snap is handled via CSS on mobile
const HeroSnapContainer = ({ children }: HeroSnapContainerProps) => {
  return (
    <div className="md:contents">
      {children}
    </div>
  )
}

export default HeroSnapContainer

