"use server"

import { sdk } from "@lib/config"
import medusaError from "@lib/util/medusa-error"
import { HttpTypes } from "@medusajs/types"
import { revalidateTag } from "next/cache"
import { redirect } from "next/navigation"
import {
  getAuthHeaders,
  getCacheOptions,
  getCacheTag,
  getCartId,
  removeCartId,
  setCartId,
} from "./cookies"
import { getRegion } from "./regions"

/**
 * Retrieves a cart by its ID. If no ID is provided, it will use the cart ID from the cookies.
 * @param cartId - optional - The ID of the cart to retrieve.
 * @returns The cart object if found, or null if not found.
 */
export async function retrieveCart(cartId?: string, fields?: string) {
  const id = cartId || (await getCartId())
  fields ??=
    "*items, *region, *items.product, *items.variant, *items.thumbnail, *items.metadata, +items.total, *promotions, +shipping_methods.name"

  if (!id) {
    return null
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  const next = {
    ...(await getCacheOptions("carts")),
  }

  return await sdk.client
    .fetch<HttpTypes.StoreCartResponse>(`/store/carts/${id}`, {
      method: "GET",
      query: {
        fields,
      },
      headers,
      next,
      cache: "force-cache",
    })
    .then(({ cart }: { cart: HttpTypes.StoreCart }) => cart)
    .catch(() => null)
}

export async function getOrSetCart(countryCode: string) {
  const region = await getRegion(countryCode)

  if (!region) {
    throw new Error(`Region not found for country code: ${countryCode}`)
  }

  let cart = await retrieveCart(undefined, "id,region_id")

  const headers = {
    ...(await getAuthHeaders()),
  }

  if (!cart) {
    const cartResp = await sdk.store.cart.create(
      { region_id: region.id },
      {},
      headers
    )
    cart = cartResp.cart

    await setCartId(cart.id)

    const cartCacheTag = await getCacheTag("carts")
    revalidateTag(cartCacheTag)
  }

  if (cart && cart?.region_id !== region.id) {
    await sdk.store.cart.update(cart.id, { region_id: region.id }, {}, headers)
    const cartCacheTag = await getCacheTag("carts")
    revalidateTag(cartCacheTag)
  }

  return cart
}

export async function updateCart(data: HttpTypes.StoreUpdateCart) {
  const cartId = await getCartId()

  if (!cartId) {
    throw new Error("No existing cart found, please create one before updating")
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  return sdk.store.cart
    .update(cartId, data, {}, headers)
    .then(async ({ cart }: { cart: HttpTypes.StoreCart }) => {
      const cartCacheTag = await getCacheTag("carts")
      revalidateTag(cartCacheTag)

      const fulfillmentCacheTag = await getCacheTag("fulfillment")
      revalidateTag(fulfillmentCacheTag)

      return cart
    })
    .catch(medusaError)
}

export async function addToCart({
  variantId,
  quantity,
  countryCode,
}: {
  variantId: string
  quantity: number
  countryCode: string
}) {
  if (!variantId) {
    throw new Error("Missing variant ID when adding to cart")
  }

  const cart = await getOrSetCart(countryCode)

  if (!cart) {
    throw new Error("Error retrieving or creating cart")
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  await sdk.store.cart
    .createLineItem(
      cart.id,
      {
        variant_id: variantId,
        quantity,
      },
      {},
      headers
    )
    .then(async () => {
      const cartCacheTag = await getCacheTag("carts")
      revalidateTag(cartCacheTag)

      const fulfillmentCacheTag = await getCacheTag("fulfillment")
      revalidateTag(fulfillmentCacheTag)
    })
    .catch(medusaError)
}

export async function updateLineItem({
  lineId,
  quantity,
}: {
  lineId: string
  quantity: number
}) {
  if (!lineId) {
    throw new Error("Missing lineItem ID when updating line item")
  }

  const cartId = await getCartId()

  if (!cartId) {
    throw new Error("Missing cart ID when updating line item")
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  await sdk.store.cart
    .updateLineItem(cartId, lineId, { quantity }, {}, headers)
    .then(async () => {
      const cartCacheTag = await getCacheTag("carts")
      revalidateTag(cartCacheTag)

      const fulfillmentCacheTag = await getCacheTag("fulfillment")
      revalidateTag(fulfillmentCacheTag)
    })
    .catch(medusaError)
}

export async function deleteLineItem(lineId: string) {
  if (!lineId) {
    throw new Error("Missing lineItem ID when deleting line item")
  }

  const cartId = await getCartId()

  if (!cartId) {
    throw new Error("Missing cart ID when deleting line item")
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  await sdk.store.cart
    .deleteLineItem(cartId, lineId, {}, headers)
    .then(async () => {
      const cartCacheTag = await getCacheTag("carts")
      revalidateTag(cartCacheTag)

      const fulfillmentCacheTag = await getCacheTag("fulfillment")
      revalidateTag(fulfillmentCacheTag)
    })
    .catch(medusaError)
}

export async function setShippingMethod({
  cartId,
  shippingMethodId,
}: {
  cartId: string
  shippingMethodId: string
}) {
  const headers = {
    ...(await getAuthHeaders()),
  }

  return sdk.store.cart
    .addShippingMethod(cartId, { option_id: shippingMethodId }, {}, headers)
    .then(async () => {
      const cartCacheTag = await getCacheTag("carts")
      revalidateTag(cartCacheTag)
    })
    .catch(medusaError)
}

export async function initiatePaymentSession(
  cart: HttpTypes.StoreCart,
  data: HttpTypes.StoreInitializePaymentSession
) {
  const headers = {
    ...(await getAuthHeaders()),
  }

  return sdk.store.payment
    .initiatePaymentSession(cart, data, {}, headers)
    .then(async (resp) => {
      const cartCacheTag = await getCacheTag("carts")
      revalidateTag(cartCacheTag)
      return resp
    })
    .catch(medusaError)
}

async function _applyPromotions(codes: string[]) {
  const cartId = await getCartId()
  console.log("cartId", cartId)

  if (!cartId) {
    throw new Error("No existing cart found")
  }

  // Validate: only one promotion code can be applied at a time
  if (codes.length > 1) {
    throw new Error("Only one discount code can be applied at a time.")
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  // Get current cart to check existing promotions and cart total
  // Use standard fields first, then try to get totals if needed
  let currentCart = await retrieveCart(cartId)

  if (!currentCart) {
    throw new Error("No existing cart found")
  }

  // If we need totals, try to fetch them separately
  // First check if we have the data we need from the standard cart
  const needsTotals =
    codes[0]?.toUpperCase() === "XMAS30" || codes[0]?.toUpperCase() === "XMAS50"

  if (needsTotals) {
    // Try to get cart with totals - specifically request item_subtotal (without shipping)
    try {
      const cartWithTotals = await sdk.client
        .fetch<HttpTypes.StoreCartResponse>(`/store/carts/${cartId}`, {
          method: "GET",
          query: {
            fields:
              "*items, *items.total, *promotions, item_subtotal, currency_code",
          },
          headers: {
            ...(await getAuthHeaders()),
          },
          cache: "no-store",
        })
        .then(({ cart }: { cart: HttpTypes.StoreCart }) => cart)
        .catch(() => null)

      if (cartWithTotals) {
        currentCart = cartWithTotals
      }
    } catch (error) {
      // If fetching with totals fails, continue with the standard cart
      console.warn("Failed to fetch cart totals, using standard cart:", error)
    }
  }

  // If codes array is empty, this is a removal operation - skip all validations
  if (codes.length === 0) {
    // Just update the cart with empty promo codes
    const response = await sdk.store.cart
      .update(cartId, { promo_codes: [] }, {}, headers)
      .catch((err) => {
        return medusaError(err)
      })

    if (response?.cart) {
      const cartCacheTag = await getCacheTag("carts")
      revalidateTag(cartCacheTag)

      const fulfillmentCacheTag = await getCacheTag("fulfillment")
      revalidateTag(fulfillmentCacheTag)
    }

    return
  }

  // Check if there's already a promotion applied (only when adding a new code)
  const existingPromotions = currentCart.promotions || []
  const existingCodes = existingPromotions
    .map((p) => p.code)
    .filter((code): code is string => !!code)
  const newCode = codes[0]

  // If trying to apply a different code when one is already applied
  if (existingCodes.length > 0 && !existingCodes.includes(newCode)) {
    throw new Error(
      `A discount code "${existingCodes[0]}" is already applied. Please remove it before applying a new code.`
    )
  }

  // Check minimum cart amount requirements (only for new codes, not if already applied)
  const codeToApply = codes[0]?.toUpperCase()
  const isNewCode = !existingCodes.includes(newCode)

  // Get item_subtotal (subtotal without shipping and taxes)
  // This is what's shown as "Subtotal (excl. shipping and taxes)" in the UI
  // Medusa returns amounts in the smallest currency unit (cents for USD)
  let cartSubtotalAmount = 0

  // Try to get item_subtotal first (this is the subtotal without shipping)
  if (
    (currentCart as any).item_subtotal !== undefined &&
    (currentCart as any).item_subtotal !== null
  ) {
    cartSubtotalAmount = (currentCart as any).item_subtotal
  } else if (currentCart.items && currentCart.items.length > 0) {
    // Calculate from items - sum up all item totals
    // Items totals are also in cents
    cartSubtotalAmount = currentCart.items.reduce((sum, item) => {
      const itemTotal = (item as any).total || 0
      return sum + itemTotal
    }, 0)
  }

  // Convert from cents to dollars for comparison
  // Medusa always returns amounts in the smallest currency unit

  // Only check minimum amount for new codes (not if code is already applied)
  if (isNewCode) {
    if (codeToApply === "XMAS30") {
      if (cartSubtotalAmount < 230) {
        throw new Error(
          `Minimum order amount of $230 is required to use code XMAS30. Your current subtotal is $${cartSubtotalAmount.toFixed(
            2
          )}.`
        )
      }
    } else if (codeToApply === "XMAS50") {
      if (cartSubtotalAmount < 350) {
        throw new Error(
          `Minimum order amount of $350 is required to use code XMAS50. Your current subtotal is $${cartSubtotalAmount.toFixed(
            2
          )}.`
        )
      }
    }
  }

  try {
    const response = await sdk.store.cart.update(
      cartId,
      { promo_codes: codes },
      {},
      headers
    )

    if (!response || !response.cart) {
      return
    }

    const cart = response.cart

    const codeApplied = cart.promotions?.some(
      (promo) => promo.code && codes.includes(promo.code)
    )
    if (!codeApplied && codes.length > 0) {
      throw new Error(
        "Discount code is invalid, expired, or limitations apply."
      )
    }
    const cartCacheTag = await getCacheTag("carts")
    revalidateTag(cartCacheTag)

    const fulfillmentCacheTag = await getCacheTag("fulfillment")
    revalidateTag(fulfillmentCacheTag)
  } catch (err: any) {
    // Check error message in different places where Medusa might return it
    const errorString = err.toString().toLowerCase()
    const errorMessage = err.message ? String(err.message).toLowerCase() : ""

    // Medusa errors often come in error.response.data.message
    const responseMessage = err.response?.data?.message
      ? String(err.response.data.message).toLowerCase()
      : ""

    // Also check the entire response data as string
    const responseDataString = err.response?.data
      ? JSON.stringify(err.response.data).toLowerCase()
      : ""

    // Check if error is related to customer_id requirement
    if (
      errorString.includes("customer_id") ||
      errorMessage.includes("customer_id") ||
      responseMessage.includes("customer_id") ||
      responseDataString.includes("customer_id")
    ) {
      throw new Error(
        "Please log in or create an account to use this discount code."
      )
    }

    // medusaError always throws, so we don't need to return it
    medusaError(err)
  }
}

export async function applyGiftCard(code: string) {
  //   const cartId = getCartId()
  //   if (!cartId) return "No cartId cookie found"
  //   try {
  //     await updateCart(cartId, { gift_cards: [{ code }] }).then(() => {
  //       revalidateTag("cart")
  //     })
  //   } catch (error: any) {
  //     throw error
  //   }
}

export async function removeDiscount(code: string) {
  // const cartId = getCartId()
  // if (!cartId) return "No cartId cookie found"
  // try {
  //   await deleteDiscount(cartId, code)
  //   revalidateTag("cart")
  // } catch (error: any) {
  //   throw error
  // }
}

export async function removeGiftCard(
  codeToRemove: string,
  giftCards: any[]
  // giftCards: GiftCard[]
) {
  //   const cartId = getCartId()
  //   if (!cartId) return "No cartId cookie found"
  //   try {
  //     await updateCart(cartId, {
  //       gift_cards: [...giftCards]
  //         .filter((gc) => gc.code !== codeToRemove)
  //         .map((gc) => ({ code: gc.code })),
  //     }).then(() => {
  //       revalidateTag("cart")
  //     })
  //   } catch (error: any) {
  //     throw error
  //   }
}

// Wrapper function that catches errors and returns them as strings
// This is needed because Next.js hides thrown errors in production Server Components
export async function applyPromotions(codes: string[]): Promise<string | void> {
  try {
    await _applyPromotions(codes)
  } catch (e: any) {
    // Return error message instead of throwing
    // This allows the error to be properly displayed in production
    return e.message || "An error occurred while applying the promotion code"
  }
}

export async function submitPromotionForm(
  currentState: unknown,
  formData: FormData
) {
  const code = formData.get("code") as string
  return await applyPromotions([code])
}

// TODO: Pass a POJO instead of a form entity here
export async function setAddresses(currentState: unknown, formData: FormData) {
  try {
    if (!formData) {
      throw new Error("No form data found when setting addresses")
    }
    const cartId = getCartId()
    if (!cartId) {
      throw new Error("No existing cart found when setting addresses")
    }

    const data = {
      shipping_address: {
        first_name: formData.get("shipping_address.first_name"),
        last_name: formData.get("shipping_address.last_name"),
        address_1: formData.get("shipping_address.address_1"),
        address_2: "",
        company: formData.get("shipping_address.company"),
        postal_code: formData.get("shipping_address.postal_code"),
        city: formData.get("shipping_address.city"),
        country_code: formData.get("shipping_address.country_code"),
        province: formData.get("shipping_address.province"),
        phone: formData.get("shipping_address.phone"),
      },
      email: formData.get("email"),
    } as any

    const sameAsBilling = formData.get("same_as_billing")
    if (sameAsBilling === "on") data.billing_address = data.shipping_address

    if (sameAsBilling !== "on")
      data.billing_address = {
        first_name: formData.get("billing_address.first_name"),
        last_name: formData.get("billing_address.last_name"),
        address_1: formData.get("billing_address.address_1"),
        address_2: "",
        company: formData.get("billing_address.company"),
        postal_code: formData.get("billing_address.postal_code"),
        city: formData.get("billing_address.city"),
        country_code: formData.get("billing_address.country_code"),
        province: formData.get("billing_address.province"),
        phone: formData.get("billing_address.phone"),
      }
    await updateCart(data)
  } catch (e: any) {
    return e.message
  }

  redirect(
    `/${formData.get("shipping_address.country_code")}/checkout?step=delivery`
  )
}

/**
 * Places an order for a cart. If no cart ID is provided, it will use the cart ID from the cookies.
 * @param cartId - optional - The ID of the cart to place an order for.
 * @returns The cart object if the order was successful, or null if not.
 */
export async function placeOrder(cartId?: string) {
  const id = cartId || (await getCartId())

  if (!id) {
    throw new Error("No existing cart found when placing an order")
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  const cartRes = await sdk.store.cart
    .complete(id, {}, headers)
    .then(async (cartRes) => {
      const cartCacheTag = await getCacheTag("carts")
      revalidateTag(cartCacheTag)
      return cartRes
    })
    .catch(medusaError)

  if (cartRes?.type === "order") {
    const countryCode =
      cartRes.order.shipping_address?.country_code?.toLowerCase()

    const orderCacheTag = await getCacheTag("orders")
    revalidateTag(orderCacheTag)

    removeCartId()
    redirect(`/${countryCode}/order/${cartRes?.order.id}/confirmed`)
  }

  return cartRes.cart
}

/**
 * Updates the countrycode param and revalidates the regions cache
 * @param regionId
 * @param countryCode
 */
export async function updateRegion(countryCode: string, currentPath: string) {
  const cartId = await getCartId()
  const region = await getRegion(countryCode)

  if (!region) {
    throw new Error(`Region not found for country code: ${countryCode}`)
  }

  if (cartId) {
    await updateCart({ region_id: region.id })
    const cartCacheTag = await getCacheTag("carts")
    revalidateTag(cartCacheTag)
  }

  const regionCacheTag = await getCacheTag("regions")
  revalidateTag(regionCacheTag)

  const productsCacheTag = await getCacheTag("products")
  revalidateTag(productsCacheTag)

  redirect(`/${countryCode}${currentPath}`)
}

export async function listCartOptions() {
  const cartId = await getCartId()
  const headers = {
    ...(await getAuthHeaders()),
  }
  const next = {
    ...(await getCacheOptions("shippingOptions")),
  }

  return await sdk.client.fetch<{
    shipping_options: HttpTypes.StoreCartShippingOption[]
  }>("/store/shipping-options", {
    query: { cart_id: cartId },
    next,
    headers,
    cache: "force-cache",
  })
}
