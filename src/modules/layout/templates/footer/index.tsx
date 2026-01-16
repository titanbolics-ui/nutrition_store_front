import { Text } from "@medusajs/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export default function Footer() {
  return (
    <footer className="relative bg-black text-white border-t border-white/5 overflow-hidden">
      {/* WATERMARK LOGO */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-[0.02] select-none">
        <h1 className="text-[20vw] font-black leading-none whitespace-nowrap">
          ONYX
        </h1>
      </div>

      <div className="content-container flex flex-col w-full relative z-10 pt-20 pb-10">
        <div className="flex flex-col lg:flex-row justify-between gap-16">
          {/* BRAND COLUMN */}
          <div className="flex flex-col gap-6 max-w-sm">
            <LocalizedClientLink
              href="/"
              className="txt-compact-xlarge-plus text-white hover:text-[#ccff00] uppercase tracking-tighter text-2xl font-black transition-colors"
            >
              Onyx Genetics
            </LocalizedClientLink>
            <p className="text-gray-500 text-sm leading-relaxed">
              Premium grade research compounds. Independently tested for purity
              and potency. Engineered for the elite.
            </p>

            {/* TRUST BADGES - Vertical stack */}
            <div className="flex flex-col gap-2 mt-4">
              <div className="flex items-center gap-2 text-xs font-bold text-gray-400 border border-white/10 px-3 py-2 rounded bg-white/5 w-fit">
                <span className="text-sm leading-none">₿</span>
                <span className="leading-none">Bitcoin Accepted</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-gray-400 border border-white/10 px-3 py-2 rounded bg-white/5 w-fit">
                <span className="text-sm leading-none">🛡️</span>
                <span className="leading-none">SSL Secure</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-gray-400 border border-white/10 px-3 py-2 rounded bg-white/5 w-fit">
                <span className="text-sm leading-none">📦</span>
                <span className="leading-none">Discrete Shipping</span>
              </div>
            </div>
          </div>

          {/* LINKS COLUMNS */}
          <div className="flex gap-12 lg:gap-16 flex-wrap">
            {/* CATEGORIES */}
            <div className="flex flex-col gap-y-4">
              <span className="text-sm font-bold text-white uppercase tracking-wider">
                Categories
              </span>
              <ul className="flex flex-col gap-y-2 text-gray-500 text-sm">
                <li>
                  <LocalizedClientLink
                    className="hover:text-[#ccff00] transition-colors"
                    href="/categories/injectable-steroids"
                  >
                    Injectables
                  </LocalizedClientLink>
                </li>
                <li>
                  <LocalizedClientLink
                    className="hover:text-[#ccff00] transition-colors"
                    href="/categories/oral-steroids"
                  >
                    Oral Steroids
                  </LocalizedClientLink>
                </li>
                <li>
                  <LocalizedClientLink
                    className="hover:text-[#ccff00] transition-colors"
                    href="/categories/peptides"
                  >
                    Peptides
                  </LocalizedClientLink>
                </li>
                <li>
                  <LocalizedClientLink
                    className="hover:text-[#ccff00] transition-colors"
                    href="/categories/hgh"
                  >
                    HGH
                  </LocalizedClientLink>
                </li>
                <li>
                  <LocalizedClientLink
                    className="hover:text-[#ccff00] transition-colors"
                    href="/categories/post-cycle-therapy"
                  >
                    PCT
                  </LocalizedClientLink>
                </li>
                <li>
                  <LocalizedClientLink
                    className="hover:text-[#ccff00] transition-colors"
                    href="/categories/sexual-health"
                  >
                    Sexual Health
                  </LocalizedClientLink>
                </li>
              </ul>
            </div>

            {/* SUPPORT */}
            <div className="flex flex-col gap-y-4">
              <span className="text-sm font-bold text-white uppercase tracking-wider">
                Support
              </span>
              <ul className="flex flex-col gap-y-2 text-gray-500 text-sm">
                <li>
                  <LocalizedClientLink
                    className="hover:text-[#ccff00] transition-colors"
                    href="/account/orders"
                  >
                    Track Order
                  </LocalizedClientLink>
                </li>
                <li>
                  <LocalizedClientLink
                    className="hover:text-[#ccff00] transition-colors"
                    href="/shipping"
                  >
                    Shipping Info
                  </LocalizedClientLink>
                </li>
                <li>
                  <LocalizedClientLink
                    className="hover:text-[#ccff00] transition-colors"
                    href="/returns"
                  >
                    Returns Policy
                  </LocalizedClientLink>
                </li>
                <li>
                  <LocalizedClientLink
                    className="hover:text-[#ccff00] transition-colors"
                    href="/contact"
                  >
                    Contact Us
                  </LocalizedClientLink>
                </li>
                <li>
                  <LocalizedClientLink
                    className="hover:text-[#ccff00] transition-colors"
                    href="/lab-results"
                  >
                    Lab Results
                  </LocalizedClientLink>
                </li>
              </ul>
            </div>

            {/* NEWSLETTER */}
            <div className="flex flex-col gap-y-4 min-w-[250px]">
              <span className="text-sm font-bold text-white uppercase tracking-wider">
                Join The Lab
              </span>
              <div className="flex flex-col gap-2">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="bg-white/5 border border-white/10 text-white px-4 py-3 text-sm focus:outline-none focus:border-[#ccff00] transition-colors rounded-sm"
                />
                <button className="bg-[#ccff00] text-black font-bold uppercase text-xs px-4 py-3 hover:bg-white transition-colors rounded-sm tracking-widest">
                  Subscribe
                </button>
              </div>
              <p className="text-xs text-gray-600">
                Get exclusive access to new compounds and insider drops.
              </p>
            </div>
          </div>
        </div>

        <div className="flex w-full mt-20 justify-between text-gray-600 text-xs uppercase tracking-wider border-t border-white/5 pt-8">
          <Text className="txt-compact-small">
            © {new Date().getFullYear()} Onyx Genetics. All rights reserved.
          </Text>
          <div className="flex gap-4">
            <span className="hover:text-white cursor-pointer">
              Privacy Policy
            </span>
            <span className="hover:text-white cursor-pointer">
              Terms of Service
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}
