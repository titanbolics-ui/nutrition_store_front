export type SortOptions = "price_asc" | "price_desc" | "created_at" | "featured"

// "featured" is the internal default (no explicit sort chosen) — manual rank curation.
// It is intentionally not listed in `sortOptions` below, so customers can never pick it
// directly; "Latest Arrivals" (created_at) keeps meaning newest-first.
// Rendered by CatalogToolbar (desktop dropdown + mobile bottom sheet).
export const sortOptions = [
  {
    value: "created_at",
    label: "Latest Arrivals",
  },
  {
    value: "price_asc",
    label: "Price: Low -> High",
  },
  {
    value: "price_desc",
    label: "Price: High -> Low",
  },
]
