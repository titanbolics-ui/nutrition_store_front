import { listProductsWithSort } from "@lib/data/products"
import { listBrandTypes } from "@lib/data/product-types"
import { getRegion } from "@lib/data/regions"
import ProductPreview from "@modules/products/components/product-preview"
import CatalogToolbar from "@modules/store/components/catalog-toolbar"
import { Pagination } from "@modules/store/components/pagination"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"

const PRODUCT_LIMIT = 12

type PaginatedProductsParams = {
  limit: number
  collection_id?: string[]
  category_id?: string[]
  id?: string[]
  order?: string
}

export default async function PaginatedProducts({
  sortBy,
  page,
  collectionId,
  categoryId,
  productsIds,
  countryCode,
  brandSlug,
  inStockOnly,
}: {
  sortBy?: SortOptions
  page: number
  collectionId?: string
  categoryId?: string
  productsIds?: string[]
  countryCode: string
  brandSlug?: string
  inStockOnly?: boolean
}) {
  const queryParams: PaginatedProductsParams = {
    limit: 12,
  }

  if (collectionId) {
    queryParams["collection_id"] = [collectionId]
  }

  if (categoryId) {
    queryParams["category_id"] = [categoryId]
  }

  if (productsIds) {
    queryParams["id"] = productsIds
  }

  if (sortBy === "created_at") {
    queryParams["order"] = "created_at"
  }

  const region = await getRegion(countryCode)

  if (!region) {
    return null
  }

  const brands = await listBrandTypes()

  // An unknown ?brand= slug (typo, stale link) filters to nothing rather
  // than silently showing the full unfiltered catalog.
  const brandTypeId = brandSlug
    ? brands.find((b) => b.slug === brandSlug)?.id ?? "unknown-brand"
    : undefined

  let {
    response: { products, count },
  } = await listProductsWithSort({
    page,
    queryParams,
    sortBy,
    countryCode,
    brandTypeId,
    inStockOnly,
  })

  const totalPages = Math.ceil(count / PRODUCT_LIMIT)

  return (
    <>
      <CatalogToolbar
        brands={brands}
        count={count}
        sortBy={sortBy ?? "featured"}
      />
      <ul
        className="grid grid-cols-2 w-full small:grid-cols-3 medium:grid-cols-4 gap-2 sm:gap-4 md:gap-6"
        data-testid="products-list"
      >
        {products.map((p, i) => {
          return (
            <li
              key={p.id}
              className="product-grid-item"
              style={{ "--i": i } as React.CSSProperties}
            >
              <ProductPreview product={p} region={region} />
            </li>
          )
        })}
      </ul>
      {totalPages > 1 && (
        <Pagination
          data-testid="product-pagination"
          page={page}
          totalPages={totalPages}
        />
      )}
    </>
  )
}
