import { HttpTypes } from "@medusajs/types"
import { Text } from "@medusajs/ui"

type ProductSpecsProps = {
  product: HttpTypes.StoreProduct
}

const ProductSpecs = ({ product }: ProductSpecsProps) => {
  const metadata = product.metadata || {}

  // 1. Конфігурація полів, які ми шукаємо
  const specsConfig = [
    { key: "manufacturer", label: "Manufacturer" },
    { key: "active_ingredient", label: "Active Ingredient" },
    { key: "concentration", label: "Concentration" },
    { key: "form", label: "Form" },
    { key: "volume", label: "Volume" },
  ]

  // 2. ЛОГІКА ДЛЯ СТАРИХ ТОВАРІВ (Nested specs)
  // Намагаємося дістати та розпарсити об'єкт 'specs', якщо він є
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

  // 3. ЛОГІКА ДЛЯ НОВИХ ТОВАРІВ (Flat metadata)
  // Проходимося по нашому конфігу і дивимося, чи є такі ключі прямо в корені metadata.
  // Якщо є — додаємо їх у об'єкт specs (або перезаписуємо старі).
  specsConfig.forEach((item) => {
    // metadata[item.key] шукає metadata.manufacturer, metadata.volume і т.д.
    const flatValue = metadata[item.key]

    // Перевіряємо, чи значення існує і не пусте
    if (flatValue !== undefined && flatValue !== null && flatValue !== "") {
      specs[item.key] = flatValue
    }
  })

  // 4. Фільтруємо ті, що мають значення (щоб не виводити пусті рядки)
  const availableSpecs = specsConfig.filter((spec) => specs[spec.key])

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
            {/* Додаємо toString(), про всяк випадок, якщо там число */}
            {specs[spec.key]?.toString()}
          </span>
        </div>
      ))}
    </div>
  )
}

export default ProductSpecs
