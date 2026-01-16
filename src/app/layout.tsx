import { getBaseURL } from "@lib/util/env"
import { Metadata } from "next"
import { PostHogProvider } from "./providers/posthog-provider"
import { PostHogIdentifier } from "./providers/posthog-identifier"
import NextTopLoader from "nextjs-toploader"
import "styles/globals.css"

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
  title: "Onyx Genetics",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" data-mode="dark" className="dark">
      <body className="bg-[#0a0a0a] text-[#e5e5e5] antialiased selection:bg-[#ccff00] selection:text-black">
        <NextTopLoader
          color="#ccff00"
          initialPosition={0.08}
          crawlSpeed={200}
          height={3}
          crawl={true}
          showSpinner={false}
          easing="ease"
          speed={200}
          shadow="0 0 10px #ccff00, 0 0 5px #ccff00"
        />
        <PostHogProvider>
          <PostHogIdentifier />
          <main className="relative min-h-screen">{children}</main>
        </PostHogProvider>
      </body>
    </html>
  )
}
