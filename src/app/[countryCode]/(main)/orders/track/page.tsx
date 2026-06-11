import { Metadata } from "next"
import TrackOrderClient from "./track-order-client"

export const metadata: Metadata = {
  title: "Track your order",
  description: "Find your order status by entering your email and order number.",
}

type Props = {
  params: Promise<{ countryCode: string }>
}

export default async function TrackOrderPage({ params }: Props) {
  const { countryCode } = await params
  return <TrackOrderClient countryCode={countryCode} />
}
