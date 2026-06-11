import { notFound } from "next/navigation"
import { Suspense } from "react"

import InteractiveLink from "@modules/common/components/interactive-link"
import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import RefinementList from "@modules/store/components/refinement-list"
import CategoryChips from "@modules/store/components/category-chips"
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
}: {
  category: HttpTypes.StoreProductCategory
  sortBy?: SortOptions
  page?: string
  countryCode: string
}) {
  const pageNumber = page ? parseInt(page) : 1
  const sort = sortBy || "created_at"

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

  // Determine subcategories to show:
  // - If current category has children, show them
  // - If current category is a child (has parent), show siblings (parent's children)
  let subcategoriesToShow: HttpTypes.StoreProductCategory[] = []
  let parentCategoryHandle: string | undefined = undefined

  if (category.category_children && category.category_children.length > 0) {
    // We're on a parent category - show its children
    subcategoriesToShow = category.category_children
  } else if (category.parent_category) {
    // We're on a subcategory - find the parent and show siblings
    parentCategoryHandle = category.parent_category.handle
    // Find the parent in allCategories to get full children list
    const parentWithChildren = allCategories?.find(
      (c) => c.id === category.parent_category?.id
    )
    if (parentWithChildren?.category_children) {
      subcategoriesToShow = parentWithChildren.category_children
    }
  }

  return (
    <>
      <div
        className="flex flex-col md:flex-row md:items-start py-6 content-container pt-8 md:pt-12 min-h-screen"
        data-testid="category-container"
      >
        <RefinementList
          sortBy={sort}
          categories={rootCategories}
          data-testid="sort-by-container"
        />
        <div className="w-full">
          {/* Mobile Category Chips with Subcategories */}
          <CategoryChips
            categories={rootCategories}
            subcategories={subcategoriesToShow}
            activeParentHandle={parentCategoryHandle}
          />

          {/* Breadcrumbs - small gray text */}
          {parents && parents.length > 0 && (
            <nav className="mb-2 text-xs text-gray-500 uppercase tracking-wider">
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
            className="text-2xl md:text-3xl font-black text-white uppercase tracking-tight mb-6"
            data-testid="category-page-title"
          >
            {category.name}
          </h1>

          {/* Description - hidden on mobile, shown on desktop */}
          {category.description && (
            <div className="hidden md:block mb-8 text-base-regular text-gray-400 max-w-2xl">
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
          <Suspense
            fallback={
              <SkeletonProductGrid
                numberOfProducts={category.products?.length ?? 8}
              />
            }
          >
            <PaginatedProducts
              sortBy={sort}
              page={pageNumber}
              categoryId={category.id}
              countryCode={countryCode}
            />
          </Suspense>

          {/* SEO Description - mobile only, at the bottom */}
          {category.description && (
            <div className="md:hidden mt-12 pt-8 border-t border-white/10 text-sm text-gray-500">
              <p>{category.description}</p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
