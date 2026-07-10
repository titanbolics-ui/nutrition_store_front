import { HttpTypes } from "@medusajs/types"
import { clx } from "@medusajs/ui"
import React from "react"

type OptionSelectProps = {
  option: HttpTypes.StoreProductOption
  current: string | undefined
  updateOption: (title: string, value: string) => void
  title: string
  disabled: boolean
  "data-testid"?: string
}

const OptionSelect: React.FC<OptionSelectProps> = ({
  option,
  current,
  updateOption,
  title,
  "data-testid": dataTestId,
  disabled,
}) => {
  const filteredOptions = (option.values ?? []).map((v) => v.value)

  return (
    <div className="flex flex-col gap-y-3">
      <span className="text-sm text-gray-400">Select {title}</span>
      <div
        className="grid grid-cols-[repeat(auto-fit,minmax(100px,1fr))] gap-2 items-stretch"
        data-testid={dataTestId}
      >
        {filteredOptions.map((v) => {
          return (
            <button
              onClick={() => updateOption(option.id, v)}
              key={v}
              className={clx(
                // A fixed min-height (not just grid's per-row stretch) keeps every
                // button the same height regardless of which row it lands in —
                // stretch alone only equalizes siblings that share a row, and a
                // 2-line label can end up alone in its own row at narrow widths.
                "border border-gray-700 bg-gray-800 text-white text-small-regular rounded-lg p-2 min-h-[3.75rem] flex items-center justify-center text-center transition-all duration-150",
                {
                  "border-[#ccff00] bg-gray-700 text-[#ccff00]": v === current,
                  "hover:border-gray-600 hover:bg-gray-700":
                    v !== current,
                }
              )}
              disabled={disabled}
              data-testid="option-button"
            >
              {v}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default OptionSelect
