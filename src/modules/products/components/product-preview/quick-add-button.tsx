"use client"

import { addToCart } from "@lib/data/cart"
import { HttpTypes } from "@medusajs/types"
import { useState, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { useFlyToCart } from "@lib/context/fly-to-cart-context"
import { resolveStockState } from "@lib/util/resolve-stock-state"
import posthog from "posthog-js"

type QuickAddButtonProps = {
  product: HttpTypes.StoreProduct
}

export default function QuickAddButton({ product }: QuickAddButtonProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const countryCode = useParams().countryCode as string
  const router = useRouter()
  const buttonRef = useRef<HTMLButtonElement>(null)
  const { triggerFlyToCart } = useFlyToCart()

  // Check if product has a simple variant (single option with single value, or just one variant)
  const isSimple = 
    product.variants?.length === 1 || 
    (product.options?.length === 1 && product.options[0]?.values?.length === 1)
  
  const firstVariant = product.variants?.[0]

  // Only relevant for simple products: this button adds `firstVariant`
  // directly with no page visit, so it must not silently no-op or add an
  // out-of-stock variant.
  const isOutOfStock =
    isSimple && resolveStockState(firstVariant) === "out_of_stock"

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    // If product has multiple variants, navigate to product page
    if (!isSimple || !firstVariant) {
      router.push(`/${countryCode}/products/${product.handle}`)
      return
    }

    // Simple product - add to cart directly
    setIsAdding(true)
    
    // Trigger fly animation
    const thumbnail = product.thumbnail || product.images?.[0]?.url
    if (buttonRef.current && thumbnail) {
      triggerFlyToCart(thumbnail, buttonRef.current)
    }
    
    try {
      await addToCart({
        variantId: firstVariant.id,
        quantity: 1,
        countryCode,
      })

      if (typeof window !== "undefined" && (posthog as any).__loaded) {
        posthog.capture("product_added_to_cart", {
          product_id: product.id,
          product_name: product.title,
          product_quantity: 1,
        })
      }
      
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 1500)
    } catch (error) {
      console.error("Failed to add to cart:", error)
    } finally {
      setIsAdding(false)
    }
  }

  return (
    <button
      ref={buttonRef}
      onClick={handleClick}
      disabled={isAdding || isOutOfStock}
      aria-label={isOutOfStock ? "Out of stock" : "Add to cart"}
      title={isOutOfStock ? "Out of stock" : undefined}
      className={`w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-full border flex items-center justify-center transition-all duration-300 shadow-lg disabled:cursor-wait ${
        isOutOfStock
          ? "border-gray-700 bg-transparent text-gray-600 opacity-50 disabled:cursor-not-allowed"
          : showSuccess
          ? "bg-[#ccff00] border-[#ccff00] text-black"
          : "border-gray-600 bg-transparent text-white hover:bg-[#ccff00] hover:text-black hover:border-[#ccff00] hover:shadow-[0_0_15px_rgba(204,255,0,0.4)]"
      }`}
    >
      {isAdding ? (
        <svg
          className="animate-spin w-4 h-4 sm:w-5 sm:h-5"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      ) : showSuccess ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2.5}
          stroke="currentColor"
          className="w-4 h-4 sm:w-5 sm:h-5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4.5 12.75l6 6 9-13.5"
          />
        </svg>
      ) : (
        // Cart icon instead of +
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className="w-4 h-4 sm:w-5 sm:h-5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
          />
        </svg>
      )}
    </button>
  )
}

