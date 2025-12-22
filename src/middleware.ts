import { HttpTypes } from "@medusajs/types"
import { NextRequest, NextResponse } from "next/server"

const BACKEND_URL = process.env.MEDUSA_BACKEND_URL
const PUBLISHABLE_API_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
const DEFAULT_REGION = process.env.NEXT_PUBLIC_DEFAULT_REGION || "us"

const regionMapCache = {
  regionMap: new Map<string, HttpTypes.StoreRegion>(),
  regionMapUpdated: Date.now(),
}

async function getRegionMap(cacheId: string) {
  const { regionMap, regionMapUpdated } = regionMapCache

  if (!BACKEND_URL) {
    throw new Error(
      "Middleware.ts: Error fetching regions. Did you set up regions in your Admin and define a MEDUSA_BACKEND_URL environment variable? Note that the variable is no longer named NEXT_PUBLIC_MEDUSA_BACKEND_URL."
    )
  }

  if (
    !regionMap.keys().next().value ||
    regionMapUpdated < Date.now() - 3600 * 1000
  ) {
    // Fetch regions from backend. We can't use the JS client here because middleware is running on Edge and the client needs a Node environment.
    let regions: HttpTypes.StoreRegion[] | undefined

    try {
      const res = await fetch(`${BACKEND_URL}/store/regions`, {
        headers: {
          "x-publishable-api-key": PUBLISHABLE_API_KEY ?? "",
        },
        next: {
          revalidate: 0, // Disable caching for this request TODO: adjust as needed
          tags: [`regions-${cacheId}`],
        },
        // cache: "force-cache",
        cache: "no-store",
      })

      const json = await res.json()

      if (!res.ok) {
        throw new Error(json?.message || "Failed fetching regions from backend")
      }

      regions = json.regions ?? json?.data ?? json
    } catch (err) {
      // Network errors can happen in the Edge/middleware runtime (for example when
      // the backend is unreachable in local dev). Instead of crashing the
      // middleware, fall back to a minimal region mapping using the
      // DEFAULT_REGION so the site can still render.
      if (process.env.NODE_ENV === "development") {
        // eslint-disable-next-line no-console
        console.warn(
          "middleware: failed to fetch regions, falling back to DEFAULT_REGION",
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
        "Middleware.ts: Error getting the country code. Did you set up regions in your Admin and define a MEDUSA_BACKEND_URL environment variable? Note that the variable is no longer named NEXT_PUBLIC_MEDUSA_BACKEND_URL."
      )
    }
  }
}

/**
 * Middleware to handle region selection and onboarding status.
 */
/**
 * Proxy PostHog requests using NextResponse.rewrite
 * This is needed because rewrites don't properly forward POST body on Vercel
 */
async function proxyPostHogRequest(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  const searchParams = request.nextUrl.search

  // Determine PostHog hosts
  const posthogHost =
    process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com"
  const isEU = posthogHost.includes("eu.i.posthog.com")
  const posthogAssetsHost = isEU
    ? "https://eu-assets.i.posthog.com"
    : "https://us-assets.i.posthog.com"

  // Extract the path after /ingest
  let ingestPath = pathname
  if (pathname.startsWith("/ingest/")) {
    ingestPath = pathname.replace("/ingest/", "")
  } else {
    // Handle /countryCode/ingest/...
    const match = pathname.match(/^\/[^/]+\/ingest\/(.+)$/)
    if (match) {
      ingestPath = match[1]
    } else {
      ingestPath = pathname.replace(/^.*\/ingest\//, "")
    }
  }

  // Determine target host based on path
  let targetHost = posthogHost
  if (ingestPath.startsWith("static/") || ingestPath.startsWith("array/")) {
    targetHost = posthogAssetsHost
  }

  // Build target URL using clone (as per PostHog docs)
  const url = request.nextUrl.clone()
  const hostname =
    ingestPath.startsWith("static/") || ingestPath.startsWith("array/")
      ? posthogAssetsHost.replace("https://", "")
      : posthogHost.replace("https://", "")

  url.protocol = "https"
  url.hostname = hostname
  url.port = "443"

  // Remove /ingest prefix from pathname
  if (pathname.startsWith("/ingest/")) {
    url.pathname = pathname.replace("/ingest", "")
  } else {
    // Handle /countryCode/ingest/...
    url.pathname = pathname.replace(/^\/[^/]+\/ingest/, "")
  }

  // Clone request headers and set host (as per PostHog docs)
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set("host", hostname)

  // Use NextResponse.rewrite for proxying (preserves POST body on Vercel)
  return NextResponse.rewrite(url, {
    headers: requestHeaders,
  })
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Handle PostHog proxy requests FIRST (before region handling)
  // This uses NextResponse.rewrite which properly forwards POST body on Vercel
  if (pathname.startsWith("/ingest") || pathname.match(/^\/[^/]+\/ingest/)) {
    console.log("🔵 MIDDLEWARE: Handling PostHog request", {
      pathname,
      method: request.method,
      url: request.nextUrl.href,
    })
    return proxyPostHogRequest(request)
  }

  let redirectUrl = request.nextUrl.href

  let response = NextResponse.redirect(redirectUrl, 307)

  let cacheIdCookie = request.cookies.get("_medusa_cache_id")

  let cacheId = cacheIdCookie?.value || crypto.randomUUID()

  const regionMap = await getRegionMap(cacheId)

  const countryCode = regionMap && (await getCountryCode(request, regionMap))

  const urlHasCountryCode =
    countryCode && request.nextUrl.pathname.split("/")[1].includes(countryCode)

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

  // check if the url is a static asset
  if (request.nextUrl.pathname.includes(".")) {
    return NextResponse.next()
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
    "/((?!api|_next/static|_next/image|favicon.ico|images|assets|png|svg|jpg|jpeg|gif|webp).*)",
    // Removed 'ingest' from the exclusion list!
  ],
}
