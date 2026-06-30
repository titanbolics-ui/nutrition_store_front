import Medusa from "@medusajs/js-sdk"

// NEXT_PUBLIC_ vars are available on both server and client (baked into bundle).
// MEDUSA_BACKEND_URL (no prefix) is server-only — invisible to client components.
const MEDUSA_BACKEND_URL =
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL ||
  process.env.MEDUSA_BACKEND_URL ||
  "http://localhost:9000"

export const sdk = new Medusa({
  baseUrl: MEDUSA_BACKEND_URL,
  debug: process.env.NODE_ENV === "development",
  publishableKey: process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY,
})
