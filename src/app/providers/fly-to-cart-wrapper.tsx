"use client"

import { FlyToCartProvider } from "@lib/context/fly-to-cart-context"
import FlyingItem from "@modules/common/components/flying-item"
import { ReactNode } from "react"

export function FlyToCartWrapper({ children }: { children: ReactNode }) {
  return (
    <FlyToCartProvider>
      {children}
      <FlyingItem />
    </FlyToCartProvider>
  )
}

