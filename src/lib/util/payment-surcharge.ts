// PayPal surcharge is stored by the backend as an extra shipping method with
// no shipping option (see backend src/utils/payment-surcharge.ts). It must be
// shown as its own "PayPal fee" row — never as delivery.

export const PAYPAL_PROVIDER_ID = "pp_paypal-manual_paypal-manual"

export type SurchargeQuote = {
  provider_id: string
  percent: number
  amount: number
}

// Cart/order payloads carry the marker in data/metadata; the guest
// /orders/[token] payload carries a plain boolean.
export function isSurchargeMethod(method: any): boolean {
  return !!(
    method?.payment_surcharge === true ||
    method?.data?.payment_surcharge ||
    method?.metadata?.payment_surcharge
  )
}

export function splitShippingMethods<T>(methods: T[] | null | undefined) {
  const delivery: T[] = []
  const surcharge: T[] = []
  for (const m of methods ?? []) {
    ;(isSurchargeMethod(m) ? surcharge : delivery).push(m)
  }
  return { delivery, surcharge }
}

export function surchargeTotal(methods: any[] | null | undefined): number {
  return splitShippingMethods(methods).surcharge.reduce(
    (sum, m: any) => sum + Number(m?.total ?? m?.amount ?? 0),
    0
  )
}

export function surchargeName(methods: any[] | null | undefined): string {
  return splitShippingMethods(methods).surcharge[0]?.name ?? "PayPal fee"
}
