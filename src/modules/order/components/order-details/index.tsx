import { HttpTypes } from "@medusajs/types"
import { Text } from "@medusajs/ui"
import { convertToLocale } from "@lib/util/money"

type OrderDetailsProps = {
  order: HttpTypes.StoreOrder
  showStatus?: boolean
}

const getStatusBadgeClasses = (status: string): string => {
  switch (status) {
    // Green — all good
    case "fulfilled":
    case "shipped":
    case "delivered":
    case "captured":
      return "bg-emerald-500/10 text-emerald-400 border border-emerald-500/25"
    // Blue — in progress
    case "partially_fulfilled":
    case "partially_shipped":
      return "bg-blue-500/10 text-blue-400 border border-blue-500/25"
    // Amber — waiting
    case "not_fulfilled":
    case "awaiting":
    case "authorized":
    case "not_paid":
      return "bg-amber-500/10 text-amber-400 border border-amber-500/25"
    // Amber — partial payment
    case "partially_captured":
      return "bg-amber-500/10 text-amber-400 border border-amber-500/25"
    // Red — problem
    case "canceled":
    case "cancelled":
    case "refunded":
    case "partially_refunded":
    case "failed":
      return "bg-red-500/10 text-red-400 border border-red-500/25"
    default:
      return "bg-zinc-800 text-gray-400 border border-white/10"
  }
}

// Check if order is shipped/fulfilled/delivered
const isOrderShipped = (fulfillmentStatus: string): boolean => {
  const status = fulfillmentStatus.toLowerCase()
  return status === "fulfilled" || status === "shipped" || status === "delivered"
}

const TRACKING_BASE_URL = "https://dealer-send.com/en-US/track-my-shipment?trackingNumber="

// Convert value to string, handling numbers (including scientific notation)
// Also strips quotes that might be accidentally included
const toTrackingString = (value: unknown): string | undefined => {
  if (!value) return undefined
  
  let result: string
  
  if (typeof value === "string") {
    result = value
  } else if (typeof value === "number") {
    // Handle scientific notation - convert to full number string
    result = value.toLocaleString("fullwide", { useGrouping: false })
  } else {
    result = String(value)
  }
  
  // Strip any surrounding quotes that might have been stored
  return result.replace(/^["']|["']$/g, "").trim()
}

// Helper to extract tracking number from various sources
const getTrackingNumber = (order: HttpTypes.StoreOrder): string | undefined => {
  const orderMeta = order.metadata as Record<string, unknown> | undefined
  
  // 1. Check order metadata
  if (orderMeta?.tracking_number) {
    return toTrackingString(orderMeta.tracking_number)
  }
  
  // 2. Check first fulfillment's metadata
  const fulfillments = order.fulfillments as Array<{
    metadata?: Record<string, unknown>
    labels?: Array<{ tracking_number?: string; tracking_url?: string }>
  }> | undefined
  
  if (fulfillments?.[0]?.metadata?.tracking_number) {
    return toTrackingString(fulfillments[0].metadata.tracking_number)
  }
  
  // 3. Check fulfillment labels (if exposed by API)
  if (fulfillments?.[0]?.labels?.[0]?.tracking_number) {
    return fulfillments[0].labels[0].tracking_number
  }
  
  return undefined
}

const OrderDetails = ({ order, showStatus }: OrderDetailsProps) => {
  const formatStatus = (str: string) => {
    const map: Record<string, string> = {
      not_fulfilled: "Not yet shipped",
      partially_fulfilled: "Partially shipped",
      fulfilled: "Fulfilled",
      shipped: "Shipped",
      delivered: "Delivered",
      captured: "Paid",
      partially_captured: "Partially paid",
      authorized: "Awaiting payment",
      awaiting: "Awaiting payment",
      not_paid: "Awaiting payment",
      refunded: "Refunded",
      partially_refunded: "Partially refunded",
      canceled: "Canceled",
      cancelled: "Canceled",
      failed: "Failed",
    }
    return map[str] ?? str.split("_").map((w) => w[0].toUpperCase() + w.slice(1)).join(" ")
  }

  return (
    <div>
      <Text className="text-gray-300">
        We have sent the order confirmation details to{" "}
        <span
          className="text-white font-semibold"
          data-testid="order-email"
        >
          {order.email}
        </span>
        .
      </Text>
      <Text className="mt-2 text-gray-400">
        Order date:{" "}
        <span data-testid="order-date" className="text-gray-300">
          {new Date(order.created_at).toDateString()}
        </span>
      </Text>
      <Text className="mt-2 text-[#b8ff2b]">
        Order number:{" "}
        <span data-testid="order-id" className="font-bold">#ONX-{order.display_id}</span>
      </Text>

      <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center text-compact-small gap-2 sm:gap-x-4 sm:gap-y-2 mt-4">
        {showStatus && (
          <>
            <Text className="text-gray-400 flex items-center gap-x-2 text-sm">
              Order status:{" "}
              <span
                className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${
                  (order as any).status === "canceled"
                    ? getStatusBadgeClasses("canceled")
                    : getStatusBadgeClasses(order.fulfillment_status)
                }`}
                data-testid="order-status"
              >
                {(order as any).status === "canceled"
                  ? "Canceled"
                  : formatStatus(order.fulfillment_status)}
              </span>
            </Text>
            <Text className="text-gray-400 flex items-center gap-x-2 text-sm">
              Payment status:{" "}
              {(() => {
                const isCanceled = (order as any).status === "canceled"
                const pendingDiff = Number((order as any).summary?.pending_difference ?? 0)
                const paidTotal = Number((order as any).summary?.paid_total ?? 0)
                let effectiveStatus = order.payment_status
                if (!isCanceled) {
                  if (pendingDiff > 0 && paidTotal > 0) {
                    effectiveStatus = "partially_captured"
                  } else if (pendingDiff <= 0 && order.payment_status === "partially_captured") {
                    effectiveStatus = "captured"
                  }
                }
                return (
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${getStatusBadgeClasses(effectiveStatus)}`}
                    data-testid="order-payment-status"
                  >
                    {formatStatus(effectiveStatus)}
                  </span>
                )
              })()}
            </Text>
          </>
        )}
      </div>

      {(() => {
        const pendingDiff = Number((order as any).summary?.pending_difference ?? 0)
        if ((order as any).status === "canceled") return null
        if (pendingDiff <= 0) return null
        return (
          <div className="mt-4 pt-4 border-t border-white/[0.06]">
            <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border bg-amber-500/10 border-amber-500/25 text-amber-400">
              <span className="w-2 h-2 rounded-full flex-shrink-0 bg-current animate-pulse" />
              <span>
                Balance due:{" "}
                <strong>
                  {convertToLocale({
                    amount: pendingDiff,
                    currency_code: order.currency_code,
                  })}
                </strong>
                {" "}— see payment instructions below
              </span>
            </div>
          </div>
        )
      })()}
    </div>
  )
}

export default OrderDetails
