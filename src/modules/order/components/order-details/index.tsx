import { HttpTypes } from "@medusajs/types"
import { Text } from "@medusajs/ui"

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

const OrderDetails = ({ order, showStatus }: OrderDetailsProps) => {
  const formatStatus = (str: string) => {
    const formatted = str.split("_").join(" ")

    return formatted.slice(0, 1).toUpperCase() + formatted.slice(1)
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

      <div className="flex items-center text-compact-small gap-x-4 mt-4">
        {showStatus && (
          <>
            <Text className="text-gray-400 flex items-center gap-x-2">
              Order status:{" "}
              <span 
                className={`px-2 py-1 rounded text-xs font-medium ${getStatusBadgeClasses(order.fulfillment_status)}`}
                data-testid="order-status"
              >
                {formatStatus(order.fulfillment_status)}
              </span>
            </Text>
            <Text className="text-gray-400 flex items-center gap-x-2">
              Payment status:{" "}
              <span
                className={`px-2 py-1 rounded text-xs font-medium ${getStatusBadgeClasses(order.payment_status)}`}
                data-testid="order-payment-status"
              >
                {formatStatus(order.payment_status)}
              </span>
            </Text>
          </>
        )}
      </div>
    </div>
  )
}

export default OrderDetails
