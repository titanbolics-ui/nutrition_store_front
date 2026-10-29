"use client"

import { Fragment, useState } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Dialog, Menu, Transition } from "@headlessui/react"
import { ArrowUpDown, Check, SlidersHorizontal } from "lucide-react"
import { clx } from "@medusajs/ui"

import type { BrandType } from "@lib/data/product-types"
import {
  sortOptions,
  SortOptions,
} from "@modules/store/components/refinement-list/sort-products"

/**
 * Catalog refinement toolbar, rendered above the product grid.
 *
 * Desktop: one row — brand chips, In Stock switch, product count, sort dropdown.
 * Mobile (Gymshark pattern): [Filter (n)] — count — [Sort], each button opens a
 * bottom sheet. Filters apply immediately (URL push), so the sheet's footer
 * count stays live via the server re-render; "Show N products" just closes.
 *
 * State lives in the URL (`?brand=<slug>&stock=in&sortBy=…`) so filtered views
 * are shareable and SSR-rendered. Changing brand/stock drops the `page` param.
 */
const CatalogToolbar = ({
  brands,
  count,
  sortBy,
}: {
  brands: BrandType[]
  count: number
  sortBy: SortOptions
}) => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [filterSheetOpen, setFilterSheetOpen] = useState(false)
  const [sortSheetOpen, setSortSheetOpen] = useState(false)

  const activeBrand = searchParams.get("brand")
  const inStockOnly = searchParams.get("stock") === "in"
  const activeFilterCount = (activeBrand ? 1 : 0) + (inStockOnly ? 1 : 0)

  // "featured" is the internal default (no explicit choice) — never shown as
  // a selected option, the trigger just reads "Sort".
  const activeSortLabel = sortOptions.find((o) => o.value === sortBy)?.label

  const updateParams = (mutate: (params: URLSearchParams) => void) => {
    const params = new URLSearchParams(searchParams)
    mutate(params)
    params.delete("page")
    const query = params.toString()
    router.push(query ? `${pathname}?${query}` : pathname, { scroll: false })
  }

  const setBrand = (slug: string | null) => {
    updateParams((params) => {
      if (slug) {
        params.set("brand", slug)
      } else {
        params.delete("brand")
      }
    })
  }

  const toggleInStock = () => {
    updateParams((params) => {
      if (inStockOnly) {
        params.delete("stock")
      } else {
        params.set("stock", "in")
      }
    })
  }

  const setSort = (value: SortOptions) => {
    updateParams((params) => {
      params.set("sortBy", value)
    })
  }

  const clearFilters = () => {
    updateParams((params) => {
      params.delete("brand")
      params.delete("stock")
    })
  }

  const countLabel = `${count} ${count === 1 ? "product" : "products"}`

  return (
    <div className="mb-6" data-testid="catalog-toolbar">
      {/* ── Desktop: single row ─────────────────────────────────────────── */}
      <div className="hidden md:flex items-center gap-4 flex-wrap border-b border-[#252A31] pb-4">
        <div className="flex items-center gap-2">
          <BrandChip
            label="All"
            isActive={!activeBrand}
            onClick={() => setBrand(null)}
          />
          {brands.map((brand) => (
            <BrandChip
              key={brand.id}
              label={brand.value}
              isActive={activeBrand === brand.slug}
              onClick={() =>
                setBrand(activeBrand === brand.slug ? null : brand.slug)
              }
            />
          ))}
        </div>

        <div className="h-5 w-px bg-[#252A31]" aria-hidden="true" />

        <label className="flex items-center gap-2.5 cursor-pointer select-none">
          <StockSwitch checked={inStockOnly} onChange={toggleInStock} />
          <span className="text-xs font-semibold uppercase tracking-wide text-white">
            In Stock only
          </span>
        </label>

        <div className="ml-auto flex items-center gap-4">
          <span
            className="text-xs text-gray-500 uppercase tracking-wider"
            data-testid="product-count"
          >
            {countLabel}
          </span>

          {/* Sort dropdown */}
          <Menu as="div" className="relative">
            <Menu.Button
              data-testid="sort-dropdown-button"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wide text-white border border-gray-600 hover:border-[#ccff00] hover:text-[#ccff00] transition-all duration-200"
            >
              <ArrowUpDown className="h-3.5 w-3.5" aria-hidden="true" />
              {activeSortLabel ?? "Sort"}
            </Menu.Button>
            <Transition
              as={Fragment}
              enter="transition ease-out duration-150 motion-reduce:duration-0"
              enterFrom="opacity-0 translate-y-1"
              enterTo="opacity-100 translate-y-0"
              leave="transition ease-in duration-100 motion-reduce:duration-0"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Menu.Items className="absolute right-0 z-20 mt-2 w-52 origin-top-right rounded-lg border border-[#252A31] bg-[#14171C] p-1.5 shadow-xl focus:outline-none">
                {sortOptions.map((option) => (
                  <Menu.Item key={option.value}>
                    {({ active }) => (
                      <button
                        onClick={() => setSort(option.value as SortOptions)}
                        data-testid="sort-option"
                        data-active={sortBy === option.value}
                        className={clx(
                          "flex w-full items-center justify-between rounded-md px-3 py-2 text-sm text-left transition-colors",
                          active ? "bg-white/5 text-white" : "text-gray-400",
                          sortBy === option.value && "text-[#ccff00]"
                        )}
                      >
                        {option.label}
                        {sortBy === option.value && (
                          <Check className="h-4 w-4" aria-hidden="true" />
                        )}
                      </button>
                    )}
                  </Menu.Item>
                ))}
              </Menu.Items>
            </Transition>
          </Menu>
        </div>
      </div>

      {/* ── Mobile: Filter — count — Sort ───────────────────────────────── */}
      <div className="flex md:hidden items-center justify-between gap-3 border-y border-[#252A31] py-2">
        <button
          type="button"
          data-testid="mobile-filter-button"
          onClick={() => setFilterSheetOpen(true)}
          className="inline-flex items-center gap-2 min-h-[44px] px-2 text-xs font-bold uppercase tracking-wide text-white hover:text-[#ccff00] transition-colors"
        >
          <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
          Filter
          {activeFilterCount > 0 && (
            <span
              data-testid="active-filter-count"
              className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-[#ccff00] text-[10px] font-bold text-black"
            >
              {activeFilterCount}
            </span>
          )}
        </button>

        <span
          className="text-xs text-gray-500 uppercase tracking-wider"
          data-testid="product-count-mobile"
        >
          {countLabel}
        </span>

        <button
          type="button"
          data-testid="mobile-sort-button"
          onClick={() => setSortSheetOpen(true)}
          className="inline-flex items-center gap-2 min-h-[44px] px-2 text-xs font-bold uppercase tracking-wide text-white hover:text-[#ccff00] transition-colors"
        >
          <ArrowUpDown className="h-4 w-4" aria-hidden="true" />
          Sort
        </button>
      </div>

      {/* Filter bottom sheet */}
      <BottomSheet
        open={filterSheetOpen}
        onClose={() => setFilterSheetOpen(false)}
        title="Filter"
        testId="filter-sheet"
      >
        <div className="mb-2 text-xs font-bold uppercase tracking-widest text-gray-500">
          Brand
        </div>
        <ul className="mb-4">
          <SheetRadioRow
            label="All brands"
            isActive={!activeBrand}
            onClick={() => setBrand(null)}
          />
          {brands.map((brand) => (
            <SheetRadioRow
              key={brand.id}
              label={brand.value}
              isActive={activeBrand === brand.slug}
              onClick={() => setBrand(brand.slug)}
            />
          ))}
        </ul>

        <label className="flex min-h-[44px] items-center justify-between border-t border-[#252A31] py-3 cursor-pointer select-none">
          <span className="text-sm font-semibold uppercase tracking-wide text-white">
            In Stock only
          </span>
          <StockSwitch checked={inStockOnly} onChange={toggleInStock} />
        </label>

        <div className="mt-4 flex gap-3">
          <button
            type="button"
            data-testid="clear-filters-button"
            onClick={clearFilters}
            className="flex-1 min-h-[44px] rounded-lg border border-gray-600 text-xs font-bold uppercase tracking-wide text-white hover:border-[#ccff00] hover:text-[#ccff00] transition-colors"
          >
            Clear all
          </button>
          <button
            type="button"
            data-testid="show-products-button"
            onClick={() => setFilterSheetOpen(false)}
            className="flex-[2] min-h-[44px] rounded-lg bg-[#ccff00] text-xs font-bold uppercase tracking-wide text-black hover:bg-[#b8ff2b] transition-colors"
          >
            Show {countLabel}
          </button>
        </div>
      </BottomSheet>

      {/* Sort bottom sheet */}
      <BottomSheet
        open={sortSheetOpen}
        onClose={() => setSortSheetOpen(false)}
        title="Sort by"
        testId="sort-sheet"
      >
        <ul>
          {sortOptions.map((option) => (
            <SheetRadioRow
              key={option.value}
              label={option.label}
              isActive={sortBy === option.value}
              onClick={() => {
                setSort(option.value as SortOptions)
                setSortSheetOpen(false)
              }}
            />
          ))}
        </ul>
      </BottomSheet>
    </div>
  )
}

const BrandChip = ({
  label,
  isActive,
  onClick,
}: {
  label: string
  isActive: boolean
  onClick: () => void
}) => (
  <button
    type="button"
    onClick={onClick}
    data-active={isActive}
    data-testid="brand-filter-chip"
    className={clx(
      "px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wide whitespace-nowrap transition-all duration-200",
      isActive
        ? "bg-[#ccff00] text-black shadow-[0_0_15px_rgba(204,255,0,0.3)]"
        : "bg-transparent text-white border border-gray-600 hover:border-[#ccff00] hover:text-[#ccff00]"
    )}
  >
    {label}
  </button>
)

const StockSwitch = ({
  checked,
  onChange,
}: {
  checked: boolean
  onChange: () => void
}) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    aria-label="In Stock only"
    onClick={onChange}
    data-testid="in-stock-toggle"
    data-active={checked}
    className={clx(
      "relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors duration-200",
      checked ? "bg-[#ccff00]" : "bg-gray-600"
    )}
  >
    <span
      className={clx(
        "inline-block h-3.5 w-3.5 rounded-full bg-black transition-transform duration-200 motion-reduce:transition-none",
        checked ? "translate-x-[18px]" : "translate-x-[3px]"
      )}
    />
  </button>
)

const SheetRadioRow = ({
  label,
  isActive,
  onClick,
}: {
  label: string
  isActive: boolean
  onClick: () => void
}) => (
  <li>
    <button
      type="button"
      onClick={onClick}
      data-active={isActive}
      data-testid="sheet-radio-row"
      className="flex w-full min-h-[44px] items-center justify-between py-2 text-left"
    >
      <span
        className={clx(
          "text-sm font-semibold uppercase tracking-wide transition-colors",
          isActive ? "text-[#ccff00]" : "text-white"
        )}
      >
        {label}
      </span>
      <span
        aria-hidden="true"
        className={clx(
          "flex h-5 w-5 items-center justify-center rounded-full border transition-colors",
          isActive ? "border-[#ccff00]" : "border-gray-600"
        )}
      >
        {isActive && <span className="h-2.5 w-2.5 rounded-full bg-[#ccff00]" />}
      </span>
    </button>
  </li>
)

const BottomSheet = ({
  open,
  onClose,
  title,
  testId,
  children,
}: {
  open: boolean
  onClose: () => void
  title: string
  testId: string
  children: React.ReactNode
}) => (
  <Transition show={open} as={Fragment}>
    <Dialog as="div" className="relative z-[9999] md:hidden" onClose={onClose}>
      <Transition.Child
        as={Fragment}
        enter="ease-out duration-200 motion-reduce:duration-0"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="ease-in duration-150 motion-reduce:duration-0"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <div className="fixed inset-0 bg-black/70" />
      </Transition.Child>

      <div className="fixed inset-x-0 bottom-0">
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-250 motion-reduce:duration-0"
          enterFrom="translate-y-full"
          enterTo="translate-y-0"
          leave="ease-in duration-200 motion-reduce:duration-0"
          leaveFrom="translate-y-0"
          leaveTo="translate-y-full"
        >
          <Dialog.Panel
            data-testid={testId}
            className="rounded-t-2xl border-t border-white/10 bg-[#14171C] px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-3"
          >
            {/* Drag handle */}
            <div
              className="mx-auto mb-3 h-1 w-10 rounded-full bg-white/20"
              aria-hidden="true"
            />
            <Dialog.Title className="mb-3 text-sm font-black uppercase tracking-tight text-white">
              {title}
            </Dialog.Title>
            {children}
          </Dialog.Panel>
        </Transition.Child>
      </div>
    </Dialog>
  </Transition>
)

export default CatalogToolbar
