import { Metadata } from "next"
import ActivateClient from "./activate-client"

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export const revalidate = 0

type Props = {
  searchParams: Promise<{ token?: string }>
  params: Promise<{ countryCode: string }>
}

export default async function ActivatePage({ searchParams, params }: Props) {
  const { token } = await searchParams
  const { countryCode } = await params

  return <ActivateClient token={token} countryCode={countryCode} />
}
