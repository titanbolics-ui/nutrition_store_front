"use client"

import {
  isCashApp,
  isCryptoManual,
  isPaypalManual,
  isStripeLike,
} from "@lib/constants"
import { placeOrder } from "@lib/data/cart"
import { HttpTypes } from "@medusajs/types"
import { Button } from "@medusajs/ui"
import { useElements, useStripe } from "@stripe/react-stripe-js"
import React, { useState } from "react"
import ErrorMessage from "../error-message"

type PaymentButtonProps = {
  cart: HttpTypes.StoreCart
  "data-testid": string
}

const PaymentButton: React.FC<PaymentButtonProps> = ({
  cart,
  "data-testid": dataTestId,
}) => {
  const notReady =
    !cart ||
    !cart.shipping_address ||
    !cart.billing_address ||
    !cart.email ||
    (cart.shipping_methods?.length ?? 0) < 1

  const paymentSession = cart.payment_collection?.payment_sessions?.[0]
  const providerId = paymentSession?.provider_id

  switch (true) {
    // 1. STRIPE
    case isStripeLike(providerId):
      return (
        <StripePaymentButton
          notReady={notReady}
          cart={cart}
          data-testid={dataTestId}
        />
      )

    // 2. PAYPAL (SYSTEM DEFAULT)
    case isPaypalManual(providerId):
      return <PayPalManualButton notReady={notReady} data-testid={dataTestId} />

    // 3. CRYPTO (BITCOIN)
    case isCryptoManual(providerId):
      return (
        <CryptoPaymentButton notReady={notReady} data-testid={dataTestId} />
      )

    // 4. CASH APP
    case isCashApp(providerId):
      return (
        <CashAppPaymentButton notReady={notReady} data-testid={dataTestId} />
      )

    default:
      return <Button disabled>Select a payment method</Button>
  }
}

// COMPONENT FOR PAYPAL (SYSTEM DEFAULT)
const PayPalManualButton = ({ notReady }: { notReady: boolean }) => {
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const onPaymentCompleted = async () => {
    await placeOrder()
      .catch((err) => {
        setErrorMessage(err.message)
      })
      .finally(() => {
        setSubmitting(false)
      })
  }

  const handlePayment = () => {
    setSubmitting(true)
    onPaymentCompleted()
  }

  return (
    <>
      <Button
        disabled={notReady}
        isLoading={submitting}
        onClick={handlePayment}
        size="large"
        className="w-full text-base font-bold uppercase tracking-wider bg-[#0070BA] hover:bg-[#005A92] text-white"
        data-testid="submit-order-button"
      >
        Place Order & Pay with PayPal
      </Button>
      <ErrorMessage
        error={errorMessage}
        data-testid="manual-payment-error-message"
      />
      {!notReady && (
        <p className="text-xs text-gray-500 mt-2 text-center">
          Instructions for PayPal transfer will be sent to your email.
        </p>
      )}
    </>
  )
}

// COMPONENT FOR CRYPTO (PREVIOUS MANUAL)
const CryptoPaymentButton = ({ notReady }: { notReady: boolean }) => {
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const onPaymentCompleted = async () => {
    await placeOrder()
      .catch((err) => {
        setErrorMessage(err.message)
      })
      .finally(() => {
        setSubmitting(false)
      })
  }

  const handlePayment = () => {
    setSubmitting(true)
    onPaymentCompleted()
  }

  return (
    <>
      <Button
        disabled={notReady}
        isLoading={submitting}
        onClick={handlePayment}
        size="large"
        className="w-full text-base font-bold uppercase tracking-wider"
        data-testid="submit-order-button"
      >
        Place Order & Pay with Bitcoin
      </Button>
      <ErrorMessage
        error={errorMessage}
        data-testid="manual-payment-error-message"
      />

      {/* Hint for the user under the button */}
      {!notReady && (
        <p className="text-xs text-gray-500 mt-2 text-center">
          You will receive the wallet address on the next step.
        </p>
      )}
    </>
  )
}

// COMPONENT FOR CASH APP (STYLED)
const CashAppPaymentButton = ({ notReady }: { notReady: boolean }) => {
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const onPaymentCompleted = async () => {
    await placeOrder()
      .catch((err) => {
        setErrorMessage(err.message)
      })
      .finally(() => {
        setSubmitting(false)
      })
  }

  const handlePayment = () => {
    setSubmitting(true)
    onPaymentCompleted()
  }

  return (
    <>
      <Button
        disabled={notReady}
        isLoading={submitting}
        onClick={handlePayment}
        size="large"
        // 👇 ЗЕЛЕНИЙ СТИЛЬ CASH APP (м'який зелений)
        className="w-full h-14 text-base font-bold uppercase tracking-wider bg-[#16A34A] hover:bg-[#15803D] text-white border-none transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
        data-testid="submit-order-button"
      >
        Place Order & Pay with Cash App
      </Button>

      <ErrorMessage
        error={errorMessage}
        data-testid="manual-payment-error-message"
      />

      {!notReady && (
        <p className="text-[11px] text-green-700 mt-2 text-center font-medium bg-green-50 py-1 px-2 rounded">
          ⚡ Instant confirmation. Card accepted.
        </p>
      )}
    </>
  )
}

// COMPONENT FOR STRIPE
const StripePaymentButton = ({
  cart,
  notReady,
  "data-testid": dataTestId,
}: {
  cart: HttpTypes.StoreCart
  notReady: boolean
  "data-testid"?: string
}) => {
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const onPaymentCompleted = async () => {
    await placeOrder()
      .catch((err) => {
        setErrorMessage(err.message)
      })
      .finally(() => {
        setSubmitting(false)
      })
  }

  const stripe = useStripe()
  const elements = useElements()
  const card = elements?.getElement("card")

  const session = cart.payment_collection?.payment_sessions?.find(
    (s) => s.status === "pending"
  )

  const disabled = !stripe || !elements ? true : false

  const handlePayment = async () => {
    setSubmitting(true)
    if (!stripe || !elements || !card || !cart) {
      setSubmitting(false)
      return
    }

    await stripe
      .confirmCardPayment(session?.data.client_secret as string, {
        payment_method: {
          card: card,
          billing_details: {
            name:
              cart.billing_address?.first_name +
              " " +
              cart.billing_address?.last_name,
            address: {
              city: cart.billing_address?.city ?? undefined,
              country: cart.billing_address?.country_code ?? undefined,
              line1: cart.billing_address?.address_1 ?? undefined,
              line2: cart.billing_address?.address_2 ?? undefined,
              postal_code: cart.billing_address?.postal_code ?? undefined,
              state: cart.billing_address?.province ?? undefined,
            },
            email: cart.email,
            phone: cart.billing_address?.phone ?? undefined,
          },
        },
      })
      .then(({ error, paymentIntent }) => {
        if (error) {
          const pi = error.payment_intent
          if (
            (pi && pi.status === "requires_capture") ||
            (pi && pi.status === "succeeded")
          ) {
            onPaymentCompleted()
          }
          setErrorMessage(error.message || null)
          return
        }
        if (
          (paymentIntent && paymentIntent.status === "requires_capture") ||
          paymentIntent.status === "succeeded"
        ) {
          return onPaymentCompleted()
        }
        return
      })
  }

  return (
    <>
      <Button
        disabled={disabled || notReady}
        onClick={handlePayment}
        size="large"
        isLoading={submitting}
        data-testid={dataTestId}
      >
        Place order
      </Button>
      <ErrorMessage
        error={errorMessage}
        data-testid="stripe-payment-error-message"
      />
    </>
  )
}

export default PaymentButton
