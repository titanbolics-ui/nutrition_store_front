import { HttpTypes } from "@medusajs/types"
import { clx } from "@medusajs/ui"
import { Pill } from "lucide-react"
import React from "react"

import Ampoule from "@modules/common/icons/ampoule"
import Vial from "@modules/common/icons/vial"
import { resolveStockState } from "@lib/util/resolve-stock-state"
import {
  classifyOptionValue,
  FORM_LABELS,
  type VariantForm,
} from "@lib/util/resolve-variant-form"

type OptionSelectProps = {
  option: HttpTypes.StoreProductOption
  current: string | undefined
  updateOption: (title: string, value: string) => void
  title: string
  disabled: boolean
  variants?: HttpTypes.StoreProductVariant[]
  selectedOptions?: Record<string, string | undefined>
  productForm?: unknown
  "data-testid"?: string
}

const FORM_ICONS: Record<VariantForm, React.ReactNode> = {
  tablets: <Pill className="size-5" aria-hidden="true" />,
  ampoule: <Ampoule size="20" aria-hidden="true" />,
  vial: <Vial size="20" aria-hidden="true" />,
}

/**
 * A value is out of stock only when EVERY variant carrying it (and matching
 * whatever is already selected on the product's other options) is out of
 * stock. No variant data at all means we can't know — treat as available
 * rather than lock the whole selector.
 */
function isValueOutOfStock(
  optionId: string,
  value: string,
  variants: HttpTypes.StoreProductVariant[] | undefined,
  selectedOptions: Record<string, string | undefined>
): boolean {
  if (!variants || variants.length === 0) {
    return false
  }

  const matching = variants.filter((variant) => {
    const opts = variant.options ?? []
    if (!opts.some((o) => o.option_id === optionId && o.value === value)) {
      return false
    }
    return opts.every((o) => {
      if (o.option_id === optionId) return true
      const selected = selectedOptions[o.option_id ?? ""]
      return !selected || selected === o.value
    })
  })

  if (matching.length === 0) {
    return false
  }

  return matching.every(
    (variant) => resolveStockState(variant) === "out_of_stock"
  )
}

const OptionSelect: React.FC<OptionSelectProps> = ({
  option,
  current,
  updateOption,
  title,
  variants,
  selectedOptions = {},
  productForm,
  "data-testid": dataTestId,
  disabled,
}) => {
  const values = (option.values ?? []).map((v) => v.value)

  // Partition values by physical form, preserving first-appearance order of
  // the groups. Falls back to a single plain group (labelled with the option
  // title) when nothing classifies — e.g. a "Concentration" option.
  const groups: { form: VariantForm | null; values: string[] }[] = []
  for (const value of values) {
    const form = classifyOptionValue(value, productForm)
    const group = groups.find((g) => g.form === form)
    if (group) {
      group.values.push(value)
    } else {
      groups.push({ form, values: [value] })
    }
  }
  const anyClassified = groups.some((g) => g.form !== null)

  return (
    <div className="flex flex-col gap-y-4" data-testid={dataTestId}>
      {groups.map((group) => {
        const label =
          anyClassified && group.form ? FORM_LABELS[group.form] : title
        return (
          <div key={group.form ?? "plain"} className="flex flex-col gap-y-3">
            <span
              className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-gray-400"
              data-testid="option-group-label"
            >
              {group.form && anyClassified && FORM_ICONS[group.form]}
              {label}
            </span>
            <div className="flex flex-wrap gap-2">
              {group.values.map((v) => {
                const selected = v === current
                const outOfStock = isValueOutOfStock(
                  option.id,
                  v,
                  variants,
                  selectedOptions
                )
                return (
                  <button
                    onClick={() => {
                      if (outOfStock) return
                      updateOption(option.id, v)
                    }}
                    key={v}
                    type="button"
                    title={outOfStock ? "Out of stock" : undefined}
                    aria-disabled={outOfStock || undefined}
                    className={clx(
                      "min-h-[44px] rounded-lg border px-4 py-2 text-small-regular transition-all duration-150",
                      outOfStock
                        ? "cursor-not-allowed border-gray-800 bg-gray-900 text-gray-600 line-through"
                        : selected
                        ? "border-[#ccff00] bg-[#ccff00]/10 text-[#ccff00]"
                        : "border-gray-700 bg-gray-800 text-white hover:border-gray-600 hover:bg-gray-700"
                    )}
                    disabled={disabled}
                    data-testid="option-button"
                    data-out-of-stock={outOfStock || undefined}
                  >
                    {v}
                  </button>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default OptionSelect
