import { HttpTypes } from "@medusajs/types"
import { Text } from "@medusajs/ui"

type ProductSpecsProps = {
  product: HttpTypes.StoreProduct
}

const ProductSpecs = ({ product }: ProductSpecsProps) => {
  const metadata = product.metadata || {}

  const specsConfig = [
    { key: "manufacturer", label: "Manufacturer" },
    { key: "active_ingredient", label: "Active Ingredient" },
    { key: "concentration", label: "Concentration" },
    { key: "form", label: "Form" },
  ]

  const availableSpecs = specsConfig.filter((spec) => metadata[spec.key])

  if (availableSpecs.length === 0) return null

  return (
    <div className="grid grid-cols-1 gap-y-3">
      {availableSpecs.map((spec) => (
        <div
          key={spec.key}
          className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
        >
          <span className="font-semibold text-ui-fg-base text-sm">
            {spec.label}
          </span>
          <span className="text-ui-fg-subtle text-sm">
            {metadata[spec.key] as string}
          </span>
        </div>
      ))}
    </div>
  )
}

export default ProductSpecs
