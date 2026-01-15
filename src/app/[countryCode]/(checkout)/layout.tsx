import LocalizedClientLink from "@modules/common/components/localized-client-link"
import ChevronDown from "@modules/common/icons/chevron-down"

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="w-full bg-black relative small:min-h-screen">
      <div className="h-16 bg-black border-b border-gray-800">
        <nav className="flex h-full items-center content-container justify-between">
          <LocalizedClientLink
            href="/cart"
            className="text-small-semi text-white flex items-center gap-x-2 uppercase flex-1 basis-0"
            data-testid="back-to-cart-link"
          >
            <ChevronDown className="rotate-90 text-white" size={16} />
            <span className="mt-px hidden small:block txt-compact-plus text-gray-400 hover:text-white transition-colors">
              Back to shopping cart
            </span>
            <span className="mt-px block small:hidden txt-compact-plus text-gray-400 hover:text-white transition-colors">
              Back
            </span>
          </LocalizedClientLink>
          <LocalizedClientLink
            href="/"
            className="txt-compact-xlarge-plus text-white hover:text-[#b8ff2b] transition-colors uppercase"
            data-testid="store-link"
          >
            Onyx Genetics
          </LocalizedClientLink>
          <div className="flex-1 basis-0" />
        </nav>
      </div>
      <div className="relative" data-testid="checkout-container">{children}</div>
    </div>
  )
}
