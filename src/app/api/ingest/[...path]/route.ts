import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  return proxyRequest(request)
}

export async function POST(request: NextRequest) {
  return proxyRequest(request)
}

export async function OPTIONS(request: NextRequest) {
  return proxyRequest(request)
}

async function proxyRequest(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  const searchParams = request.nextUrl.search

  // Extract path after /api/ingest
  const pathSegments = pathname.replace("/api/ingest", "").split("/").filter(Boolean)
  const ingestPath = pathSegments.join("/")

  // Determine PostHog hosts
  const posthogHost =
    process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com"
  const isEU = posthogHost.includes("eu.i.posthog.com")
  const posthogAssetsHost = isEU
    ? "https://eu-assets.i.posthog.com"
    : "https://us-assets.i.posthog.com"

  // Determine target host based on path
  let targetHost = posthogHost
  if (ingestPath.startsWith("static/") || ingestPath.startsWith("array/")) {
    targetHost = posthogAssetsHost
  }

  // Build target URL
  const targetUrl = `${targetHost}/${ingestPath}${searchParams || ""}`

  // Get request body for POST requests
  let body: string | undefined
  if (request.method === "POST" || request.method === "PUT") {
    try {
      body = await request.text()
    } catch (e) {
      // Body might be empty
    }
  }

  // Clone headers
  const headers = new Headers(request.headers)
  headers.delete("host")
  headers.delete("referer")
  headers.set("origin", targetHost)

  try {
    // Forward the request to PostHog
    const response = await fetch(targetUrl, {
      method: request.method,
      headers: headers,
      body: body,
    })

    // Get response body
    const responseBody = await response.text()

    // Clone response headers
    const responseHeaders = new Headers(response.headers)
    responseHeaders.set("Access-Control-Allow-Origin", "*")
    responseHeaders.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
    responseHeaders.set("Access-Control-Allow-Headers", "*")

    return new NextResponse(responseBody, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    })
  } catch (error) {
    console.error("PostHog proxy error:", error)
    return new NextResponse("Proxy error", { status: 500 })
  }
}

