import type { HttpTypes } from "@medusajs/types"
import { resolveProductTemplate } from "@lib/util/resolve-product-template"
import { readProductContent } from "./read-content"
import CompoundContent from "./compound-content"
import PeptideContent from "./peptide-content"

type ProductContentProps = {
  product: HttpTypes.StoreProduct
}

/**
 * content.type is the source of truth for which layout renders — it's what
 * was explicitly authored into metadata.content. resolveProductTemplate is
 * only consulted to catch a mismatch (e.g. content written as "peptide" on a
 * product whose category/override resolves to "compound") and warn loudly —
 * never to override content.type, and never to blank the page. Content is
 * often hand-authored, so a silent blank page on a typo is exactly the
 * failure mode to avoid; a mismatch is a content mistake to surface, not a
 * reason to hide the page. Renders nothing only when metadata.content itself
 * is absent or malformed — the existing legacy blocks
 * (ProductSideEffects/ProductSpecs) keep rendering in that case.
 */
const ProductContent = ({ product }: ProductContentProps) => {
  const content = readProductContent(product)
  if (!content) {
    return null
  }

  const template = resolveProductTemplate(product)
  if (template !== content.type) {
    console.warn(
      `[ProductContent] product ${product.id} (${product.handle ?? "no handle"}): ` +
        `resolveProductTemplate resolved "${template}" but metadata.content.type is ` +
        `"${content.type}" — rendering "${content.type}" (the authored value). Check ` +
        `metadata.template / category / content.type for a mismatch.`
    )
  }

  const activeIngredientRaw = product.metadata?.active_ingredient
  const activeIngredient =
    typeof activeIngredientRaw === "string" && activeIngredientRaw.trim()
      ? activeIngredientRaw.trim()
      : undefined

  return (
    <div className="content-container my-16 small:my-32">
      <div className="mx-auto max-w-4xl">
        {content.type === "compound" ? (
          <CompoundContent
            product={product}
            content={content}
            activeIngredient={activeIngredient}
          />
        ) : (
          <PeptideContent
            product={product}
            content={content}
            activeIngredient={activeIngredient}
          />
        )}
      </div>
    </div>
  )
}

export default ProductContent
