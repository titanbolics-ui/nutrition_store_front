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
  let body: string | ArrayBuffer | undefined
  const contentType = request.headers.get("content-type")

  if (request.method === "POST" || request.method === "PUT") {
    try {
      // Read body as array buffer to preserve exact format (including base64)
      const bodyBuffer = await request.arrayBuffer()
      if (bodyBuffer.byteLength > 0) {
        // Convert to string for text-based content, or keep as buffer
        if (
          contentType?.includes("application/json") ||
          contentType?.includes("text")
        ) {
          body = new TextDecoder().decode(bodyBuffer)
        } else {
          // For binary or other formats, use the buffer directly
          body = bodyBuffer
        }
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
    console.log("PostHog proxy:", {
      method: request.method,
      targetUrl,
      searchParams: searchParams.toString(),
      hasBody: !!body,
      bodyLength:
        typeof body === "string" ? body.length : body ? body.byteLength : 0,
      contentType: headers.get("content-type"),
      pathname,
      ingestPath,
    })

    // Forward the request to PostHog
    const fetchOptions: RequestInit = {
      method: request.method,
      headers: headers,
    }

    // Add body only if it exists
    if (body !== undefined) {
      if (typeof body === "string") {
        fetchOptions.body = body
      } else {
        fetchOptions.body = body
      }
    }

    const response = await fetch(targetUrl, fetchOptions)

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
