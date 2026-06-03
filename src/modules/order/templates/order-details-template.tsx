"use client"

import { isCashApp, isManual } from "@lib/constants"
import { XMark } from "@medusajs/icons"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Help from "@modules/order/components/help"
import Items from "@modules/order/components/items"
import OrderDetails from "@modules/order/components/order-details"
import OrderSummary from "@modules/order/components/order-summary"
import Fulfillments from "@modules/order/components/fulfillments"
import PaymentDetails from "@modules/order/components/payment-details"
import PaymentInstructions from "@modules/order/components/payment-instructions"
import ShippingDetails from "@modules/order/components/shipping-details"
import React from "react"

type WarehouseItem = {
  locationName: string
  items: { title: string; quantity: number }[]
}

type OrderDetailsTemplateProps = {
  order: HttpTypes.StoreOrder
}

const OrderDetailsTemplate: React.FC<OrderDetailsTemplateProps> = ({
  order,
}) => {
  const providerId =
    order.payment_collections?.[0]?.payments?.[0]?.provider_id ||
    order.payment_collections?.[0]?.payment_sessions?.[0]?.provider_id ||
    ""
  const awaitingPayment =
    (isCashApp(providerId) || isManual(providerId)) &&
    order.payment_status !== "captured"

  const warehouseItems =
    ((order.metadata?.warehouse_items ?? {}) as Record<string, WarehouseItem>)

  return (
    <div className="flex flex-col gap-y-3">
      {/* Desktop-only back button (mobile handled by AccountNav) */}
      <div className="hidden small:flex px-0">
        <LocalizedClientLink
          href="/account/orders"
          className="inline-flex items-center gap-2 text-sm font-medium text-[#b8ff2b] hover:text-[#b8ff2b]/80 transition-colors"
          data-testid="back-to-overview-button"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          All orders
        </LocalizedClientLink>
      </div>

      <div
        className="flex flex-col gap-5 bg-zinc-950 sm:border sm:border-white/[0.07] sm:rounded-2xl px-4 py-5 sm:p-6 w-full overflow-hidden"
        data-testid="order-details-container"
      >
        <h1 className="text-base font-bold text-white">Order #ONX-{order.display_id}</h1>
        <OrderDetails order={order} showStatus />

        {awaitingPayment && (
          <div className="mt-1">
            <PaymentInstructions order={order} />
          </div>
        )}

        <div>
          <h2 className="text-sm font-semibold text-white mb-3">Items</h2>
          <Items order={order} warehouseItems={warehouseItems} />
        </div>

        <Fulfillments order={order} warehouseItems={warehouseItems} />
        <ShippingDetails order={order} />
        <PaymentDetails order={order} />
        <OrderSummary order={order} />
        <Help />
      </div>
    </div>
  )
}

export default OrderDetailsTemplate
