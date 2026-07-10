"use server"

import { sdk } from "@lib/config"
import { FetchError } from "@medusajs/js-sdk"

export type WaitlistResult =
  | { status: 200; message: string }
  | { status: 400 | 429; message: string }
  | { status: "error"; message: string }

export async function joinWaitlist(data: {
  email: string
  variant_id: string
  marketing_consent: boolean
  turnstile_token: string
}): Promise<WaitlistResult> {
  try {
    const res = await sdk.client.fetch<{ message: string }>("/store/waitlist", {
      method: "POST",
      body: data,
    })
    return { status: 200, message: res.message }
  } catch (e) {
    if (e instanceof FetchError && (e.status === 400 || e.status === 429)) {
      return { status: e.status, message: e.message }
    }
    const message =
      e instanceof Error ? e.message : "Something went wrong. Please try again."
    return { status: "error", message }
  }
}
