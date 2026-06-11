"use client"

import { convertToLocale } from "@lib/util/money"
import React from "react"

type CartTotalsProps = {
  totals: {
    total?: number | null
    subtotal?: number | null
    tax_total?: number | null
    currency_code: string
    item_subtotal?: number | null
    shipping_subtotal?: number | null
    discount_subtotal?: number | null
    credit_lines?: { reference?: string; amount?: number }[] | null
  }
}

const CartTotals: React.FC<CartTotalsProps> = ({ totals }) => {
  const {
    currency_code,
    total,
    tax_total,
    item_subtotal,
    shipping_subtotal,
    discount_subtotal,
    credit_lines,
  } = totals

  const storeCreditApplied = (credit_lines ?? [])
    .filter((l) => l.reference === "store-credit")
    .reduce((sum, l) => sum + (l.amount ?? 0), 0)

  const giftCardApplied = (credit_lines ?? [])
    .filter((l) => l.reference === "gift-card")
    .reduce((sum, l) => sum + (l.amount ?? 0), 0)

  return (
    <div className="pt-1">
      <div className="flex flex-col gap-y-2.5 text-sm text-gray-400">
        <div className="flex items-center justify-between">
          <span>Subtotal</span>
          <span data-testid="cart-subtotal" data-value={item_subtotal || 0}>
            {convertToLocale({ amount: item_subtotal ?? 0, currency_code })}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span>Shipping</span>
          <span data-testid="cart-shipping" data-value={shipping_subtotal || 0}>
            {convertToLocale({ amount: shipping_subtotal ?? 0, currency_code })}
          </span>
        </div>
        {!!discount_subtotal && (
          <div className="flex items-center justify-between">
            <span>Discount</span>
            <span
              className="text-[#b8ff2b]"
              data-testid="cart-discount"
              data-value={discount_subtotal || 0}
            >
              -{convertToLocale({ amount: discount_subtotal ?? 0, currency_code })}
            </span>
          </div>
        )}
        {storeCreditApplied > 0 && (
          <div className="flex items-center justify-between">
            <span>Store credit</span>
            <span className="text-[#b8ff2b]">
              -{convertToLocale({ amount: storeCreditApplied, currency_code })}
            </span>
          </div>
        )}
        {giftCardApplied > 0 && (
          <div className="flex items-center justify-between">
            <span>Gift card</span>
            <span className="text-[#b8ff2b]">
              -{convertToLocale({ amount: giftCardApplied, currency_code })}
            </span>
          </div>
        )}
        <div className="flex justify-between">
          <span>Taxes</span>
          <span data-testid="cart-taxes" data-value={tax_total || 0}>
            {convertToLocale({ amount: tax_total ?? 0, currency_code })}
          </span>
        </div>
      </div>

      <div className="h-px w-full bg-white/[0.06] my-4" />

      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-white">Total</span>
        <span
          className="text-xl font-bold text-[#b8ff2b]"
          data-testid="cart-total"
          data-value={total || 0}
        >
          {convertToLocale({ amount: total ?? 0, currency_code })}
        </span>
      </div>
    </div>
  )
}

export default CartTotals
