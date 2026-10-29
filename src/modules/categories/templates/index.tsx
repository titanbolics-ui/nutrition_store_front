import { notFound } from "next/navigation"
import { Suspense } from "react"

import InteractiveLink from "@modules/common/components/interactive-link"
import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import RefinementList from "@modules/store/components/refinement-list"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import PaginatedProducts from "@modules/store/templates/paginated-products"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { HttpTypes } from "@medusajs/types"
import { listCategories } from "@lib/data/categories"

export default async function CategoryTemplate({
  category,
  sortBy,
  page,
  countryCode,
  brand,
  stock,
}: {
  category: HttpTypes.StoreProductCategory
  sortBy?: SortOptions
  page?: string
  countryCode: string
  brand?: string
  stock?: string
}) {
  const pageNumber = page ? parseInt(page) : 1
  const sort = sortBy || "featured"
  const inStockOnly = stock === "in"

  if (!category || !countryCode) notFound()

  // Fetch categories from backend - only root categories (without parent)
  const allCategories = await listCategories()
  const rootCategories =
    allCategories?.filter((category) => !category.parent_category) || []

  const parents = [] as HttpTypes.StoreProductCategory[]

  const getParents = (category: HttpTypes.StoreProductCategory) => {
    if (category.parent_category) {
      parents.push(category.parent_category)
      getParents(category.parent_category)
    }
  }

  getParents(category)

  return (
    <>
      <div
        className="flex flex-col md:flex-row md:items-start py-6 content-container pt-8 md:pt-12 min-h-screen"
        data-testid="category-container"
      >
        <RefinementList
          categories={rootCategories}
          data-testid="sort-by-container"
        />
        <div className="w-full">
          {/* Breadcrumbs - small gray text */}
          {parents && parents.length > 0 && (
            <nav className="page-fade-in mb-2 text-xs text-gray-500 uppercase tracking-wider">
              <LocalizedClientLink
                href="/store"
                className="hover:text-[#ccff00] transition-colors"
              >
                Home
              </LocalizedClientLink>
              {parents.reverse().map((parent) => (
                <span key={parent.id}>
                  <span className="mx-2">›</span>
                  <LocalizedClientLink
                    className="hover:text-[#ccff00] transition-colors"
                    href={`/categories/${parent.handle}`}
                  >
                    {parent.name}
                  </LocalizedClientLink>
                </span>
              ))}
            </nav>
          )}

          {/* H1 Title - large white text */}
          <h1
            className="page-fade-in text-2xl md:text-3xl font-black text-white uppercase tracking-tight mb-6"
            data-testid="category-page-title"
          >
            {category.name}
          </h1>

          {/* Description: quiet SEO intro — small, muted, clamped on mobile
              (Gymshark-style), never competing with the H1 */}
          {category.description && (
            <div className="page-fade-in mb-6 md:mb-8 text-xs md:text-sm text-gray-500 leading-relaxed max-w-2xl border-l-2 border-[#ccff00]/25 pl-4 line-clamp-2 md:line-clamp-3">
              <p>{category.description}</p>
            </div>
          )}

          {/* Subcategories list - desktop only */}
          {category.category_children &&
            category.category_children.length > 0 && (
              <div className="hidden md:block mb-8 text-base-large">
                <ul className="grid grid-cols-1 gap-2">
                  {category.category_children.map((c) => (
                    <li key={c.id}>
                      <InteractiveLink href={`/categories/${c.handle}`}>
                        {c.name}
                      </InteractiveLink>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          <Suspense fallback={<SkeletonProductGrid />}>
            <PaginatedProducts
              sortBy={sort}
              page={pageNumber}
              categoryId={category.id}
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
