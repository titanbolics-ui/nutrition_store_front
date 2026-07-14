import { HttpTypes } from "@medusajs/types"
import { Droplet, Factory, Pill, Syringe, type LucideIcon } from "lucide-react"
import SpecRow from "../spec-row"

type ProductSpecsProps = {
  product: HttpTypes.StoreProduct
}

const specsConfig = [
  { key: "manufacturer", label: "Manufacturer" },
  { key: "active_ingredient", label: "Active Ingredient" },
  { key: "concentration", label: "Concentration" },
  { key: "form", label: "Form" },
  { key: "volume", label: "Volume" },
]

function iconFor(key: string, value: unknown): LucideIcon | undefined {
  if (key === "manufacturer") return Factory
  if (key === "concentration") return Droplet
  if (key === "form") {
    return /inject|vial|amp/i.test(String(value ?? "")) ? Syringe : Pill
  }
  return undefined
}

/**
 * Old products keep specs nested under metadata.specs (string or object);
 * newer ones write the same fields flat on metadata directly. Flat keys win
 * when both are present.
 */
function getAvailableSpecs(product: HttpTypes.StoreProduct) {
  const metadata = product.metadata || {}

  let specs: Record<string, any> = {}
  const specsRaw = metadata.specs

  try {
    if (typeof specsRaw === "string") {
      specs = JSON.parse(specsRaw)
    } else if (specsRaw && typeof specsRaw === "object") {
      specs = specsRaw as Record<string, any>
    }
  } catch (error) {
    console.error("Failed to parse specs:", error)
    specs = {}
  }

  specsConfig.forEach((item) => {
    const flatValue = metadata[item.key]
    if (flatValue !== undefined && flatValue !== null && flatValue !== "") {
      specs[item.key] = flatValue
    }
  })

  return specsConfig
    .filter((spec) => specs[spec.key])
    .map((spec) => ({ ...spec, value: specs[spec.key] }))
}

export function hasAvailableSpecs(product: HttpTypes.StoreProduct): boolean {
  return getAvailableSpecs(product).length > 0
}

const ProductSpecs = ({ product }: ProductSpecsProps) => {
  const availableSpecs = getAvailableSpecs(product)

  if (availableSpecs.length === 0) return null

  return (
    <dl className="grid grid-cols-1">
      {availableSpecs.map((spec) => (
        <SpecRow
          key={spec.key}
          label={spec.label}
          value={spec.value?.toString()}
          icon={iconFor(spec.key, spec.value)}
        />
      ))}
    </dl>
  )
}

export default ProductSpecs
