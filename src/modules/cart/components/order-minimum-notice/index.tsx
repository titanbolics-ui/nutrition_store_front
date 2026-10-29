import { ShoppingBag } from "lucide-react"

import LocalizedClientLink from "@modules/common/components/localized-client-link"

type OrderMinimumNoticeProps = {
  minimum: number
  subtotal: number
  remaining: number
  showCartLink?: boolean
}

// Repeat-customer order minimum: progress toward the threshold, not an error.
// Green accent only — amber is reserved for stock warnings.
const OrderMinimumNotice = ({
  minimum,
  subtotal,
  remaining,
  showCartLink = false,
}: OrderMinimumNoticeProps) => {
  const progress = Math.min(100, Math.max(0, (subtotal / minimum) * 100))

  return (
    <div
      className="rounded-xl border border-[#b8ff2b]/25 bg-[#b8ff2b]/[0.06] p-4"
      data-testid="order-minimum-notice"
    >
      <div className="flex items-start gap-3">
        <ShoppingBag className="mt-0.5 h-5 w-5 shrink-0 text-[#b8ff2b]" aria-hidden />
        <div className="flex-1">
          <p className="text-sm font-semibold text-white">
            Minimum order for returning customers: ${minimum}
          </p>
          <p className="mt-1 text-sm text-gray-400">
            Add{" "}
            <span className="font-semibold text-[#b8ff2b]">
              ${remaining.toFixed(2)}
            </span>{" "}
            more to place your order.
          </p>
        </div>
      </div>
      <div
        className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-gray-800"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={minimum}
        aria-valuenow={Math.min(subtotal, minimum)}
        aria-label="Progress toward the order minimum"
      >
        <div
          className="h-full rounded-full bg-[#b8ff2b] transition-[width] duration-500 motion-reduce:transition-none"
          style={{ width: `${progress}%` }}
        />
      </div>
      {showCartLink && (
        <LocalizedClientLink
          href="/cart"
          className="mt-3 inline-block text-sm font-semibold text-[#b8ff2b] underline-offset-4 hover:underline"
        >
          Back to cart
        </LocalizedClientLink>
      )}
    </div>
  )
}

export default OrderMinimumNotice
