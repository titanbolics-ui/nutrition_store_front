import type { HttpTypes } from "@medusajs/types"

export type StockState = "in_stock" | "low_stock" | "out_of_stock"

const DEFAULT_LOW_STOCK_THRESHOLD = 5

const STATE_PRIORITY: StockState[] = ["in_stock", "low_stock", "out_of_stock"]

function getLowStockThreshold(): number {
  const raw = process.env.NEXT_PUBLIC_LOW_STOCK_THRESHOLD
  const n = raw ? Number(raw) : NaN
  return Number.isFinite(n) && n > 0 ? n : DEFAULT_LOW_STOCK_THRESHOLD
}

/**
 * Per-variant stock state. No variant selected yet is treated as `in_stock` —
 * safe for gating (an independent `!selectedVariant` check disables the button
 * regardless) but NOT safe to feed directly into a display badge; use
 * `resolveProductStockState` for that when no variant is selected.
 */
export function resolveStockState(
  variant?: HttpTypes.StoreProductVariant
): StockState {
  if (!variant) {
    return "in_stock"
  }
  if (!variant.manage_inventory) {
    return "in_stock"
  }
  if (variant.allow_backorder) {
    return "in_stock"
  }

  const qty = variant.inventory_quantity ?? 0
  if (qty <= 0) {
    return "out_of_stock"
  }
  if (qty <= getLowStockThreshold()) {
    return "low_stock"
  }
  return "in_stock"
}

/**
 * Gate for the out-of-stock waitlist block: only once a concrete variant is
 * selected and it's genuinely out of stock (not just "no variant chosen yet",
 * which `resolveStockState` reports as `in_stock`).
 */
export function shouldShowWaitlistForm(
  stockState: StockState,
  hasSelectedVariant: boolean
): boolean {
  return stockState === "out_of_stock" && hasSelectedVariant
}

/**
 * Aggregate stock state across all of a product's variants, for contexts with
 * no single selected variant (listing cards, or a PDP before selection). Only
 * reads "out_of_stock" when every variant is out of stock.
 */
export function resolveProductStockState(
  product: HttpTypes.StoreProduct
): StockState {
  const variants = product.variants ?? []
  if (variants.length === 0) {
    return "in_stock"
  }

  return variants
    .map(resolveStockState)
    .reduce((best, state) =>
      STATE_PRIORITY.indexOf(state) < STATE_PRIORITY.indexOf(best)
        ? state
        : best
    )
}

/**
 * Restock ETA to show on a listing card, where there's no single selected
 * variant. Only returned when every variant shares the exact same value —
 * never attributes one variant's promise to the whole product.
 */
export function resolveProductRestockEta(
  product: HttpTypes.StoreProduct
): unknown {
  const variants = product.variants ?? []
  if (variants.length === 0) {
    return null
  }

  const etas = variants.map((v) => v.metadata?.restock_eta)
  const [first] = etas
  return etas.every((eta) => eta === first) ? first : null
}

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/

/**
 * Display value for a restock_eta (not the full sentence). An ISO date is
 * rendered human-readably; free text is rendered as-is; anything that looks
 * like a date but fails to parse degrades to `null` (plain "Out of stock").
 */
export function formatRestockEta(raw: unknown): string | null {
  if (typeof raw !== "string" || raw.trim().length === 0) {
    return null
  }

  if (ISO_DATE_RE.test(raw)) {
    const date = new Date(raw)
    if (Number.isNaN(date.getTime())) {
      return null
    }
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      timeZone: "UTC",
    }).format(date)
  }

  return raw
}
