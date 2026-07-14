import type { HttpTypes } from "@medusajs/types"

export type ProductTemplate = "compound" | "peptide"

const PEPTIDE_ROOT_CATEGORY_HANDLE = "peptides"

/**
 * Manual override (`metadata.template`) always wins — this is how HGH, which
 * lives under its own root category rather than Peptides, gets the
 * peptide-style layout (reconstitution) without being customer-facing
 * "Peptides". Falls back to root-category inference, else "compound".
 */
export function resolveProductTemplate(
  product: HttpTypes.StoreProduct
): ProductTemplate {
  const override = product.metadata?.template
  if (override === "compound" || override === "peptide") {
    return override
  }

  const categories = product.categories ?? []
  const isPeptide = categories.some((category) => {
    const root = category.parent_category ?? category
    return root.handle === PEPTIDE_ROOT_CATEGORY_HANDLE
  })

  return isPeptide ? "peptide" : "compound"
}
