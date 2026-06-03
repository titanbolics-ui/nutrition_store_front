import { listCartShippingMethods } from "@lib/data/fulfillment"
import { listCartPaymentMethods } from "@lib/data/payment"
import { HttpTypes } from "@medusajs/types"

type WarehouseItemsMetadata = Record<
  string,
  { locationName: string; items: { title: string; quantity: number }[] }
>
import Addresses from "@modules/checkout/components/addresses"
import { CheckoutTracker } from "@modules/checkout/components/checkout-tracker"
import Payment from "@modules/checkout/components/payment"
import Review from "@modules/checkout/components/review"
import Shipping from "@modules/checkout/components/shipping"

export default async function CheckoutForm({
  cart,
  customer,
}: {
  cart: HttpTypes.StoreCart | null
  customer: HttpTypes.StoreCustomer | null
}) {
  if (!cart) {
    return null
  }

  const shippingMethods = await listCartShippingMethods(cart.id)
  const paymentMethods = await listCartPaymentMethods(cart.region?.id ?? "")

  if (!shippingMethods || !paymentMethods) {
    return null
  }

  const warehouseItems =
    (cart.metadata?.warehouse_items as WarehouseItemsMetadata | undefined) ??
    {}

  return (
    <div className="w-full grid grid-cols-1 gap-y-8">
      <CheckoutTracker cart={cart} />
      <Addresses cart={cart} customer={customer} />

      <Shipping
        cart={cart}
        availableShippingMethods={shippingMethods}
        warehouseItems={warehouseItems}
      />

      <Payment cart={cart} availablePaymentMethods={paymentMethods} />

      <Review cart={cart} />
    </div>
  )
}
