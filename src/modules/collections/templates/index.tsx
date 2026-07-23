import { Suspense } from "react"

import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import RefinementList from "@modules/store/components/refinement-list"
import CategoryChips from "@modules/store/components/category-chips"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import PaginatedProducts from "@modules/store/templates/paginated-products"
import { HttpTypes } from "@medusajs/types"
import { listCategories } from "@lib/data/categories"
import { listBrandTypes } from "@lib/data/product-types"
import BrandFilter from "@modules/store/components/brand-filter"

export default async function CollectionTemplate({
  sortBy,
  collection,
  page,
  countryCode,
  brand,
  stock,
}: {
  sortBy?: SortOptions
  collection: HttpTypes.StoreCollection
  page?: string
  countryCode: string
  brand?: string
  stock?: string
}) {
  const pageNumber = page ? parseInt(page) : 1
  const sort = sortBy || "featured"
  const inStockOnly = stock === "in"

  // Fetch categories from backend - only root categories (without parent)
  const allCategories = await listCategories()
  const rootCategories =
    allCategories?.filter((category) => !category.parent_category) || []
  const brands = await listBrandTypes()

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-start py-6 content-container pt-8 md:pt-12 min-h-screen">
        <RefinementList
          sortBy={sort}
          categories={rootCategories}
          brands={brands}
        />
        <div className="w-full">
          {/* Mobile Category Chips */}
          <CategoryChips categories={rootCategories} />

          {/* Mobile brand / stock filters */}
          <div className="md:hidden mb-4">
            <BrandFilter brands={brands} />
          </div>

          <h1 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tight mb-6">
            {collection.title}
          </h1>
          <Suspense
            fallback={
              <SkeletonProductGrid />
            }
          >
            <PaginatedProducts
              sortBy={sort}
              page={pageNumber}
              collectionId={collection.id}
              countryCode={countryCode}
              brandSlug={brand}
              inStockOnly={inStockOnly}
            />
          </Suspense>
        </div>
      </div>
    </>
  )
}
