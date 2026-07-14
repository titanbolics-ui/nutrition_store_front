import { HttpTypes } from "@medusajs/types"

/**
 * Visible identity block under the product title. Customers often search by a
 * brand/street name without knowing the compound, so both the active
 * substance and its aliases must be plain visible content (GEO + UX), not
 * hidden behind a tab:
 *   - active substance → an acid-green pill (the hero fact)
 *   - aliases (alsoKnownAs) → muted chips
 *
 * alsoKnownAs is read leniently from metadata.content (not through
 * readProductContent): that reader rejects the whole content object when any
 * structured section is incomplete, and the subtitle shouldn't disappear
 * because e.g. a dosage field is missing. Renders nothing when neither source
 * exists.
 */
const ProductSubtitle = ({ product }: { product: HttpTypes.StoreProduct }) => {
  const ingredientRaw = product.metadata?.active_ingredient
  const ingredient =
    typeof ingredientRaw === "string" && ingredientRaw.trim().length > 0
      ? ingredientRaw.trim()
      : null

  const content = product.metadata?.content as
    | { alsoKnownAs?: unknown }
    | undefined
  const alsoKnownAs = (
    Array.isArray(content?.alsoKnownAs) ? content.alsoKnownAs : []
  ).filter(
    (name): name is string =>
      typeof name === "string" && name.trim().length > 0
  )

  if (!ingredient && alsoKnownAs.length === 0) {
    return null
  }

  return (
    <div
      className="flex flex-col gap-y-2"
      data-testid="product-subtitle"
    >
      {ingredient && (
        <span
          className="inline-flex w-fit items-center rounded-full border border-[#ccff00]/40 bg-[#ccff00]/10 px-3 py-1 text-sm font-semibold text-[#ccff00]"
          data-testid="active-ingredient"
        >
          {ingredient}
        </span>
      )}

      {alsoKnownAs.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs uppercase tracking-wide text-gray-500">
            Also known as
          </span>
          {alsoKnownAs.map((name) => (
            <span
              key={name}
              className="inline-flex items-center rounded-full border border-gray-700 bg-gray-800 px-2.5 py-0.5 text-xs text-gray-300"
              data-testid="aka-chip"
            >
              {name}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

export default ProductSubtitle
