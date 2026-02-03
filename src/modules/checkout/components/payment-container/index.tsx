import { Radio as RadioGroupOption } from "@headlessui/react"
import { Text, clx } from "@medusajs/ui"
import React, { useContext, useMemo, type JSX } from "react"

import Radio from "@modules/common/components/radio"

import { isCardManual, isCashApp, isManual } from "@lib/constants"
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

  const isCardManualProvider = isCardManual(paymentProviderId)
  console.log("isCardManualProvider", isCardManualProvider)

  return (
    <RadioGroupOption
      key={paymentProviderId}
      value={paymentProviderId}
      disabled={disabled}
      className={clx(
        "flex flex-col gap-y-2 text-small-regular cursor-pointer py-4 border rounded-xl px-8 mb-2 transition-all duration-200 focus:outline-none",
        {

          // Стилі для карт вручну
          "border-blue-500 bg-blue-900/5 ring-1 ring-blue-500":
          isCardManualProvider && selectedPaymentOptionId === paymentProviderId,

          // Стилі для звичайних методів
          "border-gray-700 bg-gray-900 hover:border-gray-500":
            !isCashAppProvider && selectedPaymentOptionId !== paymentProviderId,
          "border-[#b8ff2b] bg-gray-800":
            selectedPaymentOptionId === paymentProviderId && !isCashAppProvider,

          // 🟢 Стилі для CASH APP (Зелені)
          "border-emerald-800 bg-gray-900 hover:border-emerald-500":
            isCashAppProvider && selectedPaymentOptionId !== paymentProviderId,
          "border-emerald-500 bg-emerald-900/10 ring-1 ring-emerald-500":
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
                "font-semibold text-white": !isCashAppProvider,
                "font-semibold text-emerald-400": isCashAppProvider,
              })}
            >
              {paymentInfoMap[paymentProviderId]?.title || paymentProviderId}

              {/* Бейдж для Cash App */}
              {isCashAppProvider && (
                <span className="bg-emerald-500 text-black text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ml-2">
                  Fastest
                </span>
              )}

              {/* Бейдж для карт вручну */}
              {isCardManualProvider && (
                <span className="bg-blue-500 text-white text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ml-2">
                  Secure Bridge
                </span>
              )}
            </Text>

            {/* Підзаголовок для Картки */}
            {isCardManualProvider && (
              <Text className="text-[11px] text-gray-400 mt-0.5">
                Bank-safe anonymous processing
              </Text>
            )}

            {/* Підзаголовок для Cash App (видимий завжди) */}
            {isCashAppProvider && (
              <Text className="text-[11px] text-gray-400 mt-0.5">
                Pay instantly via Debit/Credit Card
              </Text>
            )}
          </div>

          {isManual(paymentProviderId) && isDevelopment && (
            <PaymentTest className="hidden small:block" />
          )}
        </div>

          <span className="justify-self-end text-white">
            {paymentInfoMap[paymentProviderId]?.icon}
          </span>
        </div>

        {/* 🔵 СИНІЙ БЛОК ІНСТРУКЦІЇ ДЛЯ КАРТКИ (Знімаємо заперечення) */}
        {isCardManualProvider && selectedPaymentOptionId === paymentProviderId && (
        <div className="mt-3 pt-3 border-t border-blue-500/30">
          <div className="bg-gray-900 p-3 rounded border border-blue-800 shadow-sm">
            <p className="text-[12px] text-blue-400 font-medium mb-1">
              🛡️ Secure Payment Protocol:
            </p>
            <ul className="list-disc list-inside text-[11px] text-gray-400 space-y-1 pl-1">
              <li>Uses a secure Card-to-Crypto bridge for anonymity.</li>
              <li>Your bank will only see a standard digital purchase.</li>
              <li>First-time setup may require a quick 1-minute ID check.</li>
              <li><span className="text-white italic">Need a no-ID route? Choose PayPal/Cash method instead.</span></li>
            </ul>
          </div>
        </div>
      )}

      {/* 🟢 ЗЕЛЕНИЙ БЛОК ІНСТРУКЦІЇ (Тільки коли вибрано Cash App) */}
      {isCashAppProvider && selectedPaymentOptionId === paymentProviderId && (
        <div className="mt-3 pt-3 border-t border-emerald-500/30">
          <div className="bg-gray-900 p-3 rounded border border-emerald-800 shadow-sm">
            <p className="text-[12px] text-emerald-400 font-medium mb-1">
              ⚡ Quick Instructions:
            </p>
            <ul className="list-disc list-inside text-[11px] text-gray-400 space-y-0.5 pl-1">
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
          color: "#ffffff",
          "::placeholder": {
            color: "rgb(107 114 128)",
          },
        },
      },
      classes: {
        base: "pt-3 pb-1 block w-full h-11 px-4 mt-0 bg-gray-900 border rounded-md appearance-none focus:outline-none focus:ring-1 focus:ring-[#b8ff2b] focus:border-[#b8ff2b] border-gray-700 hover:bg-gray-800 transition-all duration-300 ease-in-out text-white",
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
            <Text className="txt-medium-plus text-white mb-1">
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
