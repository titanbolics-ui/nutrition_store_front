import { Suspense } from "react"

import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import RefinementList from "@modules/store/components/refinement-list"
import CategoryChips from "@modules/store/components/category-chips"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import { listCategories } from "@lib/data/categories"

import PaginatedProducts from "./paginated-products"

const StoreTemplate = async ({
  sortBy,
  page,
  countryCode,
}: {
  sortBy?: SortOptions
  page?: string
  countryCode: string
}) => {
  const pageNumber = page ? parseInt(page) : 1
  const sort = sortBy || "featured"

  // Fetch categories from backend - only root categories (without parent)
  const allCategories = await listCategories()
  const rootCategories =
    allCategories?.filter((category) => !category.parent_category) || []

  return (
    <>
      <div
        className="flex flex-col md:flex-row md:items-start py-6 content-container pt-8 md:pt-12 min-h-screen"
        data-testid="category-container"
      >
        <RefinementList sortBy={sort} categories={rootCategories} />
        <div className="w-full">
          {/* Mobile Category Chips */}
          <CategoryChips categories={rootCategories} />

          <h1
            className="text-2xl md:text-3xl font-black text-white uppercase tracking-tight mb-6"
            data-testid="store-page-title"
          >
            All products
          </h1>
          <Suspense fallback={<SkeletonProductGrid />}>
            <PaginatedProducts
              sortBy={sort}
              page={pageNumber}
              countryCode={countryCode}
            />
          </Suspense>
        </div>
      </div>
    </>
  )
}

export default StoreTemplate
