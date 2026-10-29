import { getOrderMinimum, retrieveCart } from "@lib/data/cart"
import { retrieveCustomer } from "@lib/data/customer"
import OrderMinimumNotice from "@modules/cart/components/order-minimum-notice"
import PaymentWrapper from "@modules/checkout/components/payment-wrapper"
import CheckoutForm from "@modules/checkout/templates/checkout-form"
import CheckoutSummary from "@modules/checkout/templates/checkout-summary"
import { Metadata } from "next"
import { notFound } from "next/navigation"

export const metadata: Metadata = {
  title: "Checkout",
}

export default async function Checkout() {
  const cart = await retrieveCart()

  if (!cart) {
    return notFound()
  }

  const customer = await retrieveCustomer()
  const orderMinimum = await getOrderMinimum(cart.id)
  const belowMinimum = !!orderMinimum?.applies && orderMinimum.remaining > 0

  return (
    <div className="grid grid-cols-1 small:grid-cols-[1fr_416px] content-container gap-x-40 py-12">
      <div className="flex flex-col gap-y-6">
        {belowMinimum && orderMinimum && (
          <OrderMinimumNotice
            minimum={orderMinimum.minimum}
            subtotal={orderMinimum.subtotal}
            remaining={orderMinimum.remaining}
            showCartLink
          />
        )}
        <PaymentWrapper cart={cart}>
          <CheckoutForm cart={cart} customer={customer} />
        </PaymentWrapper>
      </div>
      <CheckoutSummary cart={cart} />
    </div>
  )
}
