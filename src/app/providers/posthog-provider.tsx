"use client"

import posthog from "posthog-js"

// Redact magic-link tokens so they never reach PostHog event history.
// - /orders/<token> → /orders/[redacted]  (order_view tokens, 30-day lifetime)
// - ?token=<value>  → ?token=[redacted]   (login / activate tokens)
// Known static paths like /orders/track are left intact (min-length guard).
function sanitizeTokenUrl(url: string): string {
  try {
    const u = new URL(url)
    u.pathname = u.pathname.replace(
      /\/orders\/(?!track(?:\/|$))([^/?#]{6,})/,
      "/orders/[redacted]"
    )
    if (u.searchParams.has("token")) {
      u.searchParams.set("token", "[redacted]")
    }
    return u.toString()
  } catch {
    return url
  }
}
import { PostHogProvider as PHProvider } from "posthog-js/react"
import { usePathname, useSearchParams } from "next/navigation"
import { useEffect, Suspense } from "react"

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Trim environment variables to remove any whitespace/newlines
      const phKey = process.env.NEXT_PUBLIC_POSTHOG_KEY?.trim()

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
          ? "https://eu.i.posthog.com"
          : "https://us.i.posthog.com"

        // Use full URL for api_host to ensure proper proxy routing
        const apiHost =
          typeof window !== "undefined" ? `${window.location.origin}/ph` : "/ph"

        posthog.init(phKey, {
          api_host: apiHost,
          ui_host: uiHost,
          person_profiles: "identified_only",
          capture_pageview: false,
          disable_persistence: false,
          autocapture: true,
          loaded: (ph) => {
            if (process.env.NODE_ENV === "development" && ph) {
              ph.debug()
            }
          },
          // Strip magic-link tokens from every event before it leaves the browser.
          // order_view tokens live 30 days — anyone with PostHog access could open
          // orders if these were captured.
          before_send: (event) => {
            if (!event) return event
            if (event.properties?.$current_url) {
              event.properties.$current_url = sanitizeTokenUrl(event.properties.$current_url)
            }
            if (event.properties?.$referrer) {
              event.properties.$referrer = sanitizeTokenUrl(event.properties.$referrer)
            }
            return event
          },
        })
        ;(posthog as any).__loaded = true
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
        url = sanitizeTokenUrl(url)

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
