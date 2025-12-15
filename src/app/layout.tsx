import { getBaseURL } from "@lib/util/env"
import { Metadata } from "next"
import { PostHogProvider } from "./providers"
import "styles/globals.css"

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
}

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html lang="en" data-mode="light">
      <body>
        <PostHogProvider>
          <main className="relative">{props.children}</main>
        </PostHogProvider>
      </body>
    </html>
  )
}
