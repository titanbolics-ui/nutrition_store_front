"use client"

import { HttpTypes } from "@medusajs/types"
import { isCryptoManual, isPaypalManual, isCashApp } from "@lib/constants"
import { convertToLocale } from "@lib/util/money"
import { Bitcoin, Copy, Check } from "lucide-react"
import { useState } from "react"

type PaymentInstructionsProps = {
  order: HttpTypes.StoreOrder
}

// Copy button component
const CopyButton = ({ text }: { text: string }) => {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={handleCopy}
      className="ml-2 p-1.5 bg-gray-700 hover:bg-gray-600 rounded transition-colors"
      title="Copy to clipboard"
    >
      {copied ? (
        <Check className="w-4 h-4 text-green-400" />
      ) : (
        <Copy className="w-4 h-4 text-gray-400" />
      )}
    </button>
  )
}

// Bitcoin/Crypto Payment Instructions
export const CryptoPaymentInstructions = ({ order }: PaymentInstructionsProps) => {
  const btcAddress = process.env.NEXT_PUBLIC_BTC_WALLET_ADDRESS || ""
  const amount = convertToLocale({
    amount: order.total,
    currency_code: order.currency_code,
  })

  return (
    <div className="mt-8">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-orange-500/10 rounded-lg">
          <Bitcoin className="w-6 h-6 text-orange-400" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">
            ₿ Crypto Payment Required
          </h3>
          <p className="text-sm text-gray-400">
            Send Bitcoin to complete your order
          </p>
        </div>
      </div>

      <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-6">
        <p className="text-gray-300 text-sm mb-4">
          Please send exactly <strong className="text-orange-400">{amount}</strong> worth of BTC to the wallet address below:
        </p>

        <div className="bg-gray-900 border border-orange-500/20 rounded-lg p-4 mb-4">
          <p className="text-xs font-bold text-orange-400 uppercase tracking-wider mb-2">
            Bitcoin (BTC) Address
          </p>
          <div className="flex items-center justify-between">
            <code className="font-mono text-sm text-white break-all flex-1">
              {btcAddress}
            </code>
            <CopyButton text={btcAddress} />
          </div>
        </div>

        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
          <p className="text-yellow-400 text-sm font-medium mb-2">
            ⚠️ Important:
          </p>
          <ul className="text-xs text-gray-400 space-y-1 list-disc list-inside">
            <li>Send the exact amount in USD equivalent</li>
            <li>Double-check the wallet address before sending</li>
            <li>Bitcoin confirmations typically take 10-30 minutes</li>
            <li>Your order will be processed once payment is confirmed</li>
          </ul>
        </div>
      </div>

      <div className="mt-4 p-4 bg-gray-800/50 border border-gray-700 rounded-lg">
        <p className="text-gray-400 text-xs">
          Order reference: <strong className="text-white">#ONX-{order.display_id}</strong>
        </p>
      </div>
    </div>
  )
}

// PayPal Payment Instructions
export const PayPalPaymentInstructions = ({ order }: PaymentInstructionsProps) => {
  const paypalAddress = process.env.NEXT_PUBLIC_PAYPAL_WALLET_ADDRESS || ""
  const amount = convertToLocale({
    amount: order.total,
    currency_code: order.currency_code,
  })

  return (
    <div className="mt-8">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-blue-500/10 rounded-lg">
          <svg className="w-6 h-6 text-blue-400" viewBox="0 0 24 24" fill="currentColor">
            <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944 3.72a.771.771 0 0 1 .76-.654h6.583c2.193 0 3.87.53 4.913 1.546.469.457.815.99 1.022 1.574.219.612.272 1.312.154 2.08-.018.116-.038.236-.062.36l-.025.124v.11c-.318 2.08-1.39 3.466-2.904 4.28-.758.407-1.62.674-2.558.813-.45.067-.917.105-1.398.105H9.51a.95.95 0 0 0-.937.801l-.015.09-.646 4.09-.016.078a.95.95 0 0 1-.937.801H7.076z"/>
          </svg>
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">
            💳 PayPal Payment Instructions
          </h3>
          <p className="text-sm text-gray-400">
            Send payment via PayPal Friends & Family
          </p>
        </div>
      </div>

      <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-6">
        <p className="text-gray-300 text-sm mb-4">
          To complete your payment, please send <strong className="text-blue-400">{amount}</strong> via PayPal.
        </p>

        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-4">
          <p className="text-red-400 text-sm font-bold mb-1">
            ⚠️ IMPORTANT: Select "Friends and Family"
          </p>
          <p className="text-red-300/80 text-xs">
            Do NOT use "Goods and Services" — your order will not be processed.
          </p>
        </div>

        <div className="bg-gray-900 border border-blue-500/20 rounded-lg p-4 mb-4">
          <p className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-2">
            PayPal Email Address
          </p>
          <div className="flex items-center justify-between">
            <code className="font-mono text-sm text-white break-all flex-1">
              {paypalAddress}
            </code>
            <CopyButton text={paypalAddress} />
          </div>
        </div>

        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
          <p className="text-blue-400 text-sm font-medium mb-2">
            Instructions:
          </p>
          <ul className="text-xs text-gray-400 space-y-1 list-disc list-inside">
            <li>Open PayPal and select "Send Money"</li>
            <li>Enter the email address above</li>
            <li>Select <strong className="text-white">"Friends and Family"</strong></li>
            <li>Enter the exact amount: <strong className="text-white">{amount}</strong></li>
            <li>Do NOT include any notes or comments</li>
          </ul>
        </div>
      </div>

      <div className="mt-4 p-4 bg-gray-800/50 border border-gray-700 rounded-lg">
        <p className="text-gray-400 text-xs">
          Order reference: <strong className="text-white">#ONX-{order.display_id}</strong>
        </p>
      </div>
    </div>
  )
}

// Cash App Payment Instructions
export const CashAppPaymentInstructions = ({ order }: PaymentInstructionsProps) => {
  const btcAddress = process.env.NEXT_PUBLIC_BTC_WALLET_ADDRESS || ""
  const amount = convertToLocale({
    amount: order.total,
    currency_code: order.currency_code,
  })

  const steps = [
    { num: 1, text: 'Open Cash App and tap the <strong class="text-white">"Bitcoin"</strong> tab.' },
    { num: 2, text: `Buy <strong class="text-emerald-400">${amount}</strong> worth of BTC.` },
    { num: 3, text: 'Tap the <strong class="text-white">"Paper Airplane"</strong> (Send) icon.' },
    { num: 4, text: 'Copy the address below and paste it in the <strong class="text-white">"To"</strong> field.' },
  ]

  return (
    <div className="mt-8">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-emerald-500/10 rounded-lg">
        </div>
        <div className="flex items-center gap-3">
          <h3 className="text-xl font-bold text-white">
            Pay via Cash App
          </h3>
          <span className="bg-emerald-500 text-black text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
            Fastest
          </span>
        </div>
      </div>

      <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-6">
        <p className="text-gray-300 text-sm mb-4 font-medium">
          Complete your order in 60 seconds using Bitcoin on Cash App.
        </p>

        <div className="bg-gray-900 border border-emerald-500/20 rounded-lg p-4 mb-4">
          {steps.map(({ num, text }) => (
            <div key={num} className={`flex items-start gap-3 ${num < 4 ? 'mb-3' : ''}`}>
              <span className="text-lg font-bold text-emerald-400 w-6">{num}.</span>
              <p 
                className="text-sm text-gray-400 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: text }}
              />
            </div>
          ))}
        </div>

        <div className="mb-4">
          <p className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2">
            Copy this address:
          </p>
          <div className="bg-gray-900 border-2 border-dashed border-emerald-500/30 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <code className="font-mono text-sm text-white break-all flex-1 select-all">
                {btcAddress}
              </code>
              <CopyButton text={btcAddress} />
            </div>
          </div>
        </div>

        <p className="text-xs text-center text-gray-500">
          Order status will update automatically once payment is detected.
        </p>
      </div>
    </div>
  )
}

// Main wrapper component that shows the right instructions based on payment method
const PaymentInstructions = ({ order }: PaymentInstructionsProps) => {
  const payment = order.payment_collections?.[0]?.payments?.[0]
  const providerId =
    payment?.provider_id ||
    order.payment_collections?.[0]?.payment_sessions?.[0]?.provider_id ||
    ""

  if (isCryptoManual(providerId)) {
    return <CryptoPaymentInstructions order={order} />
  }

  if (isPaypalManual(providerId)) {
    return <PayPalPaymentInstructions order={order} />
  }

  if (isCashApp(providerId)) {
    return <CashAppPaymentInstructions order={order} />
  }

  return null
}

export default PaymentInstructions

