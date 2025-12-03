"use client"

import { addToCart } from "@lib/data/cart"
import { useIntersection } from "@lib/hooks/use-in-view"
import { HttpTypes } from "@medusajs/types"
import { Button } from "@medusajs/ui"
import Divider from "@modules/common/components/divider"
import OptionSelect from "@modules/products/components/product-actions/option-select"
import { isEqual } from "lodash"
import { useParams, usePathname, useSearchParams } from "next/navigation"
import { useEffect, useMemo, useRef, useState } from "react"
import ProductPrice from "../product-price"
import MobileActions from "./mobile-actions"
import { useRouter } from "next/navigation"

type ProductActionsProps = {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
  disabled?: boolean
}

const optionsAsKeymap = (
  variantOptions: HttpTypes.StoreProductVariant["options"]
) => {
  return variantOptions?.reduce((acc: Record<string, string>, varopt: any) => {
    acc[varopt.option_id] = varopt.value
    return acc
  }, {})
}

export default function ProductActions({
  product,
  disabled,
}: ProductActionsProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [options, setOptions] = useState<Record<string, string | undefined>>({})
  const [isAdding, setIsAdding] = useState(false)
  // State for product quantity (default is 1)
  const [quantity, setQuantity] = useState(1)
  const countryCode = useParams().countryCode as string

  // Track if options have been initialized to prevent re-running auto-selection
  const [optionsInitialized, setOptionsInitialized] = useState(false)

  // Auto-select options: if only 1 variant, preselect all its options
  // Also auto-select any option that has only one value (even if multiple variants exist)
  useEffect(() => {
    // Only run once on mount or when product changes to avoid infinite loops
    if (optionsInitialized && product.variants?.length === 1) {
      return
    }

    setOptions((prevOptions) => {
      let newOptions: Record<string, string | undefined> = { ...prevOptions }
      let hasChanges = false

      // If there is only 1 variant, preselect all its options
      if (product.variants?.length === 1) {
        const variantOptions = optionsAsKeymap(product.variants[0].options)
        // Only update if options are different
        if (!isEqual(variantOptions ?? {}, prevOptions)) {
          newOptions = variantOptions ?? {}
          hasChanges = true
        }
        if (hasChanges) {
          setOptionsInitialized(true)
        }
      } else if (
        product.options &&
        product.options.length > 0 &&
        !optionsInitialized
      ) {
        // Auto-select option if there's only one option value per option
        product.options.forEach((option) => {
          // If option is not selected yet and has only one value, auto-select it
          if (
            !newOptions[option.id] &&
            option.values &&
            option.values.length === 1
          ) {
            newOptions[option.id] = option.values[0].value
            hasChanges = true
          }
        })
        if (hasChanges) {
          setOptionsInitialized(true)
        }
      }

      return hasChanges ? newOptions : prevOptions
    })
  }, [product.variants, product.options, optionsInitialized])

  const selectedVariant = useMemo(() => {
    if (!product.variants || product.variants.length === 0) {
      return
    }

    return product.variants.find((v) => {
      const variantOptions = optionsAsKeymap(v.options)
      return isEqual(variantOptions, options)
    })
  }, [product.variants, options])

  // update the options when a variant is selected
  const setOptionValue = (optionId: string, value: string) => {
    setOptions((prev) => ({
      ...prev,
      [optionId]: value,
    }))
  }

  //check if the selected options produce a valid variant
  const isValidVariant = useMemo(() => {
    return product.variants?.some((v) => {
      const variantOptions = optionsAsKeymap(v.options)
      return isEqual(variantOptions, options)
    })
  }, [product.variants, options])

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString())
    const value = isValidVariant ? selectedVariant?.id : null

    if (params.get("v_id") === value) {
      return
    }

    if (value) {
      params.set("v_id", value)
    } else {
      params.delete("v_id")
    }

    router.replace(pathname + "?" + params.toString())
  }, [selectedVariant, isValidVariant])

  // check if the selected variant is in stock
  const inStock = useMemo(() => {
    // If we don't manage inventory, we can always add to cart
    if (selectedVariant && !selectedVariant.manage_inventory) {
      return true
    }

    // If we allow back orders on the variant, we can add to cart
    if (selectedVariant?.allow_backorder) {
      return true
    }

    // If there is inventory available, we can add to cart
    if (
      selectedVariant?.manage_inventory &&
      (selectedVariant?.inventory_quantity || 0) > 0
    ) {
      return true
    }

    // Otherwise, we can't add to cart
    return false
  }, [selectedVariant])

  const actionsRef = useRef<HTMLDivElement>(null)

  const inView = useIntersection(actionsRef, "0px")

  // Add the selected variant to the cart with specified quantity
  const handleAddToCart = async () => {
    if (!selectedVariant?.id) return null

    setIsAdding(true)

    await addToCart({
      variantId: selectedVariant.id,
      quantity: quantity, // Use quantity from state instead of hardcoded 1
      countryCode,
    })

    setIsAdding(false)
  }

  // Increase quantity with respect to inventory limits
  const increaseQuantity = () => {
    if (!selectedVariant) {
      // If no variant selected, allow up to 10 as default
      setQuantity((prev) => Math.min(prev + 1, 10))
      return
    }

    // Respect inventory management if enabled
    const maxQty = selectedVariant.manage_inventory
      ? selectedVariant.inventory_quantity || 10
      : 10
    setQuantity((prev) => Math.min(prev + 1, maxQty))
  }

  // Decrease quantity (minimum is 1)
  const decreaseQuantity = () => {
    setQuantity((prev) => Math.max(prev - 1, 1))
  }

  return (
    <>
      <div className="flex flex-col gap-y-2" ref={actionsRef}>
        <div>
          {/* Display options even when there's only one variant (previously hidden) */}
          {product.options && product.options.length > 0 && (
            <div className="flex flex-col gap-y-4">
              {(product.options || []).map((option) => {
                return (
                  <div key={option.id}>
                    <OptionSelect
                      option={option}
                      current={options[option.id]}
                      updateOption={setOptionValue}
                      title={option.title ?? ""}
                      data-testid="product-options"
                      disabled={!!disabled || isAdding}
                    />
                  </div>
                )
              })}
              <Divider />
            </div>
          )}
        </div>

        <ProductPrice product={product} variant={selectedVariant} />

        {/* Quantity selector and Add to cart button */}
        {/* Quantity counter allows selecting quantity before adding to cart */}
        <div className="flex items-center gap-x-4">
          <div className="flex items-center border border-ui-border-base rounded-rounded">
            <button
              onClick={decreaseQuantity}
              disabled={quantity <= 1 || !!disabled || isAdding}
              className="w-10 h-10 flex items-center justify-center text-ui-fg-subtle hover:text-ui-fg-base disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              type="button"
              data-testid="decrease-quantity-button"
            >
              −
            </button>
            <span
              className="w-12 h-10 flex items-center justify-center text-base-regular"
              data-testid="quantity-value"
            >
              {quantity}
            </span>
            <button
              onClick={increaseQuantity}
              disabled={
                !!disabled ||
                isAdding ||
                (selectedVariant &&
                  !!selectedVariant.manage_inventory &&
                  quantity >= (selectedVariant.inventory_quantity || 0))
              }
              className="w-10 h-10 flex items-center justify-center text-ui-fg-subtle hover:text-ui-fg-base disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              type="button"
              data-testid="increase-quantity-button"
            >
              +
            </button>
          </div>

          <Button
            onClick={handleAddToCart}
            disabled={
              !inStock ||
              !selectedVariant ||
              !!disabled ||
              isAdding ||
              !isValidVariant
            }
            variant="primary"
            className="flex-1 h-10"
            isLoading={isAdding}
            data-testid="add-product-button"
          >
            {!selectedVariant && !options
              ? "Select variant"
              : !inStock || !isValidVariant
              ? "Out of stock"
              : "Add to cart"}
          </Button>
        </div>
        <MobileActions
          product={product}
          variant={selectedVariant}
          options={options}
          updateOptions={setOptionValue}
          inStock={inStock}
          handleAddToCart={handleAddToCart}
          isAdding={isAdding}
          show={!inView}
          optionsDisabled={!!disabled || isAdding}
          quantity={quantity}
          increaseQuantity={increaseQuantity}
          decreaseQuantity={decreaseQuantity}
        />
      </div>
    </>
  )
}
