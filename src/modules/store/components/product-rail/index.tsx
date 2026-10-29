"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { clx } from "@medusajs/ui"

import LocalizedClientLink from "@modules/common/components/localized-client-link"
import type { StockState } from "@lib/util/resolve-stock-state"

export type RailProduct = {
  title: string
  thumbnail: string
  handle: string
  price: string | null
  stockState: StockState
}

const STOCK_META: Record<StockState, { dot: string; label: string }> = {
  in_stock: { dot: "bg-[#ccff00]", label: "In Stock" },
  low_stock: { dot: "bg-amber-400", label: "Low Stock" },
  out_of_stock: { dot: "bg-gray-600", label: "Out of Stock" },
}

/**
 * Horizontal product rail: catalog-grade cards, scroll-snap with a peek of the
 * next card on mobile, arrow buttons on desktop (hidden when there's nothing
 * to scroll to), edge fades. Shared by the homepage goal sections.
 */
const ProductRail = ({ products }: { products: RailProduct[] }) => {
  const scrollerRef = useRef<HTMLDivElement>(null)
  const [canPrev, setCanPrev] = useState(false)
  const [canNext, setCanNext] = useState(false)

  const updateArrows = useCallback(() => {
    const el = scrollerRef.current
    if (!el) return
    setCanPrev(el.scrollLeft > 4)
    setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 4)
  }, [])

  useEffect(() => {
    updateArrows()
    const el = scrollerRef.current
    if (!el) return
    el.addEventListener("scroll", updateArrows, { passive: true })
    window.addEventListener("resize", updateArrows)
    return () => {
      el.removeEventListener("scroll", updateArrows)
      window.removeEventListener("resize", updateArrows)
    }
  }, [updateArrows])

  const scrollByAmount = (direction: 1 | -1) => {
    const el = scrollerRef.current
    if (!el || typeof el.scrollBy !== "function") return
    el.scrollBy({ left: direction * el.clientWidth * 0.8, behavior: "smooth" })
  }

  if (products.length === 0) return null

  return (
    <div className="relative group/rail" data-testid="product-rail">
      <div
        ref={scrollerRef}
        className="flex gap-3 md:gap-4 overflow-x-auto snap-x snap-mandatory no-scrollbar -mx-4 px-4 md:mx-0 md:px-0 scroll-px-4 md:scroll-px-0"
      >
        {products.map((product) => (
          <RailCard key={product.handle} product={product} />
        ))}
      </div>

      {/* Desktop arrows — appear when scrollable */}
      <button
        type="button"
        aria-label="Previous products"
        data-testid="rail-prev"
        onClick={() => scrollByAmount(-1)}
        className={clx(
          "hidden md:flex absolute -left-5 top-[38%] -translate-y-1/2 h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-black/80 backdrop-blur text-white transition-all duration-200 hover:border-[#ccff00] hover:text-[#ccff00]",
          canPrev ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
      >
        <ChevronLeft className="h-5 w-5" aria-hidden="true" />
      </button>
      <button
        type="button"
        aria-label="More products"
        data-testid="rail-next"
        onClick={() => scrollByAmount(1)}
        className={clx(
          "hidden md:flex absolute -right-5 top-[38%] -translate-y-1/2 h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-black/80 backdrop-blur text-white transition-all duration-200 hover:border-[#ccff00] hover:text-[#ccff00]",
          canNext ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
      >
        <ChevronRight className="h-5 w-5" aria-hidden="true" />
      </button>
    </div>
  )
}

const RailCard = ({ product }: { product: RailProduct }) => {
  const stock = STOCK_META[product.stockState]

  return (
    <LocalizedClientLink
      href={`/products/${product.handle}`}
      data-testid="rail-card"
      className="group snap-start shrink-0 w-[44vw] sm:w-[30vw] md:w-[200px] rounded-xl overflow-hidden border border-[#252A31] bg-[#14171C] transition-all duration-200 hover:border-[#ccff00]/40 hover:-translate-y-1"
    >
      <div className="relative aspect-square bg-white">
        <Image
          src={product.thumbnail}
          alt={product.title}
          fill
          sizes="(max-width: 768px) 44vw, 200px"
          className="object-contain p-3"
        />
      </div>
      <div className="p-3">
        <div className="text-[11px] md:text-xs font-semibold text-white leading-snug line-clamp-2 min-h-[2.4em] group-hover:text-[#ccff00] transition-colors">
          {product.title}
        </div>
        <div className="mt-2 flex items-center justify-between gap-2">
          {product.price && (
            <span className="font-mono text-xs md:text-sm text-[#ccff00] font-bold">
              {product.price}
            </span>
          )}
          <span className="flex items-center gap-1.5">
            <span
              className={clx("h-1.5 w-1.5 rounded-full", stock.dot)}
              aria-hidden="true"
            />
            <span className="text-[9px] md:text-[10px] uppercase tracking-wider text-gray-500">
              {stock.label}
            </span>
          </span>
        </div>
      </div>
    </LocalizedClientLink>
  )
}

export default ProductRail
