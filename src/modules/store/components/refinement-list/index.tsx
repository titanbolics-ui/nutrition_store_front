"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useCallback } from "react"
import { HttpTypes } from "@medusajs/types"

import SortProducts, { SortOptions } from "./sort-products"
import CategoryMenu from "../category-menu"
import BrandFilter from "../brand-filter"
import type { BrandType } from "@lib/data/product-types"

type RefinementListProps = {
  sortBy: SortOptions
  categories?: HttpTypes.StoreProductCategory[]
  brands?: BrandType[]
  search?: boolean
  "data-testid"?: string
}

const RefinementList = ({
  sortBy,
  categories,
  brands,
  "data-testid": dataTestId,
}: RefinementListProps) => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams)
      params.set(name, value)

      return params.toString()
    },
    [searchParams]
  )

  const setQueryParams = (name: string, value: string) => {
    const query = createQueryString(name, value)
    router.push(`${pathname}?${query}`)
  }

  return (
    <div className="hidden md:flex md:flex-col gap-12 py-4 mb-8 md:px-0 md:min-w-[250px] md:ml-[1.675rem]">
      {categories && categories.length > 0 && (
        <CategoryMenu categories={categories} />
      )}
      {brands && brands.length > 0 && <BrandFilter brands={brands} />}
      <SortProducts
        sortBy={sortBy}
        setQueryParams={setQueryParams}
        data-testid={dataTestId}
      />
    </div>
  )
}

export default RefinementList
