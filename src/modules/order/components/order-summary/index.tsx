import { convertToLocale } from "@lib/util/money"
import { HttpTypes } from "@medusajs/types"

type OrderSummaryProps = {
  order: HttpTypes.StoreOrder
}

const OrderSummary = ({ order }: OrderSummaryProps) => {
  const getAmount = (amount?: number | null) => {
    if (amount == null) {
      return convertToLocale({ amount: 0, currency_code: order.currency_code })
    }

    return convertToLocale({
      amount,
      currency_code: order.currency_code,
    })
  }

  // order.subtotal includes shipping in Medusa — show items-only like checkout
  const itemSubtotal =
    (order as any).item_subtotal ??
    Number(order.subtotal ?? 0) - Number(order.shipping_total ?? 0)

  // credit lines split by reference — store credit and gift cards are both
  // credit lines in the loyalty plugin
  const creditLines: any[] = (order as any).credit_lines ?? []
  const sumLines = (ref: string) =>
    creditLines
      .filter((cl) => cl?.reference === ref)
      .reduce((s, cl) => s + Number(cl?.total ?? cl?.amount ?? 0), 0)

  let storeCreditTotal = sumLines("store-credit")
  const giftCardCreditTotal = sumLines("gift-card")
  const otherCreditTotal =
    creditLines.length > 0
      ? creditLines.reduce((s, cl) => s + Number(cl?.total ?? cl?.amount ?? 0), 0) -
        storeCreditTotal - giftCardCreditTotal
      : Number((order as any).credit_line_total ?? 0)
  // anything unattributed (or credit_line_total-only payloads) shows as store credit
  storeCreditTotal += otherCreditTotal

  return (
    <div className="mt-4">
      <h2 className="text-base-semi text-white mb-4">Order Summary</h2>
      <div className="text-small-regular text-gray-400">
        <div className="flex items-center justify-between text-base-regular text-gray-300 mb-3">
          <span>Subtotal</span>
          <span>{getAmount(itemSubtotal)}</span>
        </div>
        <div className="flex flex-col gap-y-2">
          {order.discount_total > 0 && (
            <div className="flex items-center justify-between text-green-400">
              <span>Discount</span>
              <span>- {getAmount(order.discount_total)}</span>
            </div>
          )}
          {order.gift_card_total > 0 && (
            <div className="flex items-center justify-between text-green-400">
              <span>Gift Card</span>
              <span>- {getAmount(order.gift_card_total)}</span>
            </div>
          )}
          <div className="flex items-center justify-between">
            <span>Shipping</span>
            <span>{getAmount(order.shipping_total)}</span>
          </div>
          {storeCreditTotal > 0 && (
            <div className="flex items-center justify-between text-green-400">
              <span>Store credit</span>
              <span>- {getAmount(storeCreditTotal)}</span>
            </div>
          )}
          {giftCardCreditTotal > 0 && (
            <div className="flex items-center justify-between text-green-400">
              <span>Gift card</span>
              <span>- {getAmount(giftCardCreditTotal)}</span>
            </div>
          )}
          <div className="flex items-center justify-between">
            <span>Taxes</span>
            <span>{getAmount(order.tax_total)}</span>
          </div>
        </div>
        
        {/* Total - виділений блок */}
        <div className="mt-6 -mx-4 sm:-mx-6 px-4 sm:px-6 py-3 sm:py-4 bg-[#b8ff2b]/10 border-t border-b border-[#b8ff2b]/20">
          <div className="flex items-center justify-between">
            <span className="text-white font-bold text-base sm:text-lg">Total</span>
            <span className="text-[#b8ff2b] font-bold text-lg sm:text-xl">{getAmount(order.total)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OrderSummary
