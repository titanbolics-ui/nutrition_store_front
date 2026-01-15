"use client"

import { setAddresses } from "@lib/data/cart"
import {
  trackCheckoutEmailEntered,
  trackCheckoutStepCompleted,
} from "@lib/posthog/checkout-tracking"
import compareAddresses from "@lib/util/compare-addresses"
import { CheckCircleSolid } from "@medusajs/icons"
import { HttpTypes } from "@medusajs/types"
import { Heading, Text, useToggleState } from "@medusajs/ui"
import Divider from "@modules/common/components/divider"
import Spinner from "@modules/common/icons/spinner"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useEffect, useActionState } from "react"
import BillingAddress from "../billing_address"
import ErrorMessage from "../error-message"
import ShippingAddress from "../shipping-address"
import { SubmitButton } from "../submit-button"

const Addresses = ({
  cart,
  customer,
}: {
  cart: HttpTypes.StoreCart | null
  customer: HttpTypes.StoreCustomer | null
}) => {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const isOpen = searchParams.get("step") === "address"

  const { state: sameAsBilling, toggle: toggleSameAsBilling } = useToggleState(
    cart?.shipping_address && cart?.billing_address
      ? compareAddresses(cart?.shipping_address, cart?.billing_address)
      : true
  )

  const handleEdit = () => {
    router.push(pathname + "?step=address")
  }

  const [message, formAction] = useActionState(setAddresses, null)

  // Трекінг після успішного введення email/адреси
  useEffect(() => {
    if (
      !message &&
      cart?.email &&
      cart?.shipping_address?.address_1 &&
      searchParams.get("step") === "delivery"
    ) {
      // Користувач успішно пройшов крок address
      trackCheckoutStepCompleted("address", cart.id)
      if (cart.email) {
        trackCheckoutEmailEntered(cart.id, cart.email, !customer)
      }
    }
  }, [
    cart?.email,
    cart?.shipping_address,
    cart?.id,
    message,
    customer,
    searchParams,
  ])

  return (
    <div className="bg-black">
      <div className="flex flex-row items-center justify-between mb-6">
        <Heading
          level="h2"
          className="flex flex-row text-3xl-regular gap-x-2 items-baseline text-white"
        >
          Shipping Address
          {!isOpen && <CheckCircleSolid className="text-[#b8ff2b]" />}
        </Heading>
        {!isOpen && cart?.shipping_address && (
          <Text>
            <button
              onClick={handleEdit}
              className="text-[#b8ff2b] hover:text-[#b8ff2b]/80 transition-colors"
              data-testid="edit-address-button"
            >
              Edit
            </button>
          </Text>
        )}
      </div>
      {isOpen ? (
        <form action={formAction}>
          <div className="pb-8">
            <ShippingAddress
              customer={customer}
              checked={sameAsBilling}
              onChange={toggleSameAsBilling}
              cart={cart}
            />

            {!sameAsBilling && (
              <div>
                <Heading
                  level="h2"
                  className="text-3xl-regular gap-x-4 pb-6 pt-8 text-white"
                >
                  Billing address
                </Heading>

                <BillingAddress cart={cart} />
              </div>
            )}
            <SubmitButton className="mt-6 bg-[#b8ff2b] text-black hover:bg-[#b8ff2b]/80" data-testid="submit-address-button">
              Continue to delivery
            </SubmitButton>
            <ErrorMessage error={message} data-testid="address-error-message" />
          </div>
        </form>
      ) : (
        <div>
          <div className="text-small-regular">
            {cart && cart.shipping_address ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-4">
                <div
                  className="flex flex-col"
                  data-testid="shipping-address-summary"
                >
                  <Text className="txt-medium-plus text-white mb-1">
                    Shipping Address
                  </Text>
                  <Text className="txt-medium text-gray-400">
                    {cart.shipping_address.first_name}{" "}
                    {cart.shipping_address.last_name}
                  </Text>
                  <Text className="txt-medium text-gray-400">
                    {cart.shipping_address.address_1}{" "}
                    {cart.shipping_address.address_2}
                  </Text>
                  <Text className="txt-medium text-gray-400">
                    {cart.shipping_address.postal_code},{" "}
                    {cart.shipping_address.city}
                  </Text>
                  <Text className="txt-medium text-gray-400">
                    {cart.shipping_address.country_code?.toUpperCase()}
                  </Text>
                </div>

                <div
                  className="flex flex-col"
                  data-testid="shipping-contact-summary"
                >
                  <Text className="txt-medium-plus text-white mb-1">
                    Contact
                  </Text>
                  <Text className="txt-medium text-gray-400">
                    {cart.shipping_address.phone}
                  </Text>
                  <Text className="txt-medium text-gray-400 break-all">
                    {cart.email}
                  </Text>
                </div>

                <div
                  className="flex flex-col"
                  data-testid="billing-address-summary"
                >
                  <Text className="txt-medium-plus text-white mb-1">
                    Billing Address
                  </Text>

                  {sameAsBilling ? (
                    <Text className="txt-medium text-gray-400">
                      Billing and delivery address are the same.
                    </Text>
                  ) : (
                    <>
                      <Text className="txt-medium text-gray-400">
                        {cart.billing_address?.first_name}{" "}
                        {cart.billing_address?.last_name}
                      </Text>
                      <Text className="txt-medium text-gray-400">
                        {cart.billing_address?.address_1}{" "}
                        {cart.billing_address?.address_2}
                      </Text>
                      <Text className="txt-medium text-gray-400">
                        {cart.billing_address?.postal_code},{" "}
                        {cart.billing_address?.city}
                      </Text>
                      <Text className="txt-medium text-gray-400">
                        {cart.billing_address?.country_code?.toUpperCase()}
                      </Text>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <div>
                <Spinner />
              </div>
            )}
          </div>
        </div>
      )}
      <Divider className="mt-8 border-gray-800" />
    </div>
  )
}

export default Addresses
