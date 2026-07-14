import { HttpTypes } from "@medusajs/types"
import Breadcrumbs from "@modules/common/components/breadcrumbs"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

/**
 * Top-of-page navigation for the PDP. Desktop: one compact trail
 * (Home › Category › Product). Mobile: just a quiet "‹ Category" link —
 * the full trail doesn't fit and the category is the only hop that matters.
 */
const ProductBreadcrumb = ({
  product,
}: {
  product: HttpTypes.StoreProduct
}) => {
  const items = []

  if (product.categories && product.categories.length > 0) {
    const category = product.categories[0]

    if (category.parent_category) {
      items.push({
        label: category.parent_category.name,
        href: `/categories/${category.parent_category.handle}`,
      })
    }

    items.push({
      label: category.name,
      href: `/categories/${category.handle}`,
    })
  } else if (product.collection) {
    items.push({
      label: product.collection.title,
      href: `/collections/${product.collection.handle}`,
    })
  }

  const parent = items[items.length - 1]

  return (
    <div data-testid="product-breadcrumb">
      <Breadcrumbs
        items={items}
        current={product.title ?? undefined}
        className="hidden small:flex"
      />
      {parent && (
        <LocalizedClientLink
          href={parent.href}
          className="small:hidden inline-flex items-center gap-1 text-xs text-gray-500 transition-colors hover:text-gray-300"
        >
          <span aria-hidden="true">‹</span>
          {parent.label}
        </LocalizedClientLink>
      )}
    </div>
  )
}

export default ProductBreadcrumb
