import { Text } from "@medusajs/ui"
import { getProductPrice } from "@lib/util/get-product-price"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Thumbnail from "../thumbnail"
import PreviewPrice from "./price"
import QuickAddButton from "./quick-add-button"

export default async function ProductPreview({
  product,
  isFeatured,
  region,
}: {
  product: HttpTypes.StoreProduct
  isFeatured?: boolean
  region: HttpTypes.StoreRegion
}) {
  const { cheapestPrice } = getProductPrice({
    product,
  })

  return (
    <LocalizedClientLink
      href={`/products/${product.handle}`}
      className="group block h-full"
    >
      <div
        data-testid="product-wrapper"
        className="h-full bg-[#111111] border border-gray-800 rounded-lg md:rounded-xl overflow-hidden md:hover:border-[#ccff00]/50 transition-all duration-300 shadow-lg md:hover:shadow-[#ccff00]/10 flex flex-col"
      >
        {/* IMAGE CONTAINER */}
        <div className="relative p-2 sm:p-3 md:p-4 bg-gray-900/50 border-b border-gray-800 flex items-center justify-center aspect-square md:group-hover:bg-gray-800/50 transition-colors duration-300 overflow-hidden">
          <div className="relative w-full h-full rounded-lg bg-gray-100 overflow-hidden">
            <Thumbnail
              thumbnail={product.thumbnail}
              images={product.images}
              size="full"
              isFeatured={isFeatured}
              isContain
              className="!bg-transparent !shadow-none !p-0 !rounded-none !border-none !overflow-hidden"
            />
          </div>
        </div>

        {/* INFO CONTAINER */}
        <div className="p-3 sm:p-4 md:p-5 flex flex-col flex-grow justify-between gap-2 sm:gap-3 md:gap-4 bg-[#111111]">
          <div>
            <div className="text-[#ccff00]/70 text-[8px] sm:text-[10px] uppercase tracking-widest font-mono mb-0.5 sm:mb-1">
              {product.collection?.title || "Spectrum Pharma"}
            </div>
            <Text
              className="text-gray-200 text-xs sm:text-sm md:text-base font-bold leading-tight uppercase tracking-normal md:group-hover:text-[#ccff00] transition-colors line-clamp-3"
              data-testid="product-title"
            >
              {product.title}
            </Text>
          </div>

          <div className="flex items-center justify-between border-t border-gray-800 pt-2 sm:pt-3 md:pt-4 mt-auto">
            <div className="font-mono font-black text-base sm:text-lg md:text-xl tracking-tight drop-shadow-[0_0_8px_rgba(204,255,0,0.3)]">
              {cheapestPrice && (
                <PreviewPrice
                  price={cheapestPrice}
                  className="text-[#ccff00]"
                />
              )}
            </div>
            <QuickAddButton product={product} />
          </div>
        </div>
      </div>
    </LocalizedClientLink>
  )
}
