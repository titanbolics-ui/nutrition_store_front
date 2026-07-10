import { test } from "node:test"
import assert from "node:assert/strict"
import {
  formatRestockEta,
  resolveProductRestockEta,
  resolveProductStockState,
  resolveStockState,
  shouldShowWaitlistForm,
} from "./resolve-stock-state.ts"

function variant(opts: {
  manage_inventory?: boolean
  allow_backorder?: boolean
  inventory_quantity?: number
  restock_eta?: unknown
}) {
  return {
    manage_inventory: opts.manage_inventory ?? true,
    allow_backorder: opts.allow_backorder ?? false,
    inventory_quantity: opts.inventory_quantity,
    metadata:
      opts.restock_eta === undefined ? null : { restock_eta: opts.restock_eta },
  } as any
}

test("manage_inventory: false is always in_stock regardless of quantity", () => {
  assert.equal(
    resolveStockState(variant({ manage_inventory: false, inventory_quantity: 0 })),
    "in_stock"
  )
})

test("allow_backorder: true is always in_stock regardless of quantity", () => {
  assert.equal(
    resolveStockState(variant({ allow_backorder: true, inventory_quantity: 0 })),
    "in_stock"
  )
})

test("quantity above threshold is in_stock", () => {
  assert.equal(
    resolveStockState(variant({ inventory_quantity: 20 })),
    "in_stock"
  )
})

test("quantity at or below threshold (but > 0) is low_stock", () => {
  assert.equal(resolveStockState(variant({ inventory_quantity: 5 })), "low_stock")
  assert.equal(resolveStockState(variant({ inventory_quantity: 1 })), "low_stock")
})

test("quantity of 0 is out_of_stock", () => {
  assert.equal(
    resolveStockState(variant({ inventory_quantity: 0 })),
    "out_of_stock"
  )
})

test("formatRestockEta: valid ISO date renders human-readably", () => {
  assert.equal(formatRestockEta("2026-07-20"), "Jul 20")
})

test("formatRestockEta: free text renders as-is", () => {
  assert.equal(formatRestockEta("~2 weeks"), "~2 weeks")
})

test("formatRestockEta: hyphen-led free text also renders verbatim (not mangled into a date)", () => {
  // Reported as "the formatter mangled ~2 weeks into -2 weeks" — the actual stored
  // value turned out to be a literal hyphen (data entry slip, not a code bug).
  // This documents that a leading "-" is not treated as ISO-date-shaped either way.
  assert.equal(formatRestockEta("-2 weeks"), "-2 weeks")
})

test("formatRestockEta: ISO-shaped but invalid date degrades to null", () => {
  assert.equal(formatRestockEta("2026-13-45"), null)
})

test("formatRestockEta: missing/empty degrades to null", () => {
  assert.equal(formatRestockEta(undefined), null)
  assert.equal(formatRestockEta(""), null)
})

test("resolveProductStockState: mixed variants resolve to the best state", () => {
  const product = {
    variants: [
      variant({ inventory_quantity: 0 }),
      variant({ inventory_quantity: 20 }),
    ],
  } as any
  assert.equal(resolveProductStockState(product), "in_stock")
})

test("resolveProductStockState: all variants out of stock resolves to out_of_stock", () => {
  const product = {
    variants: [
      variant({ inventory_quantity: 0 }),
      variant({ inventory_quantity: 0 }),
    ],
  } as any
  assert.equal(resolveProductStockState(product), "out_of_stock")
})

test("PDP badge: all variants OOS with no selection reads out_of_stock, not the button default", () => {
  // The button's own resolver defaults an unselected variant to in_stock —
  // but the badge must use resolveProductStockState in that case, not
  // resolveStockState(undefined), or a fully-OOS product would lie.
  assert.equal(resolveStockState(undefined), "in_stock")

  const product = {
    variants: [
      variant({ inventory_quantity: 0 }),
      variant({ inventory_quantity: 0 }),
    ],
  } as any
  assert.equal(resolveProductStockState(product), "out_of_stock")
})

test("resolveProductRestockEta: all variants share the same eta", () => {
  const product = {
    variants: [
      variant({ inventory_quantity: 0, restock_eta: "2026-07-20" }),
      variant({ inventory_quantity: 0, restock_eta: "2026-07-20" }),
    ],
  } as any
  assert.equal(resolveProductRestockEta(product), "2026-07-20")
})

test("resolveProductRestockEta: variants disagree, no eta shown", () => {
  const product = {
    variants: [
      variant({ inventory_quantity: 0, restock_eta: "2026-07-20" }),
      variant({ inventory_quantity: 0, restock_eta: "~2 weeks" }),
    ],
  } as any
  assert.equal(resolveProductRestockEta(product), null)
})

test("resolveProductRestockEta: only some variants have an eta, no eta shown", () => {
  const product = {
    variants: [
      variant({ inventory_quantity: 0, restock_eta: "2026-07-20" }),
      variant({ inventory_quantity: 0 }),
    ],
  } as any
  assert.equal(resolveProductRestockEta(product), null)
})

test("shouldShowWaitlistForm: out_of_stock + a selected variant → true", () => {
  assert.equal(shouldShowWaitlistForm("out_of_stock", true), true)
})

test("shouldShowWaitlistForm: out_of_stock but no variant selected yet → false", () => {
  assert.equal(shouldShowWaitlistForm("out_of_stock", false), false)
})

test("shouldShowWaitlistForm: in_stock or low_stock never shows it, even with a variant", () => {
  assert.equal(shouldShowWaitlistForm("in_stock", true), false)
  assert.equal(shouldShowWaitlistForm("low_stock", true), false)
})
