import { Heading } from "@medusajs/ui"

import ItemsPreviewTemplate from "@modules/cart/templates/preview"
import DiscountCode from "@modules/checkout/components/discount-code"
import CartTotals from "@modules/common/components/cart-totals"
import Divider from "@modules/common/components/divider"

const CheckoutSummary = ({ cart }: { cart: any }) => {
  return (
    <div className="sticky top-0 flex flex-col-reverse small:flex-col gap-y-8 py-8 small:py-0 ">
      <div className="w-full bg-gray-900 border border-gray-800 rounded-xl p-6 flex flex-col">
        <Divider className="my-6 small:hidden border-gray-800" />
        <Heading
          level="h2"
          className="flex flex-row text-3xl-regular items-baseline text-white"
        >
          In your Cart
        </Heading>
        <Divider className="my-6 border-gray-800" />
        <ItemsPreviewTemplate cart={cart} />
        <div className="my-6">
          <DiscountCode cart={cart} />
        </div>
        <CartTotals totals={cart} />
      </div>
    </div>
  )
}

export default CheckoutSummary
