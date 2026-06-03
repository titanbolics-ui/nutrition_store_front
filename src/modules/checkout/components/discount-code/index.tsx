"use client"

import { Badge, Text } from "@medusajs/ui"
import React from "react"

import { applyPromotions } from "@lib/data/cart"
import { convertToLocale } from "@lib/util/money"
import { HttpTypes } from "@medusajs/types"
import Trash from "@modules/common/icons/trash"
import ErrorMessage from "../error-message"
import { SubmitButton } from "../submit-button"

type DiscountCodeProps = {
  cart: HttpTypes.StoreCart & {
    promotions: HttpTypes.StorePromotion[]
  }
}

const DiscountCode: React.FC<DiscountCodeProps> = ({ cart }) => {
  const [isOpen, setIsOpen] = React.useState(false)
  const [errorMessage, setErrorMessage] = React.useState("")

  const { promotions = [] } = cart
  const removePromotionCode = async (code: string) => {
    setErrorMessage("")

    const validPromotions = promotions.filter(
      (promotion) => promotion.code !== code
    )

    const error = await applyPromotions(
      validPromotions.filter((p) => p.code !== undefined).map((p) => p.code!)
    )

    if (error) {
      setErrorMessage(error)
    }
  }

  const addPromotionCode = async (formData: FormData) => {
    setErrorMessage("")

    const code = formData.get("code")
    if (!code) {
      return
    }
    const input = document.getElementById("promotion-input") as HTMLInputElement
    const codes = promotions
      .filter((p) => p.code !== undefined)
      .map((p) => p.code!)
    codes.push(code.toString())

    const error = await applyPromotions(codes)

    if (error) {
      setErrorMessage(error)
    } else {
      // Success - clear input
      if (input) {
        input.value = ""
      }
    }
  }

  return (
    <div className="w-full">
      <form action={(a) => addPromotionCode(a)} className="w-full">
        <button
          onClick={() => setIsOpen(!isOpen)}
          type="button"
          className="text-sm text-[#b8ff2b] hover:text-[#b8ff2b]/70 transition-colors inline-flex items-center gap-1.5 leading-none"
          data-testid="add-discount-button"
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="currentColor"
            className={`transition-transform duration-200 ${isOpen ? "rotate-45" : ""}`}
          >
            <path d="M5.25 5.25V0h1.5v5.25H12v1.5H6.75V12h-1.5V6.75H0v-1.5h5.25z" />
          </svg>
          Promotion code
        </button>

        {isOpen && (
          <div className="mt-3">
            <div className="flex w-full gap-x-2 items-center">
              <input
                type="text"
                name="code"
                autoFocus
                data-testid="discount-input"
                className="flex-1 h-10 px-3 rounded-lg bg-zinc-900 border border-white/10 text-white text-sm focus:outline-none focus:border-[#b8ff2b] focus:ring-1 focus:ring-[#b8ff2b]/20"
              />
              <SubmitButton
                variant="secondary"
                data-testid="discount-apply-button"
                className="bg-[#b8ff2b] text-black border-none hover:bg-[#b8ff2b]/80 h-10 mt-0 text-sm font-semibold px-4"
              >
                Apply
              </SubmitButton>
            </div>
            <ErrorMessage
              error={errorMessage}
              data-testid="discount-error-message"
            />
          </div>
        )}
      </form>

      {promotions.length > 0 && (
        <div className="mt-3 pt-3 border-t border-white/[0.06]">
          {promotions.map((promotion) => (
            <div
              key={promotion.id}
              className="flex items-center justify-between mb-1.5"
              data-testid="discount-row"
            >
              <Text className="flex gap-x-1 items-baseline text-sm text-gray-400">
                <Badge
                  color={promotion.is_automatic ? "green" : "grey"}
                  size="small"
                  className="bg-zinc-900 border-white/10 text-[#b8ff2b]"
                >
                  {promotion.code}
                </Badge>
                {promotion.application_method?.value !== undefined &&
                  promotion.application_method.currency_code !== undefined && (
                    <span className="text-gray-500">
                      (
                      {promotion.application_method.type === "percentage"
                        ? `${promotion.application_method.value}%`
                        : convertToLocale({
                            amount: +promotion.application_method.value,
                            currency_code:
                              promotion.application_method.currency_code,
                          })}
                      )
                    </span>
                  )}
              </Text>
              {!promotion.is_automatic && (
                <button
                  className="text-gray-600 hover:text-white transition-colors"
                  onClick={() => promotion.code && removePromotionCode(promotion.code)}
                  data-testid="remove-discount-button"
                >
                  <Trash size={13} />
                  <span className="sr-only">Remove discount code</span>
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default DiscountCode
