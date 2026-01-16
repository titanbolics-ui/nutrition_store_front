import { listProducts } from "@lib/data/products"
import { HttpTypes } from "@medusajs/types"
import { Text } from "@medusajs/ui"

import InteractiveLink from "@modules/common/components/interactive-link"
import ProductPreview from "@modules/products/components/product-preview"

export default async function ProductRail({
  collection,
  region,
}: {
  collection: HttpTypes.StoreCollection
  region: HttpTypes.StoreRegion
}) {
  const {
    response: { products: pricedProducts },
  } = await listProducts({
    regionId: region.id,
    queryParams: {
      collection_id: collection.id,
      fields: "*variants.calculated_price",
    },
  })

  if (!pricedProducts) {
    return null
  }

  return (
    <div className="content-container py-12">
      <div className="flex justify-between items-end mb-10 border-b border-white/10 pb-6">
        <Text className="text-white font-black uppercase text-3xl tracking-tight">
          {collection.title}
        </Text>
        <InteractiveLink href={`/collections/${collection.handle}`}>
          <span className="text-gray-400 hover:text-[#ccff00] transition-colors font-mono uppercase tracking-wider text-xs">
            View all
          </span>
        </InteractiveLink>
      </div>
      <ul className="grid grid-cols-2 small:grid-cols-2 medium:grid-cols-4 gap-2 sm:gap-4 md:gap-6">
        {pricedProducts &&
          pricedProducts.map((product) => (
            <li key={product.id} className="h-full">
              <ProductPreview product={product} region={region} isFeatured />
            </li>
          ))}
      </ul>
    </div>
  )
}
