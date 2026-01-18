"use client"

import React, { createContext, useContext, useState, useCallback, useRef } from "react"

interface FlyingItem {
  id: string
  imageSrc: string
  startX: number
  startY: number
  endX: number
  endY: number
}

interface FlyToCartContextType {
  flyingItem: FlyingItem | null
  triggerFlyToCart: (imageSrc: string, buttonElement: HTMLElement) => void
  setCartIconElement: (element: HTMLDivElement | null) => void
  isAnimating: boolean
  onAnimationComplete: () => void
}

const FlyToCartContext = createContext<FlyToCartContextType | undefined>(undefined)

export function FlyToCartProvider({ children }: { children: React.ReactNode }) {
  const [flyingItem, setFlyingItem] = useState<FlyingItem | null>(null)
  const [isAnimating, setIsAnimating] = useState(false)
  const cartIconElementRef = useRef<HTMLDivElement | null>(null)

  const setCartIconElement = useCallback((element: HTMLDivElement | null) => {
    cartIconElementRef.current = element
  }, [])

  const triggerFlyToCart = useCallback((imageSrc: string, buttonElement: HTMLElement) => {
    if (isAnimating) return

    // Get button position (start point) - capture immediately
    const buttonRect = buttonElement.getBoundingClientRect()
    const startX = buttonRect.left + buttonRect.width / 2
    const startY = buttonRect.top + buttonRect.height / 2

    // Set animating first to trigger header to show (if hidden)
    setIsAnimating(true)

    // Wait for header animation to complete (300ms transition), then get cart position
    setTimeout(() => {
      let endX = window.innerWidth - 60
      let endY = 40
      
      if (cartIconElementRef.current) {
        const cartRect = cartIconElementRef.current.getBoundingClientRect()
        endX = cartRect.left + cartRect.width / 2
        endY = cartRect.top + cartRect.height / 2
      }

      setFlyingItem({
        id: Date.now().toString(),
        imageSrc,
        startX,
        startY,
        endX,
        endY,
      })
    }, 350) // Slight delay for header to slide in
  }, [isAnimating])

  const onAnimationComplete = useCallback(() => {
    setFlyingItem(null)
    // Keep isAnimating true for a bit longer for the pulse effect
    setTimeout(() => {
      setIsAnimating(false)
    }, 300)
  }, [])

  return (
    <FlyToCartContext.Provider
      value={{
        flyingItem,
        triggerFlyToCart,
        setCartIconElement,
        isAnimating,
        onAnimationComplete,
      }}
    >
      {children}
    </FlyToCartContext.Provider>
  )
}

export function useFlyToCart() {
  const context = useContext(FlyToCartContext)
  if (context === undefined) {
    throw new Error("useFlyToCart must be used within a FlyToCartProvider")
  }
  return context
}

