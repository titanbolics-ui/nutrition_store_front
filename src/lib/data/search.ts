"use server"

import { sdk } from "@lib/config"
import { HttpTypes } from "@medusajs/types"
import { getAuthHeaders, getCacheOptions } from "./cookies"

export type SearchableProduct = {
  id: string
  title: string
  handle: string
  description: string | null
  thumbnail: string | null
  cheapestPrice: string | null
  overviewHtml: string | null // Очищений текст без HTML тегів для пошуку
}

/**
 * Отримує всі продукти для пошуку з необхідними полями
 */
export async function getProductsForSearch(
  regionId: string
): Promise<SearchableProduct[]> {
  try {
    const headers = {
      ...(await getAuthHeaders()),
    }

    const next = {
      ...(await getCacheOptions("products")),
    }

    const response = await sdk.client.fetch<{
      products: HttpTypes.StoreProduct[]
      count: number
    }>(`/store/products`, {
      method: "GET",
      query: {
        limit: 1000,
        region_id: regionId,
        fields: "*variants.calculated_price,+metadata",
      },
      headers,
      next,
      cache: "force-cache",
    })

    return response.products.map((product) => {
      // Обчислюємо найдешевшу ціну на сервері
      const prices =
        product.variants
          ?.map((v) => v.calculated_price?.calculated_amount)
          .filter((price): price is number => typeof price === "number") || []

      const cheapestAmount = prices.length > 0 ? Math.min(...prices) : null
      const currencyCode =
        product.variants?.[0]?.calculated_price?.currency_code || "USD"

      const cheapestPrice = cheapestAmount
        ? new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: currencyCode,
          }).format(cheapestAmount)
        : null

      // Витягуємо overview_html і очищаємо від HTML тегів для пошуку
      const metadata = product.metadata as any
      const overviewHtml = metadata?.overview_html || ""
      const searchableText = overviewHtml
        .replace(/<[^>]*>/g, " ") // delete HTML tags
        .replace(/&[^;]+;/g, " ") // replace HTML entities (&nbsp;, &amp; etc.)
        .replace(/\s+/g, " ") // normalize spaces
        .trim()

      return {
        id: product.id!,
        title: product.title!,
        handle: product.handle!,
        description: product.description || null,
        thumbnail: product.thumbnail || null,
        cheapestPrice,
        overviewHtml: searchableText || null,
      }
    })
  } catch (error) {
    console.error("Error fetching products for search:", error)
    return []
  }
}
