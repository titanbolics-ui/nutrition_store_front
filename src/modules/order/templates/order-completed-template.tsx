import { cookies as nextCookies } from "next/headers"
import { isCashApp, isManual } from "@lib/constants"

import CartTotals from "@modules/common/components/cart-totals"
import Fulfillments from "@modules/order/components/fulfillments"
import Help from "@modules/order/components/help"
import Items from "@modules/order/components/items"
import OnboardingCta from "@modules/order/components/onboarding-cta"
import OrderDetails from "@modules/order/components/order-details"
import { OrderTracking } from "@modules/order/components/order-tracking"
import ShippingDetails from "@modules/order/components/shipping-details"
import PaymentDetails from "@modules/order/components/payment-details"
import ChangellyWidget from "@modules/order/components/changelly-widget"
import PaymentInstructions from "@modules/order/components/payment-instructions"
import { HttpTypes } from "@medusajs/types"

type OrderCompletedTemplateProps = {
  order: HttpTypes.StoreOrder
}

export default async function OrderCompletedTemplate({
  order,
}: OrderCompletedTemplateProps) {
  const cookies = await nextCookies()
  const isOnboarding = cookies.get("_medusa_onboarding")?.value === "true"

  const providerId =
    order.payment_collections?.[0]?.payments?.[0]?.provider_id ||
    order.payment_collections?.[0]?.payment_sessions?.[0]?.provider_id ||
    ""
  const awaitingPayment = (isCashApp(providerId) || isManual(providerId)) && order.payment_status !== "captured"

  const warehouseItems =
    ((order.metadata?.warehouse_items ?? {}) as Record<
      string,
      { locationName: string; items: { title: string; quantity: number }[] }
    >)

  return (
    <div className="pt-16 min-h-[calc(100vh-64px)]">
      <OrderTracking order={order} />
      <div className="w-full max-w-4xl mx-auto sm:px-4 py-4 sm:py-8">
        {isOnboarding && <OnboardingCta orderId={order.id} />}
        <div
          className="flex flex-col gap-4 bg-zinc-950 sm:border sm:border-white/[0.07] sm:rounded-2xl w-full px-4 py-5 sm:p-6"
          data-testid="order-complete-container"
        >
          <div className="flex flex-col gap-y-1 mb-2">
            <h1 className="text-2xl font-bold text-white">Thank you!</h1>
            <p className="text-base text-gray-400">Your order was placed successfully.</p>
          </div>

          <OrderDetails order={order} />

          {/* Payment instructions shown first if awaiting manual payment */}
          {awaitingPayment && <PaymentInstructions order={order} />}

          <div className="mt-2">
            <h2 className="text-base font-semibold text-white mb-4">Order Summary</h2>
            <Items order={order} warehouseItems={warehouseItems} />
            <div className="mt-4">
              <CartTotals totals={order} />
            </div>
          </div>

          <Fulfillments order={order} warehouseItems={warehouseItems} />
          <ShippingDetails order={order} />
          <PaymentDetails order={order} />
          <ChangellyWidget order={order} />

          {/* Show again below for non-manual payments, or skip if already shown */}
          {!awaitingPayment && <PaymentInstructions order={order} />}

          <Help />
        </div>
      </div>
    </div>
  )
}
