import { getBaseURL } from "@lib/util/env"
import { Metadata } from "next"
import { PostHogProvider } from "./providers/posthog-provider"
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
    <html lang="en" data-mode="light">
      <body>
        <PostHogProvider>
          <main className="relative">{children}</main>
        </PostHogProvider>
      </body>
    </html>
  )
}
