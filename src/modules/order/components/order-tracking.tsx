"use client"

import { trackOrderPlaced } from "@lib/posthog/checkout-tracking"
import { HttpTypes } from "@medusajs/types"
import { useEffect } from "react"

export function OrderTracking({ order }: { order: HttpTypes.StoreOrder }) {
  useEffect(() => {
    if (order?.id) {
      const paymentMethod =
        order.payment_collections?.[0]?.payment_sessions?.[0]?.provider_id ||
        order.payment_collections?.[0]?.payments?.[0]?.provider_id ||
        "unknown"

      trackOrderPlaced(
        order.id,
        order.id, // Using order.id as cart_id is not available on StoreOrder
        order.total || 0,
        order.currency_code || "USD",
        paymentMethod
      )
    }
  }, [order?.id, order?.total, order?.currency_code])

  return null
}
