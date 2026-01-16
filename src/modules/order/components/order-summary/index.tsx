import { convertToLocale } from "@lib/util/money"
import { HttpTypes } from "@medusajs/types"

type OrderSummaryProps = {
  order: HttpTypes.StoreOrder
}

const OrderSummary = ({ order }: OrderSummaryProps) => {
  const getAmount = (amount?: number | null) => {
    if (!amount) {
      return
    }

    return convertToLocale({
      amount,
      currency_code: order.currency_code,
    })
  }

  return (
    <div className="mt-4">
      <h2 className="text-base-semi text-white mb-4">Order Summary</h2>
      <div className="text-small-regular text-gray-400">
        <div className="flex items-center justify-between text-base-regular text-gray-300 mb-3">
          <span>Subtotal</span>
          <span>{getAmount(order.subtotal)}</span>
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
