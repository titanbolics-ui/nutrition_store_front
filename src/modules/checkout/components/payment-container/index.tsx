import { Radio as RadioGroupOption } from "@headlessui/react"
import { Text, clx } from "@medusajs/ui"
import React, { useContext, useMemo, type JSX } from "react"

import Radio from "@modules/common/components/radio"

import { isCashApp, isManual } from "@lib/constants"
import SkeletonCardDetails from "@modules/skeletons/components/skeleton-card-details"
import { CardElement } from "@stripe/react-stripe-js"
import { StripeCardElementOptions } from "@stripe/stripe-js"
import PaymentTest from "../payment-test"
import { StripeContext } from "../payment-wrapper/stripe-wrapper"

type PaymentContainerProps = {
  paymentProviderId: string
  selectedPaymentOptionId: string | null
  disabled?: boolean
  paymentInfoMap: Record<string, { title: string; icon: JSX.Element }>
  children?: React.ReactNode
}

const PaymentContainer: React.FC<PaymentContainerProps> = ({
  paymentProviderId,
  selectedPaymentOptionId,
  paymentInfoMap,
  disabled = false,
  children,
}) => {
  const isDevelopment = process.env.NODE_ENV === "development"

  const isCashAppProvider = isCashApp(paymentProviderId)

  return (
    <RadioGroupOption
      key={paymentProviderId}
      value={paymentProviderId}
      disabled={disabled}
      className={clx(
        "flex flex-col gap-y-2 text-small-regular cursor-pointer py-4 border rounded-rounded px-8 mb-2 transition-all duration-200",
        {
          // Стилі для звичайних методів
          "border-ui-border-base hover:shadow-borders-interactive-with-active":
            !isCashAppProvider,
          "border-ui-border-interactive":
            selectedPaymentOptionId === paymentProviderId && !isCashAppProvider,

          // 🟢 Стилі для CASH APP (Зелені)
          "border-emerald-200 bg-[#fdfdfd] hover:border-emerald-400 hover:shadow-md":
            isCashAppProvider,
          "border-emerald-500 bg-emerald-50/30 ring-1 ring-emerald-500":
            isCashAppProvider && selectedPaymentOptionId === paymentProviderId,
        }
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-x-4">
          <Radio checked={selectedPaymentOptionId === paymentProviderId} />

          <div className="flex flex-col">
            <Text
              className={clx("text-base-regular flex items-center gap-2", {
                "font-semibold text-emerald-900": isCashAppProvider,
              })}
            >
              {paymentInfoMap[paymentProviderId]?.title || paymentProviderId}

              {/* Бейдж для Cash App */}
              {isCashAppProvider && (
                <span className="bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ml-2">
                  Fastest
                </span>
              )}
            </Text>

            {/* Підзаголовок для Cash App (видимий завжди) */}
            {isCashAppProvider && (
              <Text className="text-[11px] text-gray-500 mt-0.5">
                Pay instantly via Debit/Credit Card
              </Text>
            )}
          </div>

          {isManual(paymentProviderId) && isDevelopment && (
            <PaymentTest className="hidden small:block" />
          )}
        </div>

        <span className="justify-self-end text-ui-fg-base">
          {paymentInfoMap[paymentProviderId]?.icon}
        </span>
      </div>

      {/* 🟢 ЗЕЛЕНИЙ БЛОК ІНСТРУКЦІЇ (Тільки коли вибрано Cash App) */}
      {isCashAppProvider && selectedPaymentOptionId === paymentProviderId && (
        <div className="mt-3 pt-3 border-t border-emerald-200/50">
          <div className="bg-white p-3 rounded border border-emerald-100 shadow-sm">
            <p className="text-[12px] text-emerald-800 font-medium mb-1">
              ⚡ Quick Instructions:
            </p>
            <ul className="list-disc list-inside text-[11px] text-gray-600 space-y-0.5 pl-1">
              <li>No crypto wallet needed.</li>
              <li>Buy Bitcoin inside Cash App in 60 seconds.</li>
              <li>Send to our address (shown on next step).</li>
            </ul>
          </div>
        </div>
      )}

      {isManual(paymentProviderId) && isDevelopment && (
        <PaymentTest className="small:hidden text-[10px]" />
      )}
      {children}
    </RadioGroupOption>
  )
}

export default PaymentContainer

export const StripeCardContainer = ({
  paymentProviderId,
  selectedPaymentOptionId,
  paymentInfoMap,
  disabled = false,
  setCardBrand,
  setError,
  setCardComplete,
}: Omit<PaymentContainerProps, "children"> & {
  setCardBrand: (brand: string) => void
  setError: (error: string | null) => void
  setCardComplete: (complete: boolean) => void
}) => {
  const stripeReady = useContext(StripeContext)

  const useOptions: StripeCardElementOptions = useMemo(() => {
    return {
      style: {
        base: {
          fontFamily: "Inter, sans-serif",
          color: "#424270",
          "::placeholder": {
            color: "rgb(107 114 128)",
          },
        },
      },
      classes: {
        base: "pt-3 pb-1 block w-full h-11 px-4 mt-0 bg-ui-bg-field border rounded-md appearance-none focus:outline-none focus:ring-0 focus:shadow-borders-interactive-with-active border-ui-border-base hover:bg-ui-bg-field-hover transition-all duration-300 ease-in-out",
      },
    }
  }, [])

  return (
    <PaymentContainer
      paymentProviderId={paymentProviderId}
      selectedPaymentOptionId={selectedPaymentOptionId}
      paymentInfoMap={paymentInfoMap}
      disabled={disabled}
    >
      {selectedPaymentOptionId === paymentProviderId &&
        (stripeReady ? (
          <div className="my-4 transition-all duration-150 ease-in-out">
            <Text className="txt-medium-plus text-ui-fg-base mb-1">
              Enter your card details:
            </Text>
            <CardElement
              options={useOptions as StripeCardElementOptions}
              onChange={(e) => {
                setCardBrand(
                  e.brand && e.brand.charAt(0).toUpperCase() + e.brand.slice(1)
                )
                setError(e.error?.message || null)
                setCardComplete(e.complete)
              }}
            />
          </div>
        ) : (
          <SkeletonCardDetails />
        ))}
    </PaymentContainer>
  )
}
