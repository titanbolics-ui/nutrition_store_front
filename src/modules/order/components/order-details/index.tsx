import { HttpTypes } from "@medusajs/types"
import { Text } from "@medusajs/ui"
import { Package, ExternalLink, Clock } from "lucide-react"

type OrderDetailsProps = {
  order: HttpTypes.StoreOrder
  showStatus?: boolean
}

// Status badge styling based on status type
const getStatusBadgeClasses = (status: string): string => {
  const normalizedStatus = status.toLowerCase()
  
  // Fulfillment statuses
  if (normalizedStatus.includes("fulfilled") || normalizedStatus.includes("shipped") || normalizedStatus.includes("delivered")) {
    return "bg-green-500/10 text-green-400 border border-green-500/20"
  }
  if (normalizedStatus.includes("processing") || normalizedStatus.includes("pending") || normalizedStatus === "not_fulfilled" || normalizedStatus === "not fulfilled") {
    return "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
  }
  if (normalizedStatus.includes("canceled") || normalizedStatus.includes("cancelled") || normalizedStatus.includes("refunded") || normalizedStatus.includes("failed")) {
    return "bg-red-500/10 text-red-400 border border-red-500/20"
  }
  
  // Payment statuses
  if (normalizedStatus.includes("captured") || normalizedStatus.includes("paid")) {
    return "bg-green-500/10 text-green-400 border border-green-500/20"
  }
  if (normalizedStatus.includes("awaiting") || normalizedStatus === "not_paid" || normalizedStatus === "not paid") {
    return "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
  }
  
  // Default
  return "bg-gray-500/10 text-gray-400 border border-gray-500/20"
}

// Check if order is shipped/fulfilled/delivered
const isOrderShipped = (fulfillmentStatus: string): boolean => {
  const status = fulfillmentStatus.toLowerCase()
  return (
    status.includes("fulfilled") ||
    status.includes("shipped") ||
    status.includes("delivered")
  )
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
    const formatted = str.split("_").join(" ")

    return formatted.slice(0, 1).toUpperCase() + formatted.slice(1)
  }

  // Get tracking number from multiple possible sources
  const trackingNumber = getTrackingNumber(order)
  const isShipped = isOrderShipped(order.fulfillment_status)

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
                className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${getStatusBadgeClasses(order.fulfillment_status)}`}
                data-testid="order-status"
              >
                {formatStatus(order.fulfillment_status)}
              </span>
            </Text>
            <Text className="text-gray-400 flex items-center gap-x-2 text-sm">
              Payment status:{" "}
              <span
                className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${getStatusBadgeClasses(order.payment_status)}`}
                data-testid="order-payment-status"
              >
                {formatStatus(order.payment_status)}
              </span>
            </Text>
          </>
        )}
      </div>

      {/* Tracking Section */}
      <div className="mt-4 pt-4 border-t border-gray-800">
        {isShipped && trackingNumber ? (
          <a
            href={`${TRACKING_BASE_URL}${trackingNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#ccff00]/10 hover:bg-[#ccff00]/20 border border-[#ccff00]/30 rounded-lg text-[#ccff00] font-medium text-sm transition-all group"
          >
            <Package className="w-4 h-4 shrink-0" />
            <span>Track Your Package</span>
            <ExternalLink className="w-3.5 h-3.5 shrink-0 opacity-70 group-hover:opacity-100 transition-opacity" />
          </a>
        ) : isShipped && !trackingNumber ? (
          <div className="inline-flex items-center gap-2 px-4 py-2.5 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-yellow-400 text-sm">
            <Clock className="w-4 h-4 shrink-0" />
            <span>Tracking number will be available shortly</span>
          </div>
        ) : (
          <div className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-400 text-sm">
            <Clock className="w-4 h-4 shrink-0" />
            <span>Tracking available 4-5 days after shipping</span>
          </div>
        )}
      </div>
    </div>
  )
}

export default OrderDetails
