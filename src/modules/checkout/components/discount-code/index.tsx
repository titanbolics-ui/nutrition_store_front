"use client"

import { Badge, Heading, Label, Text } from "@medusajs/ui"
import Input from "@modules/common/components/input"
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
    <div className="w-full bg-gray-900 border border-gray-800 rounded-xl p-6 flex flex-col">
      <div className="txt-medium">
        <form action={(a) => addPromotionCode(a)} className="w-full mb-0">
          <Label className="flex gap-x-1 mb-2 items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              type="button"
              className="txt-medium text-[#b8ff2b] hover:text-[#b8ff2b]/80 transition-colors w-full text-left font-medium"
              data-testid="add-discount-button"
            >
              Add Promotion Code(s)
            </button>
          </Label>

          {isOpen && (
            <>
              <div className="flex w-full gap-x-2 mt-2">
                <Input
                  className="bg-black border-gray-700 text-white focus:border-[#ccff00] placeholder-gray-500"
                  name="code"
                  label=""
                  type="text"
                  autoFocus={true}
                  data-testid="discount-input"
                  placeholder="Enter code"
                />
                <SubmitButton
                  variant="secondary"
                  data-testid="discount-apply-button"
                  className="bg-[#b8ff2b] text-black border-none hover:bg-[#b8ff2b]/80 h-11 mt-0"
                >
                  Apply
                </SubmitButton>
              </div>

              <ErrorMessage
                error={errorMessage}
                data-testid="discount-error-message"
              />
            </>
          )}
        </form>

        {promotions.length > 0 && (
          <div className="w-full flex items-center mt-4 pt-4 border-t border-gray-800">
            <div className="flex flex-col w-full">
              <Heading className="txt-medium mb-2 text-white">
                Promotion(s) applied:
              </Heading>

              {promotions.map((promotion) => {
                return (
                  <div
                    key={promotion.id}
                    className="flex items-center justify-between w-full max-w-full mb-2"
                    data-testid="discount-row"
                  >
                    <Text className="flex gap-x-1 items-baseline txt-small-plus w-4/5 pr-1 text-gray-400">
                      <span className="truncate" data-testid="discount-code">
                        <Badge
                          color={promotion.is_automatic ? "green" : "grey"}
                          size="small"
                          className="bg-gray-800 border-gray-700 text-[#b8ff2b]"
                        >
                          {promotion.code}
                        </Badge>{" "}
                        (
                        {promotion.application_method?.value !== undefined &&
                          promotion.application_method.currency_code !==
                            undefined && (
                            <>
                              {promotion.application_method.type ===
                              "percentage"
                                ? `${promotion.application_method.value}%`
                                : convertToLocale({
                                    amount: +promotion.application_method.value,
                                    currency_code:
                                      promotion.application_method
                                        .currency_code,
                                  })}
                            </>
                          )}
                        )
                      </span>
                    </Text>
                    {!promotion.is_automatic && (
                      <button
                        className="flex items-center text-gray-500 hover:text-white transition-colors"
                        onClick={() => {
                          if (!promotion.code) {
                            return
                          }

                          removePromotionCode(promotion.code)
                        }}
                        data-testid="remove-discount-button"
                      >
                        <Trash size={14} />
                        <span className="sr-only">
                          Remove discount code from order
                        </span>
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default DiscountCode
