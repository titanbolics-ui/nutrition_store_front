"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { CircleCheck } from "lucide-react"
import { Text, clx } from "@medusajs/ui"
import type { BrandType } from "@lib/data/product-types"

/**
 * Stage E catalog refinements: brand chips (one active at a time, click again
 * to clear) + an "In Stock only" toggle. State lives in the URL
 * (`?brand=<slug>&stock=in`) so filtered views are shareable and SSR-rendered.
 * Changing either filter drops the `page` param — the old page number is
 * meaningless against a different result set.
 */
const BrandFilter = ({
  brands,
  "data-testid": dataTestId,
}: {
  brands: BrandType[]
  "data-testid"?: string
}) => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const activeBrand = searchParams.get("brand")
  const inStockOnly = searchParams.get("stock") === "in"

  const updateParams = (mutate: (params: URLSearchParams) => void) => {
    const params = new URLSearchParams(searchParams)
    mutate(params)
    params.delete("page")
    const query = params.toString()
    router.push(query ? `${pathname}?${query}` : pathname)
  }

  const toggleBrand = (slug: string) => {
    updateParams((params) => {
      if (activeBrand === slug) {
        params.delete("brand")
      } else {
        params.set("brand", slug)
      }
    })
  }

  const toggleInStock = () => {
    updateParams((params) => {
      if (inStockOnly) {
        params.delete("stock")
      } else {
        params.set("stock", "in")
      }
    })
  }

  if (brands.length === 0) {
    return null
  }

  return (
    <div className="flex flex-col gap-y-3" data-testid={dataTestId}>
      <Text className="txt-compact-small-plus text-white uppercase tracking-wider font-bold">
        Brand
      </Text>
      <div className="flex flex-wrap gap-2">
        {brands.map((brand) => {
          const isActive = activeBrand === brand.slug
          return (
            <button
              key={brand.id}
              type="button"
              onClick={() => toggleBrand(brand.slug)}
              data-active={isActive}
              data-testid="brand-filter-chip"
              className={clx(
                "px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wide whitespace-nowrap transition-all duration-200",
                isActive
                  ? "bg-[#ccff00] text-black shadow-[0_0_15px_rgba(204,255,0,0.3)]"
                  : "bg-transparent text-white border border-gray-600 hover:border-[#ccff00] hover:text-[#ccff00]"
              )}
            >
              {brand.value}
            </button>
          )
        })}
      </div>
      <button
        type="button"
        onClick={toggleInStock}
        data-active={inStockOnly}
        data-testid="in-stock-toggle"
        className={clx(
          "self-start inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wide whitespace-nowrap transition-all duration-200",
          inStockOnly
            ? "bg-[#ccff00] text-black shadow-[0_0_15px_rgba(204,255,0,0.3)]"
            : "bg-transparent text-white border border-gray-600 hover:border-[#ccff00] hover:text-[#ccff00]"
        )}
      >
        <CircleCheck className="h-3.5 w-3.5" aria-hidden="true" />
        In Stock only
      </button>
    </div>
  )
}

export default BrandFilter
