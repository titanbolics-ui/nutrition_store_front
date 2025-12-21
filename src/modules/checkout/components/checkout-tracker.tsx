"use client"

import { trackCheckoutStarted } from "@lib/posthog/checkout-tracking"
import { HttpTypes } from "@medusajs/types"
import { useEffect } from "react"

export function CheckoutTracker({
  cart,
}: {
  cart: HttpTypes.StoreCart | null
}) {
  useEffect(() => {
    if (cart?.id) {
      trackCheckoutStarted(cart.id)
    }
  }, [cart?.id])

  return null
}
