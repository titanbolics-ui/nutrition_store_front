import { redirect } from "next/navigation"

type Props = {
  params: Promise<{ countryCode: string }>
  searchParams: Promise<{ order_id?: string; token?: string }>
}

export default async function AcceptOrderTransferAliasPage(props: Props) {
  const { countryCode } = await props.params
  const searchParams = await props.searchParams

  const orderId = searchParams.order_id
  const token = searchParams.token

  if (!orderId || !token) {
    redirect(`/${countryCode}/account/orders`)
  }

  redirect(
    `/${countryCode}/order/${encodeURIComponent(orderId)}/transfer/${encodeURIComponent(token)}/accept`
  )
}

