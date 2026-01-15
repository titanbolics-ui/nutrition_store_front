"use client"

import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { clx } from "@medusajs/ui"
import { usePathname } from "next/navigation"
import { useEffect, useRef } from "react"

type CategoryChipsProps = {
  categories: HttpTypes.StoreProductCategory[]
  subcategories?: HttpTypes.StoreProductCategory[]
  activeParentHandle?: string // Handle of parent when on subcategory page
}

const CategoryChips = ({
  categories,
  subcategories,
  activeParentHandle,
}: CategoryChipsProps) => {
  const pathname = usePathname()
  const row1Ref = useRef<HTMLDivElement>(null)
  const row2Ref = useRef<HTMLDivElement>(null)

  // Check if we're on the main store page
  const isStorePage =
    pathname.endsWith("/store") || pathname.match(/^\/[a-z]{2}\/store$/)

  // Auto-scroll to center active items
  useEffect(() => {
    const scrollToCenter = (
      container: HTMLDivElement | null,
      activeElement: HTMLElement | null
    ) => {
      if (!container || !activeElement) return

      const containerWidth = container.offsetWidth
      const activeLeft = activeElement.offsetLeft
      const activeWidth = activeElement.offsetWidth

      // Calculate scroll position to center the active element
      const scrollPosition = activeLeft - containerWidth / 2 + activeWidth / 2

      container.scrollTo({
        left: Math.max(0, scrollPosition),
        behavior: "smooth",
      })
    }

    // Scroll Row 1 to active category
    if (row1Ref.current) {
      const activeChip = row1Ref.current.querySelector(
        '[data-active="true"]'
      ) as HTMLElement
      scrollToCenter(row1Ref.current, activeChip)
    }

    // Scroll Row 2 to active subcategory
    if (row2Ref.current) {
      const activeChip = row2Ref.current.querySelector(
        '[data-active="true"]'
      ) as HTMLElement
      scrollToCenter(row2Ref.current, activeChip)
    }
  }, [pathname])

  if (!categories?.length) return null

  return (
    <div className="md:hidden">
      {/* Row 1: Main Categories */}
      <div
        ref={row1Ref}
        className="w-full overflow-x-auto no-scrollbar py-3 -mx-4 px-4"
      >
        <div className="flex gap-2 min-w-max">
          {/* "All" chip */}
          <LocalizedClientLink
            href="/store"
            data-active={isStorePage}
            className={clx(
              "px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wide whitespace-nowrap transition-all duration-200",
              isStorePage
                ? "bg-[#ccff00] text-black shadow-[0_0_15px_rgba(204,255,0,0.3)]"
                : "bg-black text-white border border-white/30 hover:border-[#ccff00] hover:text-[#ccff00]"
            )}
          >
            All
          </LocalizedClientLink>

          {/* Category chips */}
          {categories.map((category) => {
            // Category is active if:
            // 1. We're directly on this category page
            // 2. OR we're on a subcategory and this is the parent (activeParentHandle matches)
            const isDirectlyActive = pathname.includes(
              `/categories/${category.handle}`
            )
            const isParentOfCurrent = activeParentHandle === category.handle
            const isActive = isDirectlyActive || isParentOfCurrent

            return (
              <LocalizedClientLink
                key={category.id}
                href={`/categories/${category.handle}`}
                data-active={isActive}
                className={clx(
                  "px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wide whitespace-nowrap transition-all duration-200",
                  isActive
                    ? "bg-[#ccff00] text-black shadow-[0_0_15px_rgba(204,255,0,0.3)]"
                    : "bg-black text-white border border-white/30 hover:border-[#ccff00] hover:text-[#ccff00]"
                )}
              >
                {category.name}
              </LocalizedClientLink>
            )
          })}
        </div>
      </div>

      {/* Row 2: Subcategories (smaller chips) */}
      {subcategories && subcategories.length > 0 && (
        <div
          ref={row2Ref}
          className="w-full overflow-x-auto no-scrollbar pb-4 -mx-4 px-4"
        >
          <div className="flex gap-2 min-w-max">
            {subcategories.map((sub) => {
              const isActive = pathname.includes(`/categories/${sub.handle}`)

              return (
                <LocalizedClientLink
                  key={sub.id}
                  href={`/categories/${sub.handle}`}
                  data-active={isActive}
                  className={clx(
                    "px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wide whitespace-nowrap transition-all duration-200",
                    isActive
                      ? "bg-white text-black shadow-md"
                      : "bg-transparent text-white border border-gray-600 hover:border-[#ccff00] hover:text-[#ccff00]"
                  )}
                >
                  {sub.name}
                </LocalizedClientLink>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

export default CategoryChips
