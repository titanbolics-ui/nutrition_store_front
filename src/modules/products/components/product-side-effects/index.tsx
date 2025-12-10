import { HttpTypes } from "@medusajs/types"

type ProductSideEffectsProps = {
  product: HttpTypes.StoreProduct
}

const ProductSideEffects = ({ product }: ProductSideEffectsProps) => {
  const metadata = product.metadata || {}
  const overviewHtml = metadata.overview_html as string | undefined

  if (!overviewHtml) return null

  // Parse JSON if it's a string containing JSON, otherwise use as is
  let htmlContent: string
  try {
    // Try to parse as JSON first
    if (
      typeof overviewHtml === "string" &&
      overviewHtml.trim().startsWith("{")
    ) {
      const parsed = JSON.parse(overviewHtml)
      htmlContent = typeof parsed === "string" ? parsed : overviewHtml
    } else if (
      typeof overviewHtml === "string" &&
      overviewHtml.trim().startsWith('"')
    ) {
      // If it's a JSON string (wrapped in quotes), parse it
      htmlContent = JSON.parse(overviewHtml)
    } else {
      htmlContent = overviewHtml
    }
  } catch {
    // If parsing fails, use the original value
    htmlContent = overviewHtml
  }

  return (
    <div className="content-container my-16 small:my-32">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-semibold text-ui-fg-base mb-6">
          Overview
        </h2>
        <div
          className="prose prose-sm max-w-none text-ui-fg-subtle"
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />
      </div>
    </div>
  )
}

export default ProductSideEffects
