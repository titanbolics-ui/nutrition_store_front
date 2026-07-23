"use server"

import { sdk } from "@lib/config"
import { HttpTypes } from "@medusajs/types"
import { getCacheOptions } from "./cookies"

export type BrandType = {
  id: string
  value: string
  slug: string
}

// Not exported: "use server" files may only export async server actions.
const brandSlug = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")

/**
 * Brands are Medusa product types (Stage E). Returns every type with a
 * URL-safe slug so filters can carry `?brand=<slug>` instead of raw ids.
 */
export const listBrandTypes = async (): Promise<BrandType[]> => {
  const next = {
    ...(await getCacheOptions("product-types")),
  }

  return sdk.client
    .fetch<{ product_types: HttpTypes.StoreProductType[] }>(
      "/store/product-types",
      {
        query: {
          fields: "id,value",
          limit: 100,
        },
        next,
        cache: "force-cache",
      }
    )
    .then(({ product_types }) =>
      product_types.map((t) => ({
        id: t.id,
        value: t.value,
        slug: brandSlug(t.value),
      }))
    )
}
