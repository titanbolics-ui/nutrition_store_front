import { HttpTypes } from "@medusajs/types"
import { ExternalLink, Package, Clock } from "lucide-react"

type WarehouseItem = {
  locationName: string
  items: { title: string; quantity: number }[]
}

type FulfillmentsProps = {
  order: HttpTypes.StoreOrder
  warehouseItems?: Record<string, WarehouseItem>
}

type FulfillmentItem = {
  title: string
  quantity: number
  line_item_id?: string
}

const TRACKING_BASE_URL =
  "https://dealer-send.com/en-US/track-my-shipment?trackingNumber="

const Fulfillments = ({ order, warehouseItems = {} }: FulfillmentsProps) => {
  const fulfillments = (order as any).fulfillments as Array<{
    id: string
    location_id?: string
    shipped_at?: string | null
    items: FulfillmentItem[]
    labels: Array<{ tracking_number?: string; tracking_url?: string }>
  }>

  // Build line_item_id → product_title map from order items
  const lineItemTitles: Record<string, string> = {}
  for (const item of order.items ?? []) {
    lineItemTitles[item.id] = item.product_title ?? item.title ?? ""
  }

  if (!fulfillments?.length) return null

  const resolveLocationName = (locationId?: string): string => {
    if (!locationId) return "Warehouse"
    return warehouseItems[locationId]?.locationName ?? "Warehouse"
  }

  return (
    <div>
      <h2 className="text-sm font-semibold text-white mb-3">Shipments</h2>
      <div className="flex flex-col gap-3">
        {fulfillments.map((fulfillment) => {
          const trackingNumber = fulfillment.labels?.[0]?.tracking_number
          const trackingUrl =
            fulfillment.labels?.[0]?.tracking_url ||
            (trackingNumber ? `${TRACKING_BASE_URL}${trackingNumber}` : null)
          const locationName = resolveLocationName(fulfillment.location_id)
          const isShipped = !!fulfillment.shipped_at

          return (
            <div
              key={fulfillment.id}
              className="rounded-xl border border-white/[0.07] bg-zinc-900 overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <span className="text-sm font-medium text-white">
                    {locationName}
                  </span>
                </div>
                <span
                  className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full border ${
                    isShipped
                      ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-400"
                      : "bg-amber-500/10 border-amber-500/25 text-amber-400"
                  }`}
                >
                  {isShipped ? "Shipped" : "Preparing"}
                </span>
              </div>

              <div className="px-4 py-3 flex flex-col gap-2.5">
                {/* Items */}
                {fulfillment.items?.length > 0 && (
                  <p className="text-xs text-gray-400 leading-relaxed">
                    {fulfillment.items
                      .map((i) => {
                        const name = i.line_item_id
                          ? (lineItemTitles[i.line_item_id] || i.title)
                          : i.title
                        return `${name} ×${i.quantity}`
                      })
                      .join(", ")}
                  </p>
                )}

                {/* Tracking */}
                {trackingNumber && trackingUrl ? (
                  <a
                    href={trackingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm font-medium text-[#b8ff2b] hover:text-[#b8ff2b]/80 transition-colors"
                  >
                    <span className="font-mono text-xs bg-zinc-800 px-2 py-1 rounded border border-white/10">
                      {trackingNumber}
                    </span>
                    <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="text-xs">Track</span>
                  </a>
                ) : (
                  <div className="inline-flex items-center gap-1.5 text-xs text-gray-500">
                    <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>Awaiting tracking update</span>
                  </div>
                )}

                {/* Ship date */}
                {fulfillment.shipped_at && (
                  <p className="text-[11px] text-gray-600">
                    Shipped{" "}
                    {new Date(fulfillment.shipped_at).toLocaleDateString(
                      "en-US",
                      { month: "short", day: "numeric", year: "numeric" }
                    )}
                  </p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default Fulfillments
