import { Suspense } from "react"
import { getProductsForSearch } from "@lib/data/search"
import SearchButton from "."
import { HttpTypes } from "@medusajs/types"

type SearchButtonWrapperProps = {
  region: HttpTypes.StoreRegion
}

export default async function SearchButtonWrapper({
  region,
}: SearchButtonWrapperProps) {
  const products = await getProductsForSearch(region.id)

  return <SearchButton products={products} />
}

export function SearchButtonFallback() {
  return (
    <button
      className="hover:text-ui-fg-base flex items-center gap-2 opacity-50 cursor-not-allowed"
      disabled
      aria-label="Search products"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="w-5 h-5"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
        />
      </svg>
      <span className="hidden small:inline">Search</span>
    </button>
  )
}

