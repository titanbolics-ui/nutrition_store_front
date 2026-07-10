import { clx } from "@medusajs/ui"
import { formatRestockEta, StockState } from "@lib/util/resolve-stock-state"

export default function StockBadge({
  state,
  restockEta,
  className,
  variant = "pill",
}: {
  state: StockState
  restockEta?: unknown
  className?: string
  // "pill" (default): low_stock gets the amber pill treatment — used on the
  // PDP. "plain": low_stock reads as plain gray text, same weight as
  // out_of_stock/in_stock — used on listing cards, where the amber pill now
  // lives on the image badge instead, so this line stays a quiet footnote.
  variant?: "pill" | "plain"
}) {
  if (state === "in_stock") {
    return (
      <span
        className={clx("text-xs text-gray-400", className)}
        data-testid="stock-badge"
        data-stock-state={state}
      >
        In Stock
      </span>
    )
  }

  if (state === "low_stock") {
    if (variant === "plain") {
      return (
        <span
          className={clx("text-xs text-gray-500", className)}
          data-testid="stock-badge"
          data-stock-state={state}
        >
          Low Stock
        </span>
      )
    }

    return (
      <span
        className={clx(
          "inline-flex items-center text-xs font-medium rounded-full px-2 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/25",
          className
        )}
        data-testid="stock-badge"
        data-stock-state={state}
      >
        Low Stock
      </span>
    )
  }

  const eta = formatRestockEta(restockEta)

  return (
    <span
      className={clx("text-xs text-gray-500", className)}
      data-testid="stock-badge"
      data-stock-state={state}
    >
      Out of stock{eta ? ` · Back around ${eta}` : ""}
    </span>
  )
}
