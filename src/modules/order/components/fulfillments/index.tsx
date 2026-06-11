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
    delivered_at?: string | null
    items: FulfillmentItem[]
    labels: Array<{ tracking_number?: string; tracking_url?: string }>
    metadata?: Record<string, unknown>
  }>

  // Build line_item_id → product_title map from order items
  const lineItemTitles: Record<string, string> = {}
  for (const item of order.items ?? []) {
    lineItemTitles[item.id] = item.product_title ?? item.title ?? ""
  }

  // Order-level tracking map: { [fulfillment_id]: tracking_number }
  const orderTrackingMap = (
    (order as any).metadata?.tracking ?? {}
  ) as Record<string, string>

  if (!fulfillments?.length) return null

  const resolveLocationName = (locationId?: string): string => {
    if (!locationId) return "Warehouse"
    return warehouseItems[locationId]?.locationName ?? "Warehouse"
  }

  const deliveredCount = fulfillments.filter((f) => !!f.delivered_at).length
  const shippedCount = fulfillments.filter((f) => !!f.shipped_at && !f.delivered_at).length
  const totalCount = fulfillments.length
  const allDone = deliveredCount === totalCount
  // preparing = not yet shipped; "partial" banners only when shipments are at
  // DIFFERENT stages — all-shipped (none delivered) is not partial anything
  const preparingCount = totalCount - shippedCount - deliveredCount
  const isPartialShipped = preparingCount > 0 && shippedCount + deliveredCount > 0
  const isPartialDelivered = preparingCount === 0 && deliveredCount > 0 && !allDone
  const isPartial = isPartialShipped || isPartialDelivered

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-white">Shipments</h2>
        {totalCount > 1 && (
          <span className="text-xs text-gray-400">
            {allDone
              ? `${totalCount}/${totalCount} delivered`
              : deliveredCount > 0
              ? `${deliveredCount}/${totalCount} delivered`
              : `${shippedCount + deliveredCount}/${totalCount} shipped`}
          </span>
        )}
      </div>

      {isPartial && (
        <div className="mb-3 rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3 flex items-start gap-3">
          <span className="text-amber-400 text-base mt-0.5">📦</span>
          <div>
            <p className="text-sm font-medium text-amber-300 mb-0.5">
              {isPartialDelivered ? "Partially delivered" : "Partially shipped"}
            </p>
            <p className="text-xs text-gray-400 leading-relaxed">
              {isPartialDelivered
                ? `${deliveredCount} of ${totalCount} shipments delivered. The rest are still on their way.`
                : `${shippedCount + deliveredCount} of ${totalCount} shipments have left the warehouse. The remaining ${preparingCount === 1 ? "shipment is" : "shipments are"} still being prepared.`}
            </p>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3">
        {fulfillments.map((fulfillment) => {
          const trackingNumber =
            fulfillment.labels?.[0]?.tracking_number ||
            (fulfillment.metadata?.tracking_number as string | undefined) ||
            orderTrackingMap[fulfillment.id]
          // admin-entered URLs can be schemeless/truncated — trust absolute only
          const rawTrackingUrl = fulfillment.labels?.[0]?.tracking_url
          const trackingUrl =
            rawTrackingUrl && /^https?:\/\//i.test(rawTrackingUrl)
              ? rawTrackingUrl
              : trackingNumber
              ? `${TRACKING_BASE_URL}${trackingNumber}`
              : null
          const locationName = resolveLocationName(fulfillment.location_id)
          const isDelivered = !!fulfillment.delivered_at
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
                    isDelivered
                      ? "bg-blue-500/10 border-blue-500/25 text-blue-400"
                      : isShipped
                      ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-400"
                      : "bg-amber-500/10 border-amber-500/25 text-amber-400"
                  }`}
                >
                  {isDelivered ? "Delivered" : isShipped ? "Shipped" : "Preparing"}
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

                {/* Dates */}
                {fulfillment.delivered_at && (
                  <p className="text-[11px] text-gray-600">
                    Delivered{" "}
                    {new Date(fulfillment.delivered_at).toLocaleDateString(
                      "en-US",
                      { month: "short", day: "numeric", year: "numeric" }
                    )}
                  </p>
                )}
                {!fulfillment.delivered_at && fulfillment.shipped_at && (
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
