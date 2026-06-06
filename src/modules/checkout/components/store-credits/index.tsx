"use client"

import React, { useState, useTransition } from "react"
import { applyStoreCreditsToCart, removeStoreCreditsFromCart, StoreCreditAccount } from "@lib/data/store-credits"
import { convertToLocale } from "@lib/util/money"
import Trash from "@modules/common/icons/trash"
import ErrorMessage from "../error-message"

type StoreCreditsProps = {
  cart: any
  accounts: StoreCreditAccount[]
}

const StoreCredits: React.FC<StoreCreditsProps> = ({ cart, accounts }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [inputAmount, setInputAmount] = useState("")
  const [error, setError] = useState("")
  const [isPending, startTransition] = useTransition()

  // Find the account matching the cart's currency
  const account = accounts.find(
    (a) => a.currency_code === cart.currency_code && a.balance > 0
  )

  // Find applied store-credit line on the cart
  const creditLines = cart.credit_lines ?? []
  const creditLine = creditLines.find(
    (l: any) => l.reference === "store-credit"
  )
  const applied: number = creditLine ? Number(creditLine.amount) : 0

  if (!account && applied === 0) return null

  const balance = account?.balance ?? 0
  const currencyCode = cart.currency_code

  const formatAmount = (amount: number) =>
    convertToLocale({ amount, currency_code: currencyCode })

  const handleApply = () => {
    setError("")
    const raw = parseFloat(inputAmount)
    const amount = isNaN(raw) || inputAmount === "" ? balance : Math.min(raw, balance)
    if (amount <= 0) {
      setError("Enter a valid amount")
      return
    }
    startTransition(async () => {
      const { error: err } = await applyStoreCreditsToCart(cart.id, amount)
      if (err) setError(err)
      else setIsOpen(false)
    })
  }

  const handleRemove = () => {
    setError("")
    startTransition(async () => {
      const { error: err } = await removeStoreCreditsFromCart(cart.id)
      if (err) setError(err)
    })
  }

  return (
    <div className="w-full">
      {applied === 0 ? (
        <>
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="text-sm text-[#b8ff2b] hover:text-[#b8ff2b]/70 transition-colors inline-flex items-center gap-1.5 leading-none"
          >
            <svg
              width="12" height="12" viewBox="0 0 12 12" fill="currentColor"
              className={`transition-transform duration-200 ${isOpen ? "rotate-45" : ""}`}
            >
              <path d="M5.25 5.25V0h1.5v5.25H12v1.5H6.75V12h-1.5V6.75H0v-1.5h5.25z" />
            </svg>
            Store credit
            <span className="text-gray-500 text-xs">({formatAmount(balance)} available)</span>
          </button>

          {isOpen && (
            <div className="mt-3">
              <p className="text-xs text-gray-500 mb-2">
                Balance: <span className="text-white font-semibold">{formatAmount(balance)}</span>
              </p>
              <div className="flex gap-x-2 items-center">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder={`Amount (max ${formatAmount(balance)})`}
                  value={inputAmount}
                  onChange={(e) => setInputAmount(e.target.value)}
                  className="flex-1 h-10 px-3 rounded-lg bg-zinc-900 border border-white/10 text-white text-sm focus:outline-none focus:border-[#b8ff2b] focus:ring-1 focus:ring-[#b8ff2b]/20"
                />
                <button
                  type="button"
                  onClick={handleApply}
                  disabled={isPending}
                  className="h-10 px-4 bg-[#b8ff2b] text-black text-sm font-semibold rounded-lg hover:bg-[#b8ff2b]/80 disabled:opacity-50 transition-colors"
                >
                  {isPending ? "..." : "Apply all"}
                </button>
              </div>
              <ErrorMessage error={error} />
            </div>
          )}
        </>
      ) : (
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400">Store credit</span>
              <span className="text-xs bg-zinc-900 border border-white/10 text-[#b8ff2b] px-2 py-0.5 rounded font-mono">
                -{formatAmount(applied)}
              </span>
            </div>
            <button
              type="button"
              onClick={handleRemove}
              disabled={isPending}
              className="text-gray-600 hover:text-white transition-colors disabled:opacity-50"
            >
              <Trash size={13} />
              <span className="sr-only">Remove store credit</span>
            </button>
          </div>
          <ErrorMessage error={error} />
        </div>
      )}
    </div>
  )
}

export default StoreCredits
