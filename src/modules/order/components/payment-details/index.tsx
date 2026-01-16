import { Heading, Text } from "@medusajs/ui"

import {
  isStripeLike,
  paymentInfoMap,
  isManual,
  isCashApp,
} from "@lib/constants"
import Divider from "@modules/common/components/divider"
import { convertToLocale } from "@lib/util/money"
import { HttpTypes } from "@medusajs/types"

type PaymentDetailsProps = {
  order: HttpTypes.StoreOrder
}

const PaymentDetails = ({ order }: PaymentDetailsProps) => {
  const payment = order.payment_collections?.[0].payments?.[0]
  const providerId =
    payment?.provider_id ||
    order.payment_collections?.[0]?.payment_sessions?.[0]?.provider_id ||
    "unknown"

  const isManualPayment = isManual(providerId)

  return (
    <div>
      <Heading level="h2" className="flex flex-row text-3xl-regular my-6 text-[#b8ff2b]">
        Payment
      </Heading>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-4">
        {payment && (
          <>
            <div className="flex flex-col">
              <Text className="txt-medium-plus text-white mb-1">
                Payment method
              </Text>
              <Text
                className="txt-medium text-gray-400"
                data-testid="payment-method"
              >
                {paymentInfoMap[payment.provider_id].title}
              </Text>
            </div>
            <div className="flex flex-col sm:col-span-2">
              <Text className="txt-medium-plus text-white mb-1">
                Payment details
              </Text>
              <div className="flex gap-2 txt-medium text-gray-400 items-center">
                <div className="flex items-center h-7 w-fit p-2 bg-gray-800 border border-gray-700 rounded">
                  {paymentInfoMap[payment.provider_id].icon}
                </div>
                <Text data-testid="payment-amount" className="text-gray-400">
                  {isStripeLike(providerId) && payment?.data?.card_last4 ? (
                    `**** **** **** ${payment.data.card_last4}`
                  ) : isManualPayment || isCashApp(providerId) ? (
                    <span className="flex flex-col items-start gap-1">
                      <span className="text-orange-400 font-bold flex items-center gap-1 uppercase text-xs tracking-wide">
                        ● Awaiting Payment
                      </span>

                      {isCashApp(providerId) && (
                        <span className="text-emerald-400 text-[11px] font-medium">
                          Check your email for Cash App instructions.
                        </span>
                      )}

                      <span className="text-gray-400 font-normal text-xs">
                        Amount:{" "}
                        {convertToLocale({
                          amount: order.total,
                          currency_code: order.currency_code,
                        })}
                      </span>
                    </span>
                  ) : (
                    // Default (Paid)
                    `${convertToLocale({
                      amount: payment?.amount || order.total,
                      currency_code: order.currency_code,
                    })} paid at ${new Date(
                      payment?.created_at ?? Date.now()
                    ).toLocaleString()}`
                  )}
                </Text>
              </div>
            </div>
          </>
        )}
      </div>

      <Divider className="mt-8" />
    </div>
  )
}

export default PaymentDetails
