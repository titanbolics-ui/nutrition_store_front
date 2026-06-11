"use server"

import { sdk } from "@lib/config"
import { setAuthToken, getCacheTag } from "./cookies"
import { revalidateTag } from "next/cache"

// POST to a public store endpoint via SDK (adds x-publishable-api-key automatically)
async function storePost<T>(path: string, body: Record<string, unknown>): Promise<T> {
  return sdk.client.fetch<T>(path, { method: "POST", body })
}

// ─── Magic-link login ────────────────────────────────────────────────────────

export async function requestMagicLink(
  email: string
): Promise<{ ok: boolean }> {
  try {
    await storePost("/store/auth/magic-link/request", { email })
  } catch {
    // Swallow — always return ok to avoid leaking account existence
  }
  return { ok: true }
}

export async function exchangeMagicLinkToken(
  token: string
): Promise<{ ok: boolean; error?: string }> {
  try {
    const { token: jwt } = await storePost<{ token: string }>(
      "/store/auth/magic-link/exchange",
      { token }
    )
    await setAuthToken(jwt)
    revalidateTag(await getCacheTag("customers"))
    return { ok: true }
  } catch (err: any) {
    const msg: string =
      err?.message?.includes("expired") || err?.message?.includes("Invalid")
        ? "This link has expired or was already used."
        : "Something went wrong. Please try again."
    return { ok: false, error: msg }
  }
}

// ─── Account activation ──────────────────────────────────────────────────────

export async function requestActivation(
  orderViewToken: string
): Promise<{ ok: boolean }> {
  try {
    await storePost("/store/customers/activate/request", {
      order_view_token: orderViewToken,
    })
  } catch {
    // Swallow
  }
  return { ok: true }
}

export async function confirmActivation(
  token: string
): Promise<{ ok: boolean; error?: string }> {
  try {
    const { token: jwt } = await storePost<{ token: string }>(
      "/store/customers/activate/confirm",
      { token }
    )
    await setAuthToken(jwt)
    revalidateTag(await getCacheTag("customers"))
    return { ok: true }
  } catch (err: any) {
    const msg: string =
      err?.message?.includes("expired") || err?.message?.includes("Invalid")
        ? "This activation link has expired or was already used."
        : "Something went wrong. Please try again."
    return { ok: false, error: msg }
  }
}

// ─── Passwordless registration ───────────────────────────────────────────────

export async function requestRegistration(opts: {
  email: string
  first_name?: string
  last_name?: string
  phone?: string
}): Promise<{ ok: boolean }> {
  try {
    await storePost("/store/customers/register/request", opts)
  } catch {
    // Swallow — same response regardless
  }
  return { ok: true }
}
