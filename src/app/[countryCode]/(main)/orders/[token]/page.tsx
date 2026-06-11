import { Metadata } from "next"
import { notFound, redirect } from "next/navigation"
import { cookies } from "next/headers"
import { retrieveCustomer } from "@lib/data/customer"
import OrderDetailsTemplate from "@modules/order/templates/order-details-template"
import ActivationBlock from "./activation-block"

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export const revalidate = 0

const BACKEND = process.env.MEDUSA_BACKEND_URL || "http://localhost:9000"
const PUB_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ""

type Props = {
  params: Promise<{ token: string; countryCode: string }>
}

export default async function OrderStatusPage({ params }: Props) {
  const { token, countryCode } = await params

  // Fetch order data server-side — masking logic stays on backend
  const res = await fetch(`${BACKEND}/store/orders/by-token/${token}`, {
    headers: {
      "x-publishable-api-key": PUB_KEY,
    },
    cache: "no-store",
  })

  if (!res.ok) {
    // 401 = expired/invalid token — show friendly error instead of 404
    if (res.status === 401 || res.status === 404) {
      return <OrderExpired countryCode={countryCode} />
    }
    notFound()
  }

  const { order, has_registered_account } = await res.json()

  // Check if the viewer is logged in (for hiding the activation block)
  const jar = await cookies()
  const isLoggedIn = !!jar.get("_medusa_jwt")?.value

  // Logged in AND it's their order → canonical account page (full details,
  // single source of truth). Logged in but foreign order → masked guest view.
  if (isLoggedIn) {
    const customer = await retrieveCustomer().catch(() => null)
    if (
      customer?.email &&
      customer.email.toLowerCase() === String(order.email).toLowerCase()
    ) {
      redirect(`/${countryCode}/account/orders/details/${order.id}`)
    }
  }

  return (
    <div className="content-container max-w-3xl mx-auto py-8 px-0 sm:px-4">
      <OrderDetailsTemplate
        order={order}
        variant="guest"
        footer={
          !isLoggedIn ? (
            <ActivationBlock
              hasRegisteredAccount={has_registered_account}
              orderViewToken={token}
              countryCode={countryCode}
            />
          ) : null
        }
      />
    </div>
  )
}

function OrderExpired({ countryCode }: { countryCode: string }) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="max-w-sm w-full bg-[#111111] border border-gray-800 rounded-xl p-8 text-center">
        <p className="text-[#b8ff2b] text-xs font-bold uppercase tracking-widest mb-4">
          ONYX GENETICS
        </p>
        <p className="text-white font-semibold text-lg mb-2">Link expired</p>
        <p className="text-gray-400 text-sm mb-6">
          This order link has expired or is invalid. Order links are valid for 30
          days after issue.
        </p>
        <a
          href={`/${countryCode}/orders/track`}
          className="block w-full bg-[#b8ff2b] text-black font-bold py-3 rounded-lg text-sm uppercase tracking-wider text-center hover:opacity-90 transition-opacity"
        >
          Track my order
        </a>
      </div>
    </div>
  )
}
