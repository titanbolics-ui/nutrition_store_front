import { sdk } from "@lib/config"
import { listProducts } from "@lib/data/products"
import { HttpTypes } from "@medusajs/types"
import { Text } from "@medusajs/ui"
import InteractiveLink from "@modules/common/components/interactive-link"
import ProductPreview from "@modules/products/components/product-preview"

export default async function BestSellers({
  region,
}: {
  region: HttpTypes.StoreRegion
}) {
  // First, try to get the "best-sellers" tag
  let tagId: string | null = null

  try {
    const tagsResponse = await sdk.client.fetch<{
      product_tags: { id: string; value: string }[]
    }>(`/store/product-tags`, {
      method: "GET",
      query: { q: "best-sellers", limit: 1 },
      cache: "force-cache",
    })

    if (tagsResponse.product_tags?.length > 0) {
      tagId = tagsResponse.product_tags[0].id
    }
  } catch (e) {
    // Tag endpoint might not exist, fallback to filtering
    console.log("Tags endpoint not available, using fallback")
  }

  // Fetch products - with tag_id if available, otherwise fetch more and filter
  const {
    response: { products },
  } = await listProducts({
    regionId: region.id,
    queryParams: {
      limit: tagId ? 8 : 50,
      fields: "*variants.calculated_price,+tags",
      ...(tagId && { tag_id: [tagId] }),
    },
  })

  // If we fetched by tag_id, use those directly. Otherwise filter.
  let displayProducts = products

  if (!tagId) {
    // Fallback: filter products that have "best-sellers" tag
    const bestSellerProducts = products.filter((product) =>
      product.tags?.some(
        (tag) =>
          tag.value?.toLowerCase() === "best-sellers" ||
          tag.value?.toLowerCase() === "bestsellers" ||
          tag.value?.toLowerCase() === "best sellers"
      )
    )
    displayProducts =
      bestSellerProducts.length > 0
        ? bestSellerProducts.slice(0, 8)
        : products.slice(0, 8)
  }

  if (!displayProducts || displayProducts.length === 0) {
    return null
  }

  return (
    <section className="relative py-16 md:py-24 bg-[#0a0a0a]">
      {/* Grid Texture Background */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)`,
          backgroundSize: "4rem 4rem",
        }}
      />

      {/* Content */}
      <div className="relative z-10 content-container">
        <div className="flex justify-between items-end mb-10 border-b border-white/10 pb-6">
          <div>
            <Text className="text-[#ccff00] text-xs font-mono uppercase tracking-widest mb-2">
              Top Picks
            </Text>
            <Text className="text-white font-black uppercase text-3xl tracking-tight">
              Best Sellers
            </Text>
          </div>
          <InteractiveLink href="/store">
            <span className="text-gray-400 hover:text-[#ccff00] transition-colors font-mono uppercase tracking-wider text-xs">
              View all
            </span>
          </InteractiveLink>
        </div>
        <ul className="grid grid-cols-2 small:grid-cols-2 medium:grid-cols-4 gap-2 sm:gap-4 md:gap-6">
          {displayProducts.map((product) => (
            <li key={product.id} className="h-full">
              <ProductPreview product={product} region={region} isFeatured />
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
