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

  console.log("🟢 API ROUTE: Handling PostHog request", {
    pathname,
    method: request.method,
    url: request.nextUrl.href,
  })

  // Extract path after /api/ingest
  const pathSegments = pathname
    .replace("/api/ingest", "")
    .split("/")
    .filter(Boolean)
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
  let body: ArrayBuffer | undefined
  const contentType = request.headers.get("content-type")

  if (request.method === "POST" || request.method === "PUT") {
    try {
      // Always read as ArrayBuffer to preserve the exact binary format
      // PostHog SDK sends data in various formats (JSON, base64, etc.)
      const bodyBuffer = await request.arrayBuffer()
      if (bodyBuffer.byteLength > 0) {
        body = bodyBuffer
      }
    } catch (e) {
      // Body might be empty or unreadable
      console.error("Error reading body:", e)
      body = undefined
    }
  }

  // Clone headers - preserve all original headers except host/referer
  const headers = new Headers()

  // Copy all headers from original request
  request.headers.forEach((value, key) => {
    // Skip headers that shouldn't be forwarded
    if (
      key.toLowerCase() !== "host" &&
      key.toLowerCase() !== "referer" &&
      key.toLowerCase() !== "x-forwarded-host" &&
      key.toLowerCase() !== "x-forwarded-proto"
    ) {
      headers.set(key, value)
    }
  })

  // Set proper origin
  headers.set("origin", targetHost)

  // Ensure content-type is preserved
  if (contentType) {
    headers.set("content-type", contentType)
  }

  try {
    // Log for debugging
    console.log("🟢 API ROUTE: Handling PostHog request", {
      method: request.method,
      targetUrl,
      searchParams: searchParams.toString(),
      hasBody: !!body,
      bodyLength: body?.byteLength || 0,
      contentType: headers.get("content-type"),
      pathname,
      ingestPath,
    })

    // Forward the request to PostHog
    const fetchOptions: RequestInit = {
      method: request.method,
      headers: headers,
      body: body, // ArrayBuffer works directly with fetch
    }

    const response = await fetch(targetUrl, fetchOptions)

    // Get response body as ArrayBuffer to preserve compression (gzip/deflate)
    // Don't decode it - let the browser handle decompression based on content-encoding header
    const responseBody = await response.arrayBuffer()

    // Clone ALL response headers to preserve compression info
    const responseHeaders = new Headers()
    
    // Copy all headers from PostHog response (including content-encoding, content-type, etc.)
    response.headers.forEach((value, key) => {
      responseHeaders.set(key, value)
    })

    // Add CORS headers
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
