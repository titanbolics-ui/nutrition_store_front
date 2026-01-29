"use client"

import { HttpTypes } from "@medusajs/types"
import { isCardManual } from "@lib/constants"
import { CreditCard } from "lucide-react"

type ChangellyWidgetProps = {
  order: HttpTypes.StoreOrder
}

const ChangellyWidget = ({ order }: ChangellyWidgetProps) => {
  const payment = order.payment_collections?.[0]?.payments?.[0]
  const providerId =
    payment?.provider_id ||
    order.payment_collections?.[0]?.payment_sessions?.[0]?.provider_id ||
    ""

  // Only show for Card Manual payments
  if (!isCardManual(providerId)) {
    return null
  }

  // Order total (display amount)
  const orderAmount = order.total
  const amountInDollars = orderAmount.toFixed(2)
  
  // Amount with 5% processing fee (for widget)
  const amountWithFee = (orderAmount * 1.05).toFixed(2)
  
  // Get BTC wallet address from environment variable
  const btcAddress = process.env.NEXT_PUBLIC_BTC_WALLET_ADDRESS || ""
  
  // Merchant ID from the provided iframe
  const merchantId = "m3Q63BcQ_D9lAdwu"
  
  // Use order ID as payment reference
  const paymentId = order.id

  const widgetUrl = `https://widget.changelly.com?from=usd&to=btc&amount=${amountWithFee}&address=${btcAddress}&fromDefault=usd&toDefault=btc&merchant_id=${merchantId}&payment_id=${paymentId}&v=3`

  return (
    <div className="mt-8">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-blue-500/10 rounded-lg">
          <CreditCard className="w-6 h-6 text-blue-400" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">
            Complete Your Payment
          </h3>
          <p className="text-sm text-gray-400">
            Pay securely with your credit or debit card
          </p>
        </div>
      </div>

      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 mb-4">
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <span className="text-gray-400 text-sm">Order total:</span>
            <span className="text-lg text-white">${amountInDollars} USD</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400 text-sm">Processing fee (5%):</span>
            <span className="text-sm text-gray-400">+${(orderAmount * 0.05).toFixed(2)} USD</span>
          </div>
          <div className="flex justify-between items-center pt-2 border-t border-gray-700">
            <span className="text-white text-sm font-medium">Amount to pay:</span>
            <span className="text-2xl font-bold text-[#b8ff2b]">${amountWithFee} USD</span>
          </div>
        </div>
      </div>

      <div className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
        <p className="text-red-400 text-sm font-bold mb-2 flex items-center gap-2">
          Important — Do NOT change these values:
        </p>
        <ul className="text-xs text-red-300/90 space-y-1.5">
          <li className="flex items-start gap-2">
            <span className="text-red-400">•</span>
            <span><strong>Amount:</strong> Keep it exactly <span className="font-mono bg-red-500/20 px-1.5 py-0.5 rounded">${amountWithFee}</span> USD</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-red-400">•</span>
            <span><strong>Wallet address:</strong> Do not modify the receiving address</span>
          </li>
        </ul>
        <p className="text-xs text-red-400/80 mt-2 pt-2 border-t border-red-500/20">
          If you change the amount or wallet address, your order cannot be processed and may result in lost funds.
        </p>
      </div>

      <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-blue-500/30 rounded-xl overflow-hidden shadow-lg shadow-blue-500/5">
        <div className="bg-blue-500/10 px-4 py-3 border-b border-blue-500/20">
          <p className="text-sm text-blue-300 font-medium flex items-center gap-2">
            <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
            Secure payment powered by Changelly
          </p>
        </div>
        
        <iframe
          width="100%"
          height="500"
          frameBorder="0"
          allow="camera"
          src={widgetUrl}
          className="bg-gray-900"
          title="Changelly Bitcoin Payment Widget"
        >
          Can&apos;t load widget
        </iframe>
      </div>

      <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
        <p className="text-blue-400 text-sm font-medium mb-2">
          How it works:
        </p>
        <ul className="text-xs text-gray-400 space-y-1 list-disc list-inside">
          <li>Enter your card details in the secure widget above</li>
          <li>Complete the payment process</li>
          <li>Your order will be processed once payment is confirmed</li>
          <li>You will receive a confirmation email shortly</li>
        </ul>
      </div>

      <div className="mt-3 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
        <p className="text-yellow-400 text-xs">
          <span className="font-medium">⚠️ First time?</span>{" "}
          <span className="text-yellow-300/80">
            You may need to complete a quick identity verification (KYC) for your first purchase. This is a one-time process that takes 2-5 minutes.
          </span>
        </p>
      </div>
    </div>
  )
}

export default ChangellyWidget

