import { HttpTypes } from "@medusajs/types"
import { Heading, Text } from "@medusajs/ui"
import ProductSubtitle from "@modules/products/components/product-subtitle"

type ProductInfoProps = {
  product: HttpTypes.StoreProduct
}

/**
 * The visible-facts head of the info column: title, active-substance
 * subtitle, short BLUF description. Breadcrumb lives in ProductBreadcrumb
 * (top of the page), commerce state (price/stock/CTA) in ProductActions.
 */
const ProductInfo = ({ product }: ProductInfoProps) => {
  return (
    <div id="product-info" className="flex flex-col gap-y-3">
      {product.type?.value && (
        <span
          className="self-start inline-flex items-center rounded-full border border-[#ccff00]/25 bg-[#ccff00]/10 px-2.5 py-0.5 text-[10px] uppercase tracking-widest font-mono text-[#ccff00]"
          data-testid="brand-badge"
        >
          {product.type.value}
        </span>
      )}
      <Heading
        level="h2"
        className="text-3xl leading-10 text-ui-fg-base"
        data-testid="product-title"
      >
        {product.title}
      </Heading>

      <ProductSubtitle product={product} />

      {product.description && (
        <Text
          className="text-medium text-ui-fg-subtle whitespace-pre-line line-clamp-3"
          data-testid="product-description"
        >
          {product.description}
        </Text>
      )}
    </div>
  )
}

export default ProductInfo
