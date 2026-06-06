"use server"

import { sdk } from "@lib/config"
import { revalidateTag } from "next/cache"
import { getAuthHeaders, getCacheOptions, getCacheTag } from "./cookies"

export type StoreCreditAccount = {
  id: string
  balance: number
  credits: number
  debits: number
  currency_code: string
  customer_id?: string
}

export const getStoreCreditAccounts = async (currencyCode: string): Promise<StoreCreditAccount[]> => {
  const headers = { ...(await getAuthHeaders()) }

  if (!("authorization" in headers)) return []

  try {
    const res = await sdk.client.fetch<{ store_credit_accounts: StoreCreditAccount[] }>(
      "/store/store-credit-accounts",
      {
        method: "GET",
        query: { currency_code: currencyCode },
        headers,
        cache: "no-store",
      }
    )
    return res.store_credit_accounts ?? []
  } catch (err) {
    console.error("[store-credits] getStoreCreditAccounts error:", err)
    return []
  }
}

export const applyStoreCreditsToCart = async (
  cartId: string,
  amount: number
): Promise<{ error?: string }> => {
  const headers = { ...(await getAuthHeaders()) }

  try {
    await sdk.client.fetch(
      `/store/carts/${cartId}/store-credits`,
      { method: "POST", headers, body: { amount } }
    )
    const tag = await getCacheTag("carts")
    revalidateTag(tag)
    return {}
  } catch (err: any) {
    console.error("[store-credits] apply error:", err?.message)
    return { error: err?.message ?? "Failed to apply store credits" }
  }
}

export const removeStoreCreditsFromCart = async (
  cartId: string
): Promise<{ error?: string }> => {
  const headers = { ...(await getAuthHeaders()) }

  try {
    await sdk.client.fetch(
      `/store/carts/${cartId}/store-credits`,
      { method: "DELETE", headers }
    )
    const tag = await getCacheTag("carts")
    revalidateTag(tag)
    return {}
  } catch (err: any) {
    console.error("[store-credits] remove error:", err?.message)
    return { error: err?.message ?? "Failed to remove store credits" }
  }
}
