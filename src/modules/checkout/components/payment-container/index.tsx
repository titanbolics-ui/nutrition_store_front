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
  disabledReason?: string
  paymentInfoMap: Record<string, { title: string; icon: JSX.Element }>
  children?: React.ReactNode
}

const PaymentContainer: React.FC<PaymentContainerProps> = ({
  paymentProviderId,
  selectedPaymentOptionId,
  paymentInfoMap,
  disabled = false,
  disabledReason,
  children,
}) => {
  const isDevelopment = process.env.NODE_ENV === "development"
  const isCashAppProvider = isCashApp(paymentProviderId)
  const isCardManualProvider = isCardManual(paymentProviderId)
  const isSelected = selectedPaymentOptionId === paymentProviderId

  return (
    <RadioGroupOption
      key={paymentProviderId}
      value={paymentProviderId}
      disabled={disabled}
      className={clx(
        "flex flex-col cursor-pointer border rounded-2xl px-4 py-3.5 mb-2.5 transition-all duration-200 focus:outline-none",
        {
          // Disabled — normal look, just not interactive
          "cursor-not-allowed border-white/10 bg-zinc-900": disabled,

          // Card manual — blue
          "border-blue-500 bg-blue-950/20 ring-1 ring-blue-500/50":
            isCardManualProvider && isSelected && !disabled,

          // CashApp — green
          "border-emerald-700 bg-zinc-900 hover:border-emerald-600":
            isCashAppProvider && !isSelected && !disabled,
          "border-emerald-400 bg-emerald-950/20 ring-1 ring-emerald-400/40":
            isCashAppProvider && isSelected && !disabled,

          // Default
          "border-white/10 bg-zinc-900 hover:border-white/20":
            !isCashAppProvider && !isSelected && !disabled,
          "border-[#b8ff2b] bg-zinc-900 ring-1 ring-[#b8ff2b]/20":
            !isCashAppProvider && isSelected && !disabled && !isCardManualProvider,
        }
      )}
    >
      {/* Main row */}
      <div className="flex items-center justify-between gap-x-3">
        <div className="flex items-center gap-x-3 min-w-0">
          <Radio checked={isSelected} />

          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <Text
                className={clx("text-sm font-semibold leading-tight", {
                  "text-white": !isCashAppProvider,
                  "text-emerald-400": isCashAppProvider && !disabled,
                })}
              >
                {paymentInfoMap[paymentProviderId]?.title || paymentProviderId}
              </Text>

              {disabled && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500/15 text-red-400 border border-red-500/30 uppercase tracking-wide whitespace-nowrap">
                  Not available
                </span>
              )}

              {isCashAppProvider && !disabled && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500 text-black uppercase tracking-wide">
                  Fastest
                </span>
              )}

              {isCardManualProvider && !disabled && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-500 text-white uppercase tracking-wide">
                  Secure Bridge
                </span>
              )}
            </div>

            {isCashAppProvider && !disabled && (
              <Text className="text-xs text-gray-500 mt-0.5">
                Pay instantly via Debit/Credit Card
              </Text>
            )}
            {isCardManualProvider && !disabled && (
              <Text className="text-xs text-gray-500 mt-0.5">
                Bank-safe anonymous processing
              </Text>
            )}
          </div>
        </div>

        <span className="flex-shrink-0">
          {paymentInfoMap[paymentProviderId]?.icon}
        </span>
      </div>

      {/* Disabled reason */}
      {disabled && disabledReason && (
        <p className="text-xs text-amber-400/70 mt-2.5 pt-2.5 border-t border-white/[0.06] leading-snug">
          {disabledReason}
        </p>
      )}

      {/* Card manual info block */}
      {isCardManualProvider && isSelected && !disabled && (
        <div className="mt-3 pt-3 border-t border-blue-500/20">
          <div className="bg-zinc-950 p-3 rounded-xl border border-blue-900/50">
            <p className="text-xs text-blue-400 font-semibold mb-1.5">
              🛡️ Secure Payment Protocol
            </p>
            <ul className="space-y-1 text-xs text-gray-400">
              <li>· Uses a secure Card-to-Crypto bridge for anonymity.</li>
              <li>· Your bank will only see a standard digital purchase.</li>
              <li>· First-time setup may require a quick 1-minute ID check.</li>
              <li className="text-gray-300 italic">· Need a no-ID route? Choose PayPal or Cash App instead.</li>
            </ul>
          </div>
        </div>
      )}

      {/* CashApp info block */}
      {isCashAppProvider && isSelected && !disabled && (
        <div className="mt-3 pt-3 border-t border-emerald-500/20">
          <div className="bg-zinc-950 p-3 rounded-xl border border-emerald-900/50">
            <p className="text-xs text-emerald-400 font-semibold mb-1.5">
              ⚡ Quick Instructions
            </p>
            <ul className="space-y-1 text-xs text-gray-400">
              <li>· No crypto wallet needed.</li>
              <li>· Buy Bitcoin inside Cash App in 60 seconds.</li>
              <li>· Send to our address (shown on next step).</li>
            </ul>
          </div>
        </div>
      )}

      {isManual(paymentProviderId) && isDevelopment && isSelected && (
        <PaymentTest className="mt-2 text-[10px]" />
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
        base: "pt-3 pb-1 block w-full h-11 px-4 mt-0 bg-zinc-900 border rounded-xl appearance-none focus:outline-none focus:ring-1 focus:ring-[#b8ff2b] focus:border-[#b8ff2b] border-white/10 hover:border-white/20 transition-all duration-200 text-white",
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
          <div className="mt-3 pt-3 border-t border-white/[0.06]">
            <Text className="text-xs text-gray-400 mb-2">
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
