import { Suspense } from "react"

import { listRegions, getRegion } from "@lib/data/regions"
import { StoreRegion } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import CartButton from "@modules/layout/components/cart-button"
import SideMenu from "@modules/layout/components/side-menu"
import SearchButtonWrapper, {
  SearchButtonFallback,
} from "@modules/layout/components/search-button/search-button-wrapper"
import HeaderWrapper from "@modules/layout/components/header-wrapper"

export default async function Nav() {
  const regions = await listRegions().then((regions: StoreRegion[]) => regions)

  // Використовуємо US як дефолтний регіон для пошуку
  // Оскільки пошук показує всі продукти, регіон потрібен тільки для форматування цін
  const region = await getRegion("us").catch(() => regions?.[0] || null)

  return (
    <HeaderWrapper>
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
                href="/categories/peptides"
                className="hover:text-[#ccff00] transition-colors duration-300"
              >
                PEPTIDES
              </LocalizedClientLink>
              <LocalizedClientLink
                href="/categories/hgh"
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
                  className="relative flex items-center gap-2 hover:text-[#ccff00] transition-colors"
                  href="/cart"
                  data-testid="nav-cart-link"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-6 h-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                    />
                  </svg>
                  <span className="hidden small:inline font-bold tracking-wide text-sm">
                    CART
                  </span>
                </LocalizedClientLink>
              }
            >
              <CartButton />
            </Suspense>
          </div>
        </nav>
      </header>
    </HeaderWrapper>
  )
}
