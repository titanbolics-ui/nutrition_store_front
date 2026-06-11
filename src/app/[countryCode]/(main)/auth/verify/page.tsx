import { Metadata } from "next"
import VerifyClient from "./verify-client"

// No-index: this page URL contains a one-time login token
export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

// No caching — token pages must never be served from cache
export const revalidate = 0

type Props = {
  searchParams: Promise<{ token?: string }>
  params: Promise<{ countryCode: string }>
}

export default async function VerifyPage({ searchParams, params }: Props) {
  const { token } = await searchParams
  const { countryCode } = await params

  return <VerifyClient token={token} countryCode={countryCode} />
}
