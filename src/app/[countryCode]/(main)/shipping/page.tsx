import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Shipping & Delivery | Onyx Genetics",
  description: "Global shipping information, delivery times, and our 100% reship guarantee policy.",
}

export default function ShippingPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white py-20 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-[2px] bg-[#ccff00]" />
            <span className="text-[#ccff00] text-sm font-bold tracking-[0.3em]">
              LOGISTICS
            </span>
            <div className="w-12 h-[2px] bg-[#ccff00]" />
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-4">
            GLOBAL SHIPPING
            <br />
            <span className="text-[#ccff00]">& DELIVERY</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            We ship worldwide from our international facility with guaranteed delivery.
          </p>
        </div>

        {/* Block 1: Dispatch Schedule */}
        <div className="mb-12 p-8 bg-white/5 border border-gray-800 rounded-2xl">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 rounded-xl bg-[#ccff00]/10 flex items-center justify-center">
              <svg
                className="w-7 h-7 text-[#ccff00]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-black">DISPATCH SCHEDULE</h2>
              <p className="text-gray-400">When do we ship?</p>
            </div>
          </div>
          <div className="space-y-4 text-gray-300">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-[#ccff00] mt-2 flex-shrink-0" />
              <p>
                We dispatch orders twice a week:{" "}
                <span className="text-white font-bold">Monday & Thursday</span>.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-[#ccff00] mt-2 flex-shrink-0" />
              <p>
                Orders paid before{" "}
                <span className="text-white font-bold">12:00 PM</span> on dispatch
                days go out the same day.
              </p>
            </div>
          </div>
        </div>

        {/* Block 2: Delivery Times */}
        <div className="mb-12 p-8 bg-white/5 border border-gray-800 rounded-2xl">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 rounded-xl bg-[#ccff00]/10 flex items-center justify-center">
              <svg
                className="w-7 h-7 text-[#ccff00]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-black">DELIVERY TIMES</h2>
              <p className="text-gray-400">International Warehouse (Factory Direct)</p>
            </div>
          </div>

          <div className="grid gap-4 mb-6">
            {/* USA */}
            <div className="flex items-center justify-between p-4 bg-black/30 rounded-xl border border-gray-700/50">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🇺🇸</span>
                <span className="font-bold">USA</span>
              </div>
              <span className="text-[#ccff00] font-bold">12–15 Business Days</span>
            </div>
            {/* Europe */}
            <div className="flex items-center justify-between p-4 bg-black/30 rounded-xl border border-gray-700/50">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🇪🇺</span>
                <span className="font-bold">Europe</span>
              </div>
              <span className="text-[#ccff00] font-bold">10–14 Business Days</span>
            </div>
            {/* UK */}
            <div className="flex items-center justify-between p-4 bg-black/30 rounded-xl border border-gray-700/50">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🇬🇧</span>
                <span className="font-bold">UK</span>
              </div>
              <span className="text-[#ccff00] font-bold">8–12 Business Days</span>
            </div>
          </div>

          <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
            <div className="flex items-start gap-3">
              <svg
                className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-yellow-200/80 text-sm">
                <span className="font-bold text-yellow-200">Note:</span> Tracking
                numbers are issued 3–5 days AFTER dispatch for security reasons.
              </p>
            </div>
          </div>
        </div>

        {/* Block 3: Seizure Policy - Main highlight */}
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
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-black text-[#ccff00]">
                  100% RESHIP GUARANTEE
                </h2>
                <p className="text-gray-400">Seizure Policy</p>
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-lg text-white font-medium">
                We <span className="text-[#ccff00] font-black">guarantee delivery</span>.
              </p>
              <p className="text-gray-300 leading-relaxed">
                In the unlikely event that your package is seized by customs or lost
                in transit, simply send us the seizure letter or tracking proof. We
                will re-ship your entire order{" "}
                <span className="text-[#ccff00] font-bold">FREE of charge</span> (one
                time).
              </p>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#ccff00] text-black font-black rounded-lg">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                YOU RISK NOTHING
              </div>
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="text-center p-8 bg-white/5 border border-gray-800 rounded-2xl">
          <h3 className="text-xl font-bold mb-4">Need Help With Your Order?</h3>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-gray-400">
            <a
              href="https://wa.me/447718959387"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 hover:text-[#ccff00] transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              +44 7718 959387
            </a>
            <span className="hidden sm:inline text-gray-600">|</span>
            <a
              href="mailto:sales@onyxgenetics.com"
              className="flex items-center gap-2 hover:text-[#ccff00] transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              sales@onyxgenetics.com
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

