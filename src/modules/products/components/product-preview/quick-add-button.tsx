"use client"

import { addToCart } from "@lib/data/cart"
import { HttpTypes } from "@medusajs/types"
import { useState } from "react"
import { useParams, useRouter } from "next/navigation"

type QuickAddButtonProps = {
  product: HttpTypes.StoreProduct
}

export default function QuickAddButton({ product }: QuickAddButtonProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const countryCode = useParams().countryCode as string
  const router = useRouter()

  // Check if product has a simple variant (single option with single value, or just one variant)
  const isSimple = 
    product.variants?.length === 1 || 
    (product.options?.length === 1 && product.options[0]?.values?.length === 1)
  
  const firstVariant = product.variants?.[0]

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
    
    try {
      await addToCart({
        variantId: firstVariant.id,
        quantity: 1,
        countryCode,
      })
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
      onClick={handleClick}
      disabled={isAdding}
      className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-full border border-gray-600 bg-transparent flex items-center justify-center text-white hover:bg-[#ccff00] hover:text-black hover:border-[#ccff00] transition-all duration-300 shadow-lg hover:shadow-[0_0_15px_rgba(204,255,0,0.4)] disabled:opacity-50 disabled:cursor-wait"
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
          className="w-4 h-4 sm:w-5 sm:h-5 text-[#ccff00]"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4.5 12.75l6 6 9-13.5"
          />
        </svg>
      ) : (
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
            d="M12 4.5v15m7.5-7.5h-15"
          />
        </svg>
      )}
    </button>
  )
}

