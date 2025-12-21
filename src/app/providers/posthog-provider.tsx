"use client"

import posthog from "posthog-js"
import { PostHogProvider as PHProvider } from "posthog-js/react"
import { usePathname, useSearchParams } from "next/navigation"
import { useEffect, Suspense } from "react"

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (typeof window !== "undefined") {
      const phKey = process.env.NEXT_PUBLIC_POSTHOG_KEY

      if (!phKey) {
        console.warn(
          "PostHog key is not set. Please add NEXT_PUBLIC_POSTHOG_KEY to your environment variables."
        )
        return
      }

      if (!(posthog as any).__loaded) {
        const posthogHost =
          process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://eu.i.posthog.com"

        const isEU = posthogHost.includes("eu.i.posthog.com")
        const uiHost = isEU
          ? "https://eu.posthog.com"
          : "https://us.posthog.com"

        posthog.init(phKey, {
          api_host: "/ingest",
          ui_host: uiHost,
          person_profiles: "identified_only",
          capture_pageview: false,
          loaded: (ph) => {
            if (process.env.NODE_ENV === "development" && ph) {
              ph.debug()
            }
            console.log("PostHog initialized successfully", {
              api_host: "/ingest",
              ui_host: uiHost,
              key: phKey.substring(0, 10) + "...",
            })
          },
        })
      } else {
        console.log("PostHog already initialized")
      }
    }
  }, [])

  return (
    <PHProvider client={posthog}>
      <Suspense fallback={null}>
        <PostHogPageView />
      </Suspense>
      {children}
    </PHProvider>
  )
}

function PostHogPageView() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (typeof window !== "undefined" && pathname) {
      const timer = setTimeout(() => {
        let url = window.location.origin + pathname
        if (searchParams && searchParams.toString()) {
          url = url + `?${searchParams.toString()}`
        }

        if ((posthog as any).__loaded) {
          posthog.capture("$pageview", {
            $current_url: url,
          })
          if (process.env.NODE_ENV === "development") {
            console.log("PostHog pageview captured:", url)
          }
        } else {
          if (process.env.NODE_ENV === "development") {
            console.warn("PostHog not loaded yet, retrying...")
          }
          setTimeout(() => {
            if ((posthog as any).__loaded) {
              posthog.capture("$pageview", {
                $current_url: url,
              })
            }
          }, 500)
        }
      }, 100)

      return () => clearTimeout(timer)
    }
  }, [pathname, searchParams])

  return null
}
