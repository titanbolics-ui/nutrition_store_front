import { Heading } from "@medusajs/ui"

import ItemsPreviewTemplate from "@modules/cart/templates/preview"
import DiscountCode from "@modules/checkout/components/discount-code"
import StoreCredits from "@modules/checkout/components/store-credits"
import CartTotals from "@modules/common/components/cart-totals"
import Divider from "@modules/common/components/divider"
import { getStoreCreditAccounts } from "@lib/data/store-credits"

type WarehouseItemsMetadata = Record<
  string,
  { locationName: string; items: { title: string; quantity: number }[] }
>

const CheckoutSummary = async ({ cart }: { cart: any }) => {
  const storeCreditAccounts = await getStoreCreditAccounts(cart.currency_code ?? "usd")
  // Sum all shipping methods so the total reflects multi-warehouse shipping
  const shippingSubtotal: number =
    cart.shipping_methods?.reduce(
      (sum: number, m: any) => sum + (m.amount ?? 0),
      0
    ) ?? cart.shipping_subtotal ?? 0

  // cart.total is backend-computed and already accounts for credit lines
  // (store credit AND gift cards) — never recompute it manually
  const correctedTotals = {
    ...cart,
    shipping_subtotal: shippingSubtotal,
  }

  const warehouseItems: WarehouseItemsMetadata =
    cart.metadata?.warehouse_items ?? {}

  return (
    <div className="sticky top-0 flex flex-col-reverse small:flex-col gap-y-6 py-6 small:py-0">
      <div className="w-full bg-zinc-950 border border-white/[0.07] rounded-2xl p-5 flex flex-col gap-y-0">
        <Divider className="mb-5 small:hidden border-white/[0.07]" />
        <Heading
          level="h2"
          className="text-base font-semibold text-white mb-4"
        >
          In your Cart
        </Heading>
        <ItemsPreviewTemplate cart={cart} warehouseItems={warehouseItems} />
        <div className="mt-4 mb-3 border-t border-white/[0.06] pt-3 flex flex-col gap-3">
          <DiscountCode cart={cart} />
          <StoreCredits cart={cart} accounts={storeCreditAccounts} />
        </div>
        <CartTotals totals={correctedTotals} />
      </div>
    </div>
  )
}

export default CheckoutSummary
