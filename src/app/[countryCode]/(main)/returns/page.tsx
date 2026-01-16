import { Metadata } from "next"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export const metadata: Metadata = {
  title: "Returns & Refunds | Onyx Genetics",
  description: "Our refund policy and exceptions for damaged or incorrect orders.",
}

export default function ReturnsPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white py-20 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-[2px] bg-[#ccff00]" />
            <span className="text-[#ccff00] text-sm font-bold tracking-[0.3em]">
              POLICY
            </span>
            <div className="w-12 h-[2px] bg-[#ccff00]" />
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-4">
            REFUND
            <br />
            <span className="text-[#ccff00]">POLICY</span>
          </h1>
        </div>

        {/* Main Policy Block */}
        <div className="mb-12 p-8 bg-white/5 border border-gray-800 rounded-2xl">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 rounded-xl bg-red-500/10 flex items-center justify-center">
              <svg
                className="w-7 h-7 text-red-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-black">ALL SALES ARE FINAL</h2>
            </div>
          </div>

          <div className="space-y-4 text-gray-300 leading-relaxed">
            <p>
              Due to the nature of pharmaceutical compounds and strict hygiene
              regulations, we <span className="text-white font-bold">cannot accept returns</span> once
              a package has left our facility.
            </p>
            <p>
              We cannot restock products that have been shipped out, even if
              unopened. This policy protects both our customers and our quality
              standards.
            </p>
          </div>
        </div>

        {/* Exceptions Block */}
        <div className="mb-12 p-8 bg-gradient-to-br from-[#ccff00]/10 to-transparent border-2 border-[#ccff00]/50 rounded-2xl relative overflow-hidden">
          {/* Glow effect */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#ccff00]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-xl bg-[#ccff00] flex items-center justify-center">
                <svg
                  className="w-7 h-7 text-black"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-black text-[#ccff00]">EXCEPTIONS</h2>
                <p className="text-gray-400">When we make it right</p>
              </div>
            </div>

            <p className="text-gray-300 mb-6">
              We will <span className="text-[#ccff00] font-bold">reship immediately</span> in the
              following cases:
            </p>

            <div className="space-y-4">
              {/* Exception 1 */}
              <div className="flex items-start gap-4 p-4 bg-black/30 rounded-xl border border-gray-700/50">
                <div className="w-10 h-10 rounded-lg bg-[#ccff00]/20 flex items-center justify-center flex-shrink-0">
                  <svg
                    className="w-5 h-5 text-[#ccff00]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-white mb-1">Broken / Damaged Items</h3>
                  <p className="text-gray-400 text-sm">
                    If items arrive broken or damaged, send us photo proof and we&apos;ll
                    reship immediately.
                  </p>
                </div>
              </div>

              {/* Exception 2 */}
              <div className="flex items-start gap-4 p-4 bg-black/30 rounded-xl border border-gray-700/50">
                <div className="w-10 h-10 rounded-lg bg-[#ccff00]/20 flex items-center justify-center flex-shrink-0">
                  <svg
                    className="w-5 h-5 text-[#ccff00]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-white mb-1">Wrong Item Sent</h3>
                  <p className="text-gray-400 text-sm">
                    If we made a mistake and sent the wrong item, we&apos;ll correct it
                    immediately.
                  </p>
                </div>
              </div>

              {/* Exception 3 */}
              <div className="flex items-start gap-4 p-4 bg-black/30 rounded-xl border border-gray-700/50">
                <div className="w-10 h-10 rounded-lg bg-[#ccff00]/20 flex items-center justify-center flex-shrink-0">
                  <svg
                    className="w-5 h-5 text-[#ccff00]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-white mb-1">Package Seized</h3>
                  <p className="text-gray-400 text-sm">
                    Covered by our{" "}
                    <LocalizedClientLink
                      href="/shipping"
                      className="text-[#ccff00] hover:underline"
                    >
                      100% Reship Guarantee
                    </LocalizedClientLink>
                    . Send us the seizure letter and we&apos;ll reship FREE.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Note */}
        <div className="text-center p-8 bg-white/5 border border-gray-800 rounded-2xl">
          <p className="text-gray-400 mb-4">
            Have an issue with your order? We&apos;re here to help.
          </p>
          <LocalizedClientLink
            href="/contact"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#ccff00] text-black font-bold rounded-lg hover:bg-[#b8e600] transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            Contact Support
          </LocalizedClientLink>
        </div>
      </div>
    </div>
  )
}

