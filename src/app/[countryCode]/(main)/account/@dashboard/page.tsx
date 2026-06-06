import { Metadata } from "next"

import Overview from "@modules/account/components/overview"
import { notFound } from "next/navigation"
import { retrieveCustomer } from "@lib/data/customer"
import { listOrders } from "@lib/data/orders"
import { getStoreCreditAccounts } from "@lib/data/store-credits"
import { getRegion } from "@lib/data/regions"

export const metadata: Metadata = {
  title: "Account",
  description: "Overview of your account activity.",
}

export default async function OverviewTemplate({
  params,
}: {
  params: Promise<{ countryCode: string }>
}) {
  const { countryCode } = await params
  const region = await getRegion(countryCode).catch(() => null)
  const currencyCode = region?.currency_code ?? "usd"

  const customer = await retrieveCustomer().catch(() => null)
  const orders = (await listOrders().catch(() => null)) || null
  const storeCreditAccounts = await getStoreCreditAccounts(currencyCode)

  if (!customer) {
    notFound()
  }

  return <Overview customer={customer} orders={orders} storeCreditAccounts={storeCreditAccounts} />
}
