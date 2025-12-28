import { HttpTypes } from "@medusajs/types"
import { NextRequest, NextResponse } from "next/server"

const BACKEND_URL = process.env.MEDUSA_BACKEND_URL
const PUBLISHABLE_API_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
const DEFAULT_REGION = process.env.NEXT_PUBLIC_DEFAULT_REGION || "us"

// PostHog configuration
const POSTHOG_HOST =
  process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com"
const isEU = POSTHOG_HOST.includes("eu.i.posthog.com")
const POSTHOG_ASSETS_HOST = isEU
  ? "https://eu-assets.i.posthog.com"
  : "https://us-assets.i.posthog.com"
const POSTHOG_API_HOST = isEU
  ? "https://eu.i.posthog.com"
  : "https://us.i.posthog.com"

const regionMapCache = {
  regionMap: new Map<string, HttpTypes.StoreRegion>(),
  regionMapUpdated: Date.now(),
}

async function getRegionMap(cacheId: string) {
  const { regionMap, regionMapUpdated } = regionMapCache

  if (!BACKEND_URL) {
    throw new Error(
      "Proxy.ts: Error fetching regions. Did you set up regions in your Admin and define a MEDUSA_BACKEND_URL environment variable? Note that the variable is no longer named NEXT_PUBLIC_MEDUSA_BACKEND_URL."
    )
  }

  if (
    !regionMap.keys().next().value ||
    regionMapUpdated < Date.now() - 3600 * 1000
  ) {
    // Fetch regions from backend. We can't use the JS client here because proxy is running on Edge and the client needs a Node environment.
    let regions: HttpTypes.StoreRegion[] | undefined

    try {
      const res = await fetch(`${BACKEND_URL}/store/regions`, {
        headers: {
          "x-publishable-api-key": PUBLISHABLE_API_KEY ?? "",
        },
        cache: "no-store", // Edge runtime doesn't support next.revalidate or next.tags
      })

      const json = await res.json()

      if (!res.ok) {
        throw new Error(json?.message || "Failed fetching regions from backend")
      }

      regions = json.regions ?? json?.data ?? json
    } catch (err) {
      // Network errors can happen in the Edge/proxy runtime (for example when
      // the backend is unreachable in local dev). Instead of crashing the
      // proxy, fall back to a minimal region mapping using the
      // DEFAULT_REGION so the site can still render.
      if (process.env.NODE_ENV === "development") {
        // eslint-disable-next-line no-console
        console.warn(
          "proxy: failed to fetch regions, falling back to DEFAULT_REGION",
          err
        )
      }

      regions = [
        {
          id: "local-default",
          name: DEFAULT_REGION,
          countries: [{ iso_2: DEFAULT_REGION }],
          currency_code: "USD",
        } as unknown as HttpTypes.StoreRegion,
      ]
    }

    if (!regions?.length) {
      throw new Error("No regions found. Please set up regions in your Admin.")
    }

    // Create a map of country codes to regions.
    regions.forEach((region: HttpTypes.StoreRegion) => {
      region.countries?.forEach((c) => {
        regionMapCache.regionMap.set(c.iso_2 ?? "", region)
      })
    })

    regionMapCache.regionMapUpdated = Date.now()
  }

  return regionMapCache.regionMap
}

/**
 * Fetches regions from backend and sets the region cookie.
 * @param request
 * @param response
 */
async function getCountryCode(
  request: NextRequest,
  regionMap: Map<string, HttpTypes.StoreRegion | number>
) {
  try {
    let countryCode

    const vercelCountryCode = request.headers
      .get("x-vercel-ip-country")
      ?.toLowerCase()

    const urlCountryCode = request.nextUrl.pathname.split("/")[1]?.toLowerCase()

    if (urlCountryCode && regionMap.has(urlCountryCode)) {
      countryCode = urlCountryCode
    } else if (vercelCountryCode && regionMap.has(vercelCountryCode)) {
      countryCode = vercelCountryCode
    } else if (regionMap.has(DEFAULT_REGION)) {
      countryCode = DEFAULT_REGION
    } else if (regionMap.keys().next().value) {
      countryCode = regionMap.keys().next().value
    }

    return countryCode
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error(
        "Proxy.ts: Error getting the country code. Did you set up regions in your Admin and define a MEDUSA_BACKEND_URL environment variable? Note that the variable is no longer named NEXT_PUBLIC_MEDUSA_BACKEND_URL."
      )
    }
  }
}

/**
 * Fetches from PostHog and proxies the response preserving compression
 */
async function fetchAndProxy(
  targetUrl: string,
  request: NextRequest
): Promise<NextResponse> {
  const targetHost = new URL(targetUrl).hostname

  // Prepare headers for forwarding
  const headers = new Headers()

  request.headers.forEach((value, key) => {
    const lowerKey = key.toLowerCase()
    // Skip host-related headers that need to be set for PostHog
    if (
      lowerKey !== "host" &&
      lowerKey !== "connection" &&
      lowerKey !== "x-forwarded-host" &&
      lowerKey !== "x-forwarded-proto"
    ) {
      headers.set(key, value)
    }
  })

  // Set Host header to PostHog's domain
  headers.set("Host", targetHost)

  // Set up timeout for Edge runtime (max 30s, use 25s to be safe)
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 25000)

  try {
    const fetchOptions: RequestInit = {
      method: request.method,
      headers: headers,
      signal: controller.signal,
    }

    if (request.method !== "GET" && request.method !== "HEAD") {
      fetchOptions.body = request.body
      // @ts-ignore - duplex is required for streaming body
      fetchOptions.duplex = "half"
    }

    const response = await fetch(targetUrl, fetchOptions)
    clearTimeout(timeoutId)

    if (!response.body) {
      return NextResponse.json({ error: "No response body" }, { status: 500 })
    }

    // Copy response headers, excluding content-encoding and content-length
    // to let the browser handle decompression
    const responseHeaders = new Headers()
    response.headers.forEach((value, key) => {
      const lowerKey = key.toLowerCase()
      if (lowerKey !== "content-encoding" && lowerKey !== "content-length") {
        responseHeaders.set(key, value)
      }
    })

    // Add CORS headers
    responseHeaders.set("Access-Control-Allow-Origin", "*")
    responseHeaders.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
    responseHeaders.set("Access-Control-Allow-Headers", "*")

    return new NextResponse(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    })
  } catch (error: any) {
    clearTimeout(timeoutId)

    if (error.name === "AbortError") {
      return NextResponse.json({ error: "Request timeout" }, { status: 504 })
    }

    return NextResponse.json(
      { error: "Proxy error", details: error.message },
      { status: 502 }
    )
  }
}

/**
 * Proxies PostHog requests to PostHog servers
 */
async function proxyPostHog(
  request: NextRequest
): Promise<NextResponse | null> {
  const pathname = request.nextUrl.pathname

  // Handle CORS preflight requests
  if (request.method === "OPTIONS" && pathname.startsWith("/ph/")) {
    return new NextResponse(null, {
      status: 200,
      headers: {
        "access-control-allow-origin": "*",
        "access-control-allow-methods": "GET, POST, OPTIONS",
        "access-control-allow-headers": "Content-Type",
        "access-control-max-age": "86400",
      },
    })
  }

  // Handle PostHog static assets
  if (pathname.startsWith("/ph/static/")) {
    const path = pathname.replace("/ph/", "")
    const url = `${POSTHOG_ASSETS_HOST}/${path}${request.nextUrl.search}`
    return await fetchAndProxy(url, request)
  }

  // Handle PostHog array configs
  if (pathname.startsWith("/ph/array/")) {
    const path = pathname.replace("/ph/", "")
    const url = `${POSTHOG_ASSETS_HOST}/${path}${request.nextUrl.search}`
    return await fetchAndProxy(url, request)
  }

  // Handle PostHog API requests
  if (pathname.startsWith("/ph/")) {
    const path = pathname.replace("/ph/", "")
    const url = `${POSTHOG_API_HOST}/${path}${request.nextUrl.search}`
    return await fetchAndProxy(url, request)
  }

  return null
}

/**
 * Proxy to handle region selection and PostHog reverse proxy.
 * PostHog requests are proxied to PostHog servers to bypass ad blockers.
 */
export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Handle PostHog proxy requests first
  const posthogResponse = await proxyPostHog(request)
  if (posthogResponse) {
    return posthogResponse
  }

  // Skip API routes and static assets for region handling
  if (
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/") ||
    pathname.includes(".")
  ) {
    return NextResponse.next()
  }

  // Handle OPTIONS requests for non-PostHog routes (CORS preflight)
  if (request.method === "OPTIONS") {
    return new NextResponse(null, {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "*",
      },
    })
  }

  let redirectUrl = request.nextUrl.href
  let response = NextResponse.redirect(redirectUrl, 307)

  let cacheIdCookie = request.cookies.get("_medusa_cache_id")
  let cacheId = cacheIdCookie?.value || crypto.randomUUID()

  const regionMap = await getRegionMap(cacheId)
  const countryCode = regionMap && (await getCountryCode(request, regionMap))

  const urlHasCountryCode =
    countryCode && request.nextUrl.pathname.split("/")[1]?.includes(countryCode)

  // if one of the country codes is in the url and the cache id is set, return next
  if (urlHasCountryCode && cacheIdCookie) {
    return NextResponse.next()
  }

  // if one of the country codes is in the url and the cache id is not set, set the cache id and redirect
  if (urlHasCountryCode && !cacheIdCookie) {
    response.cookies.set("_medusa_cache_id", cacheId, {
      maxAge: 60 * 60 * 24,
    })

    return response
  }

  const redirectPath =
    request.nextUrl.pathname === "/" ? "" : request.nextUrl.pathname

  const queryString = request.nextUrl.search ? request.nextUrl.search : ""

  // If no country code is set, we redirect to the relevant region.
  if (!urlHasCountryCode && countryCode) {
    redirectUrl = `${request.nextUrl.origin}/${countryCode}${redirectPath}${queryString}`
    response = NextResponse.redirect(`${redirectUrl}`, 307)
  } else if (!urlHasCountryCode && !countryCode) {
    // Handle case where no valid country code exists (empty regions)
    return new NextResponse(
      "No valid regions configured. Please set up regions with countries in your Admin.",
      { status: 500 }
    )
  }

  return response
}

export const config = {
  matcher: [
    // Match all routes except static files and Next.js internals
    "/((?!_next/static|_next/image|favicon.ico|images|assets|png|svg|jpg|jpeg|gif|webp).*)",
    // Explicitly include PostHog proxy routes
    "/ph/:path*",
  ],
}
