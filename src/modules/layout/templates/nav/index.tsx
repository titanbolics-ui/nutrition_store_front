import { Suspense } from "react"

import { listRegions, getRegion } from "@lib/data/regions"
import { StoreRegion } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import CartButton from "@modules/layout/components/cart-button"
import SideMenu from "@modules/layout/components/side-menu"
import SearchButtonWrapper, {
  SearchButtonFallback,
} from "@modules/layout/components/search-button/search-button-wrapper"

export default async function Nav() {
  const regions = await listRegions().then((regions: StoreRegion[]) => regions)

  // Використовуємо US як дефолтний регіон для пошуку
  // Оскільки пошук показує всі продукти, регіон потрібен тільки для форматування цін
  const region = await getRegion("us").catch(() => regions?.[0] || null)

  return (
    <div className="fixed top-0 inset-x-0 z-50 group">
      <header className="relative h-20 mx-auto duration-200 bg-black/50 backdrop-blur-md border-b border-white/5">
        <nav className="content-container txt-xsmall-plus text-gray-300 flex items-center justify-between w-full h-full text-small-regular">
          <div className="flex-1 basis-0 h-full flex items-center gap-6">
            <div className="h-full flex items-center small:hidden">
              <SideMenu regions={regions} />
            </div>

            {/* CUSTOM BIO-HACKING LINKS (Desktop) */}
            <div className="hidden small:flex items-center gap-8 font-bold tracking-widest text-xs">
              <LocalizedClientLink
                href="/store"
                className="hover:text-[#ccff00] transition-colors duration-300"
              >
                COMPOUNDS
              </LocalizedClientLink>
              <LocalizedClientLink
                href="/store"
                className="hover:text-[#ccff00] transition-colors duration-300"
              >
                PEPTIDES
              </LocalizedClientLink>
              <LocalizedClientLink
                href="/store"
                className="hover:text-[#ccff00] transition-colors duration-300"
              >
                HGH
              </LocalizedClientLink>
              <LocalizedClientLink
                href="/lab-results"
                className="text-[#ccff00] hover:text-white transition-colors duration-300 flex items-center gap-2"
              >
                <span className="w-2 h-2 rounded-full bg-[#ccff00] animate-pulse" />
                LAB TESTED
              </LocalizedClientLink>
            </div>
          </div>

          <div className="flex items-center h-full">
            <LocalizedClientLink
              href="/"
              className="txt-compact-xlarge-plus text-white hover:text-[#ccff00] uppercase tracking-tighter text-2xl font-black transition-colors"
              data-testid="nav-store-link"
            >
              Onyx Genetics
            </LocalizedClientLink>
          </div>

          <div className="flex items-center gap-x-6 h-full flex-1 basis-0 justify-end">
            <div className="hidden small:flex items-center gap-x-6 h-full">
              <LocalizedClientLink
                className="hover:text-[#ccff00] transition-colors font-bold tracking-wide"
                href="/account"
                data-testid="nav-account-link"
              >
                ACCOUNT
              </LocalizedClientLink>
            </div>

            {/* Search Button */}
            {region && (
              <Suspense fallback={<SearchButtonFallback />}>
                <SearchButtonWrapper region={region} />
              </Suspense>
            )}

            <Suspense
              fallback={
                <LocalizedClientLink
                  className="hover:text-[#ccff00] flex gap-2 font-bold transition-colors"
                  href="/cart"
                  data-testid="nav-cart-link"
                >
                  CART (0)
                </LocalizedClientLink>
              }
            >
              <CartButton />
            </Suspense>
          </div>
        </nav>
      </header>
    </div>
  )
}
