import type { HttpTypes } from "@medusajs/types"
import type { SortOptions } from "@modules/store/components/refinement-list/sort-products"

interface MinPricedProduct extends HttpTypes.StoreProduct {
  _minPrice?: number
}

const MISSING_RANK = 9999

function parseRank(raw: unknown): number {
  if (typeof raw !== "number" && typeof raw !== "string") {
    return MISSING_RANK
  }
  const n = Number(raw)
  return Number.isFinite(n) ? n : MISSING_RANK
}

/**
 * Manual merchandising order: metadata.rank ascending, tiebroken by created_at
 * descending, then id for full determinism. Missing/non-numeric rank sorts last.
 */
export function sortByRank(
  products: HttpTypes.StoreProduct[]
): HttpTypes.StoreProduct[] {
  return products.sort((a, b) => {
    const rankDiff = parseRank(a.metadata?.rank) - parseRank(b.metadata?.rank)
    if (rankDiff !== 0) {
      return rankDiff
    }

    const dateDiff =
      new Date(b.created_at!).getTime() - new Date(a.created_at!).getTime()
    if (dateDiff !== 0) {
      return dateDiff
    }

    return a.id.localeCompare(b.id)
  })
}

/**
 * Helper function to sort products by price until the store API supports sorting by price
 * @param products
 * @param sortBy
 * @returns products sorted by price
 */
export function sortProducts(
  products: HttpTypes.StoreProduct[],
  sortBy: SortOptions
): HttpTypes.StoreProduct[] {
  let sortedProducts = products as MinPricedProduct[]

  if (["price_asc", "price_desc"].includes(sortBy)) {
    // Precompute the minimum price for each product
    sortedProducts.forEach((product) => {
      if (product.variants && product.variants.length > 0) {
        product._minPrice = Math.min(
          ...product.variants.map(
            (variant) => variant?.calculated_price?.calculated_amount || 0
          )
        )
      } else {
        product._minPrice = Infinity
      }
    })

    // Sort products based on the precomputed minimum prices
    sortedProducts.sort((a, b) => {
      const diff = a._minPrice! - b._minPrice!
      return sortBy === "price_asc" ? diff : -diff
    })
  }

  if (sortBy === "created_at") {
    sortedProducts.sort((a, b) => {
      return (
        new Date(b.created_at!).getTime() - new Date(a.created_at!).getTime()
      )
    })
  }

  if (sortBy === "featured") {
    sortedProducts = sortByRank(sortedProducts)
  }

  return sortedProducts
}
