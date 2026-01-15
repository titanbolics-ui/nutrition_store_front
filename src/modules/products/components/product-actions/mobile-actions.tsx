import { Dialog, Transition } from "@headlessui/react"
import { Button, clx } from "@medusajs/ui"
import React, { Fragment, useMemo } from "react"

import useToggleState from "@lib/hooks/use-toggle-state"
import ChevronDown from "@modules/common/icons/chevron-down"
import X from "@modules/common/icons/x"

import { getProductPrice } from "@lib/util/get-product-price"
import OptionSelect from "./option-select"
import { HttpTypes } from "@medusajs/types"
import { isSimpleProduct } from "@lib/util/product"

type MobileActionsProps = {
  product: HttpTypes.StoreProduct
  variant?: HttpTypes.StoreProductVariant
  options: Record<string, string | undefined>
  updateOptions: (title: string, value: string) => void
  inStock?: boolean
  handleAddToCart: () => void
  isAdding?: boolean
  show: boolean
  optionsDisabled: boolean
  quantity: number
  increaseQuantity: () => void
  decreaseQuantity: () => void
  isValidVariant?: boolean
  unselectedOption?: HttpTypes.StoreProductOption | null
}

const MobileActions: React.FC<MobileActionsProps> = ({
  product,
  variant,
  options,
  updateOptions,
  inStock,
  handleAddToCart,
  isAdding,
  show,
  optionsDisabled,
  quantity,
  increaseQuantity,
  decreaseQuantity,
  isValidVariant = true,
  unselectedOption,
}) => {
  const { state, open, close } = useToggleState()

  const price = getProductPrice({
    product: product,
    variantId: variant?.id,
  })

  const selectedPrice = useMemo(() => {
    if (!price) {
      return null
    }
    const { variantPrice, cheapestPrice } = price

    return variantPrice || cheapestPrice || null
  }, [price])

  const isSimple = isSimpleProduct(product)

  return (
    <>
      <div
        className={clx("lg:hidden inset-x-0 bottom-0 fixed z-50", {
          "pointer-events-none": !show,
        })}
      >
        <Transition
          as={Fragment}
          show={show}
          enter="ease-in-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-300"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div
            className="bg-gray-900 border-t border-gray-800 flex flex-col gap-y-3 justify-center items-center text-large-regular p-4 h-full w-full"
            data-testid="mobile-actions"
          >
            <div className="flex items-center gap-x-2 text-white">
              <span data-testid="mobile-title" className="font-medium">{product.title}</span>
              <span className="text-gray-500">—</span>
              {selectedPrice ? (
                <div className="flex items-end gap-x-2">
                  {selectedPrice.price_type === "sale" && (
                    <p>
                      <span className="line-through text-small-regular text-gray-500">
                        {selectedPrice.original_price}
                      </span>
                    </p>
                  )}
                  <span
                    className={clx("text-[#ccff00] font-bold", {
                      "text-[#ccff00]":
                        selectedPrice.price_type === "sale",
                    })}
                  >
                    {selectedPrice.calculated_price}
                  </span>
                </div>
              ) : (
                <div></div>
              )}
            </div>
            <div className="flex flex-col w-full gap-y-3">
              {!isSimple && <Button
                onClick={open}
                variant="secondary"
                className="w-full bg-gray-800 border border-gray-700 text-white hover:bg-gray-700"
                data-testid="mobile-actions-button"
              >
                <div className="flex items-center justify-between w-full">
                  <span>
                    {variant
                      ? Object.values(options).join(" / ")
                      : "Select Options"}
                  </span>
                  <ChevronDown />
                </div>
              </Button>}
              <div className="flex items-center gap-x-4 w-full">
                <div className="flex items-center border border-gray-700 rounded-lg bg-gray-900">
                  <button
                    onClick={decreaseQuantity}
                    disabled={quantity <= 1 || optionsDisabled}
                    className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    type="button"
                    data-testid="mobile-decrease-quantity-button"
                  >
                    −
                  </button>
                  <span className="w-12 h-10 flex items-center justify-center text-white font-medium" data-testid="mobile-quantity-value">
                    {quantity}
                  </span>
                  <button
                    onClick={increaseQuantity}
                    disabled={
                      optionsDisabled ||
                      (variant?.manage_inventory && 
                       quantity >= (variant?.inventory_quantity || 0))
                    }
                    className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    type="button"
                    data-testid="mobile-increase-quantity-button"
                  >
                    +
                  </button>
                </div>
                <Button
                  onClick={handleAddToCart}
                  disabled={!inStock || !variant || !isValidVariant}
                  className="flex-1 bg-[#ccff00] text-black font-bold hover:bg-[#b8e600] border-none shadow-[0_0_20px_rgba(204,255,0,0.3)] disabled:bg-gray-700 disabled:text-gray-400 disabled:shadow-none"
                  isLoading={isAdding}
                  data-testid="mobile-cart-button"
                >
                  {(() => {
                    // If there are options and one is unselected
                    if (unselectedOption) {
                      return `Select ${unselectedOption.title?.toLowerCase() || "option"}`
                    }
                    // If no variant selected
                    if (!variant) {
                      return "Select variant"
                    }
                    // If variant is selected but out of stock
                    if (variant && isValidVariant && !inStock) {
                      return "Out of stock"
                    }
                    // Default
                    return "Add to cart"
                  })()}
                </Button>
              </div>
            </div>
          </div>
        </Transition>
      </div>
      <Transition appear show={state} as={Fragment}>
        <Dialog as="div" className="relative z-[75]" onClose={close}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-700 bg-opacity-75 backdrop-blur-sm" />
          </Transition.Child>

          <div className="fixed bottom-0 inset-x-0">
            <div className="flex min-h-full h-full items-center justify-center text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <Dialog.Panel
                  className="w-full h-full transform overflow-hidden text-left flex flex-col gap-y-3"
                  data-testid="mobile-actions-modal"
                >
                  <div className="w-full flex justify-end pr-6">
                    <button
                      onClick={close}
                      className="bg-gray-800 border border-gray-700 w-12 h-12 rounded-full text-white flex justify-center items-center hover:bg-gray-700 transition-colors"
                      data-testid="close-modal-button"
                    >
                      <X />
                    </button>
                  </div>
                  <div className="bg-gray-900 border-t border-gray-800 px-6 py-12 rounded-t-2xl">
                    {/* Display options even when there's only one variant (mobile) */}
                    {product.options && product.options.length > 0 && (
                      <div className="flex flex-col gap-y-6">
                        {(product.options || []).map((option) => {
                          return (
                            <div key={option.id}>
                              <OptionSelect
                                option={option}
                                current={options[option.id]}
                                updateOption={updateOptions}
                                title={option.title ?? ""}
                                disabled={optionsDisabled}
                              />
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  )
}

export default MobileActions
