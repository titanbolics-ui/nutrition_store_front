import { Text } from "@medusajs/ui"
import { getProductPrice } from "@lib/util/get-product-price"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Thumbnail from "../thumbnail"
import PreviewPrice from "./price"

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
        className="h-full bg-[#111111] border border-gray-800 rounded-lg md:rounded-xl overflow-hidden hover:border-[#ccff00]/50 transition-all duration-300 shadow-lg hover:shadow-[#ccff00]/10 flex flex-col"
      >
        {/* IMAGE CONTAINER - "INSTAGRAM GRID" STYLE */}
        <div className="relative p-2 sm:p-4 md:p-6 bg-white/5 border-b border-gray-800 flex items-center justify-center aspect-square group-hover:bg-white/10 transition-colors duration-300">
          {/* DOMESTIC BADGE */}
          <div className="absolute top-2 right-2 z-10 bg-[#ccff00] text-black text-[8px] sm:text-[10px] font-black px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-sm uppercase tracking-wider flex items-center gap-0.5 sm:gap-1 shadow-md">
            <span>US</span>
            <span className="text-[10px] sm:text-xs">🇺🇸</span>
          </div>

          <div className="relative w-full h-full rounded-lg overflow-hidden bg-white p-2 sm:p-3 md:p-4 shadow-[inset_0_2px_8px_rgba(0,0,0,0.1)]">
        <Thumbnail
          thumbnail={product.thumbnail}
          images={product.images}
          size="full"
          isFeatured={isFeatured}
              isContain
              className="bg-transparent shadow-none p-0 rounded-none border-none h-full w-full hover:scale-110 transition-transform duration-500"
            />
          </div>
        </div>

        {/* INFO CONTAINER */}
        <div className="p-3 sm:p-4 md:p-5 flex flex-col flex-grow justify-between gap-2 sm:gap-3 md:gap-4 bg-[#111111]">
          <div>
            <div className="text-gray-500 text-[8px] sm:text-[10px] uppercase tracking-widest font-mono mb-0.5 sm:mb-1">
              {product.collection?.title || "Spectrum Pharma"}
            </div>
            <Text
              className="text-white text-sm sm:text-base font-bold leading-snug uppercase tracking-normal group-hover:text-[#ccff00] transition-colors line-clamp-2"
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
            <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-full border border-gray-600 bg-transparent flex items-center justify-center text-white group-hover:bg-[#ccff00] group-hover:text-black group-hover:border-[#ccff00] transition-all duration-300 shadow-lg group-hover:shadow-[0_0_15px_rgba(204,255,0,0.4)]">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2.5}
                stroke="currentColor"
                className="w-4 h-4 sm:w-5 sm:h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 4.5v15m7.5-7.5h-15"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </LocalizedClientLink>
  )
}
