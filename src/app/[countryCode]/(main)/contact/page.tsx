import { Metadata } from "next"
import ContactForm from "@modules/contact/contact-form"

export const metadata: Metadata = {
  title: "Contact Us | Onyx Genetics",
  description:
    "Get in touch with our customer support team for help with orders, cycles, or any questions.",
}

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white py-20 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-[2px] bg-[#ccff00]" />
            <span className="text-[#ccff00] text-sm font-bold tracking-[0.3em]">
              SUPPORT
            </span>
            <div className="w-12 h-[2px] bg-[#ccff00]" />
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-4">
            CUSTOMER
            <br />
            <span className="text-[#ccff00]">SUPPORT</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Need help with your cycle or order? Our team is available Mon-Fri.
          </p>
        </div>

        {/* Security Warning */}
        <div className="mb-12 p-6 bg-red-500/10 border-2 border-red-500/50 rounded-2xl">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center flex-shrink-0">
              <svg
                className="w-6 h-6 text-red-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-black text-red-400 mb-2">
                ⚠️ SECURITY PROTOCOL
              </h2>
              <p className="text-red-200/80 leading-relaxed">
                When contacting us regarding payments (PayPal, CashApp, Crypto),{" "}
                <span className="font-bold text-red-300">
                  NEVER mention product names
                </span>{" "}
                (e.g., &quot;Testosterone&quot;, &quot;Steroids&quot;) in the
                transaction notes or support chats. Use your{" "}
                <span className="font-bold text-white">Order ID only</span>{" "}
                (e.g., #ONX-1253).
              </p>
              <p className="text-red-400 font-bold mt-3">
                Violating this rule leads to an instant ban.
              </p>
            </div>
          </div>
        </div>

        {/* Contact Methods */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {/* Email */}
          <a
            href="mailto:sales@onyxgenetics.com"
            className="group p-6 bg-white/5 border border-gray-800 rounded-2xl hover:border-[#ccff00]/50 transition-all duration-300"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl bg-[#ccff00]/10 flex items-center justify-center group-hover:bg-[#ccff00]/20 transition-colors">
                <svg
                  className="w-6 h-6 text-[#ccff00]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-lg">Email</h3>
                <p className="text-gray-400 text-sm">Response: &lt;24h</p>
              </div>
            </div>
            <p className="text-[#ccff00] font-medium group-hover:underline">
              sales@onyxgenetics.com
            </p>
          </a>

          {/* WhatsApp */}
          <a
            href="https://wa.link/q91b6d"
            target="_blank"
            rel="noopener noreferrer"
            className="group p-6 bg-white/5 border border-gray-800 rounded-2xl hover:border-[#ccff00]/50 transition-all duration-300"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl bg-[#ccff00]/10 flex items-center justify-center group-hover:bg-[#ccff00]/20 transition-colors">
                <svg
                  className="w-6 h-6 text-[#ccff00]"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-lg">WhatsApp</h3>
                <p className="text-gray-400 text-sm">Faster response</p>
              </div>
            </div>
            <p className="text-[#ccff00] font-medium group-hover:underline">
              +44 7718 959387
            </p>
          </a>
        </div>

        {/* Contact Form */}
        <div className="p-8 bg-white/5 border border-gray-800 rounded-2xl">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-xl bg-[#ccff00]/10 flex items-center justify-center">
              <svg
                className="w-6 h-6 text-[#ccff00]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-black">SEND A MESSAGE</h2>
              <p className="text-gray-400">We&apos;ll get back to you ASAP</p>
            </div>
          </div>

          <ContactForm />
        </div>
      </div>
    </div>
  )
}
