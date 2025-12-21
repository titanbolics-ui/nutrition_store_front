import posthog from "posthog-js"

/**
 * Tracking checkout events for PostHog
 */

export function trackCheckoutStarted(cartId: string) {
  if (typeof window !== "undefined" && (posthog as any).__loaded) {
    posthog.capture("checkout_started", {
      cart_id: cartId,
    })
  }
}

export function trackCheckoutStepCompleted(
  step: "address" | "shipping" | "payment" | "review",
  cartId: string,
  additionalData?: Record<string, any>
) {
  if (typeof window !== "undefined" && (posthog as any).__loaded) {
    posthog.capture("checkout_step_completed", {
      step,
      cart_id: cartId,
      ...additionalData,
    })
  }
}

export function trackCheckoutEmailEntered(
  cartId: string,
  email: string,
  isGuest: boolean
) {
  if (typeof window !== "undefined" && (posthog as any).__loaded) {
    posthog.capture("checkout_email_entered", {
      cart_id: cartId,
      email: email, // PostHog automatically handles email for identify
      is_guest: isGuest,
    })
  }
}

export function trackShippingMethodSelected(
  cartId: string,
  shippingMethodId: string,
  shippingMethodName: string,
  amount: number,
  currencyCode: string
) {
  if (typeof window !== "undefined" && (posthog as any).__loaded) {
    posthog.capture("checkout_shipping_selected", {
      cart_id: cartId,
      shipping_method_id: shippingMethodId,
      shipping_method_name: shippingMethodName,
      shipping_amount: amount,
      currency: currencyCode,
    })
  }
}

export function trackPaymentMethodSelected(
  cartId: string,
  paymentMethodId: string,
  paymentMethodName: string
) {
  if (typeof window !== "undefined" && (posthog as any).__loaded) {
    posthog.capture("checkout_payment_selected", {
      cart_id: cartId,
      payment_method_id: paymentMethodId,
      payment_method_name: paymentMethodName,
    })
  }
}

export function trackOrderPlaced(
  orderId: string,
  cartId: string,
  total: number,
  currencyCode: string,
  paymentMethod: string
) {
  if (typeof window !== "undefined" && (posthog as any).__loaded) {
    posthog.capture("order_placed", {
      order_id: orderId,
      cart_id: cartId,
      total,
      currency: currencyCode,
      payment_method: paymentMethod,
    })
  }
}

export function trackCheckoutAbandoned(cartId: string, step: string) {
  if (typeof window !== "undefined" && (posthog as any).__loaded) {
    posthog.capture("checkout_abandoned", {
      cart_id: cartId,
      abandoned_at_step: step,
    })
  }
}
