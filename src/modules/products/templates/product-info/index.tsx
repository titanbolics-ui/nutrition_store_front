import { HttpTypes } from "@medusajs/types"
import { Heading, Text } from "@medusajs/ui"
import Breadcrumbs from "@modules/common/components/breadcrumbs"
import BackButton from "@modules/common/components/back-button"

type ProductInfoProps = {
  product: HttpTypes.StoreProduct
}

const ProductInfo = ({ product }: ProductInfoProps) => {
  // Будуємо breadcrumbs на основі categories або collection
  const breadcrumbItems = []
  let backLabel = "Back to products"
  let fallbackHref = "/"
  
  // Якщо є категорії
  if (product.categories && product.categories.length > 0) {
    const category = product.categories[0]
    
    // Додаємо батьківську категорію якщо є
    if (category.parent_category) {
      breadcrumbItems.push({
        label: category.parent_category.name,
        href: `/categories/${category.parent_category.handle}`,
      })
    }
    
    // Додаємо поточну категорію
    breadcrumbItems.push({
      label: category.name,
      href: `/categories/${category.handle}`,
    })
    
    backLabel = `Back to ${category.name}`
    fallbackHref = `/categories/${category.handle}`
  } else if (product.collection) {
    // Fallback на collection якщо немає категорій
    breadcrumbItems.push({
      label: product.collection.title,
      href: `/collections/${product.collection.handle}`,
    })
    
    backLabel = `Back to ${product.collection.title}`
    fallbackHref = `/collections/${product.collection.handle}`
  }

  return (
    <div id="product-info">
      <div className="flex flex-col gap-y-4 lg:max-w-[500px] mx-auto">
        <BackButton label={backLabel} fallbackHref={fallbackHref} />
        
        {breadcrumbItems.length > 0 && (
          <Breadcrumbs items={breadcrumbItems} />
        )}
        
        <Heading
          level="h2"
          className="text-3xl leading-10 text-ui-fg-base"
          data-testid="product-title"
        >
          {product.title}
        </Heading>

        <Text
          className="text-medium text-ui-fg-subtle whitespace-pre-line"
          data-testid="product-description"
        >
          {product.description}
        </Text>
      </div>
    </div>
  )
}

export default ProductInfo
