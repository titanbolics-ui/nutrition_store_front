import { HttpTypes } from "@medusajs/types"

import { listProducts } from "@lib/data/products"
import { getCollectionByHandle } from "@lib/data/collections"
import { getCategoryByHandle } from "@lib/data/categories"
import { sortByRank } from "@lib/util/sort-products"
import { convertToLocale } from "@lib/util/money"
import { resolveProductStockState } from "@lib/util/resolve-stock-state"
import type { RailProduct } from "@modules/store/components/product-rail"

import GoalSection, { GoalPanel } from "./goal-section"

type PanelDef = {
  id: string
  title: string
  subtitle: string
  description: string
  image: string
  /** object-position keeping faces in frame — tuned per photo */
  imagePosition: string
  href: string
  collection?: string
  category?: string
}

// Copy/images carried over from the old goals carousel; products are live.
const PANEL_DEFS: PanelDef[] = [
  {
    id: "bulking",
    title: "MASS & STRENGTH",
    subtitle: "BULKING CYCLE",
    description:
      "Build serious mass and raw power with proven anabolic compounds designed for maximum muscle growth.",
    image:
      "https://pub-180ab5eb49854df5a790e2b99c1c0be9.r2.dev/onyxgenetics/muscle.jpg",
    imagePosition: "center 12%",
    href: "/collections/bulking",
    collection: "bulking",
  },
  {
    id: "cutting",
    title: "LEAN & SHREDDED",
    subtitle: "CUTTING CYCLE",
    description:
      "Get competition-ready with compounds that preserve muscle while torching fat. Veins, striations, the works.",
    image:
      "https://pub-180ab5eb49854df5a790e2b99c1c0be9.r2.dev/onyxgenetics/Esthetic.jpg",
    imagePosition: "center 8%",
    href: "/collections/cutting",
    collection: "cutting",
  },
  {
    id: "peptides",
    title: "PEPTIDES & GLP-1",
    subtitle: "FAT LOSS / HEALING",
    description:
      "Next-generation peptides for accelerated fat loss, tissue repair, and metabolic optimization.",
    image:
      "https://pub-180ab5eb49854df5a790e2b99c1c0be9.r2.dev/onyxgenetics/model_female.jpg",
    imagePosition: "center 15%",
    href: "/categories/peptides",
    category: "peptides",
  },
  {
    id: "longevity",
    title: "ANTI-AGING & HGH",
    subtitle: "LONGEVITY",
    description:
      "Turn back the clock with growth hormone and TRT protocols. Look better, feel younger, perform at any age.",
    image:
      "https://pub-180ab5eb49854df5a790e2b99c1c0be9.r2.dev/onyxgenetics/silver_fox.jpg",
    imagePosition: "center 10%",
    href: "/collections/longevity",
    collection: "longevity",
  },
]

const TOP_PRODUCTS_PER_PANEL = 5

async function buildPanel(
  def: PanelDef,
  region: HttpTypes.StoreRegion
): Promise<GoalPanel | null> {
  try {
    let filter: Record<string, string[]>
    if (def.collection) {
      const collection = await getCollectionByHandle(def.collection)
      if (!collection) return null
      filter = { collection_id: [collection.id] }
    } else {
      const category = await getCategoryByHandle([def.category!])
      if (!category) return null
      filter = { category_id: [category.id] }
    }

    const {
      response: { products },
    } = await listProducts({
      regionId: region.id,
      queryParams: {
        limit: 24,
        fields:
          "id,title,handle,thumbnail,*variants.calculated_price,+variants.inventory_quantity,+variants.manage_inventory,+variants.allow_backorder,+variants.metadata,+metadata",
        ...filter,
      },
    })

    const top: RailProduct[] = sortByRank(products)
      .filter((p) => p.thumbnail)
      .slice(0, TOP_PRODUCTS_PER_PANEL)
      .map((p) => {
        const amounts = (p.variants ?? [])
          .map((v) => v?.calculated_price?.calculated_amount)
          .filter((n): n is number => typeof n === "number")
        return {
          title: p.title,
          thumbnail: p.thumbnail!,
          handle: p.handle,
          price:
            amounts.length > 0
              ? convertToLocale({
                  amount: Math.min(...amounts),
                  currency_code: region.currency_code,
                })
              : null,
          stockState: resolveProductStockState(p),
        }
      })

    if (top.length === 0) return null

    const { collection, category, ...presentational } = def
    return { ...presentational, products: top }
  } catch {
    return null
  }
}

export default async function GoalsShowcase({
  region,
}: {
  region: HttpTypes.StoreRegion
}) {
  const panels = (
    await Promise.all(PANEL_DEFS.map((def) => buildPanel(def, region)))
  ).filter((p): p is GoalPanel => p !== null)

  if (panels.length === 0) {
    return null
  }

  return (
    <div data-testid="goals-showcase">
      {panels.map((panel, i) => (
        <GoalSection key={panel.id} panel={panel} index={i} />
      ))}
    </div>
  )
}
