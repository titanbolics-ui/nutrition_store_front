import SpecRow from "../spec-row"

type BooleanValue = "yes" | "no"

const YES_PATTERN = /^(yes|true|present|significant)\b/i
const NO_PATTERN = /^(no|none|false|absent|minimal|negligible)\b/i

export function detectBoolean(value: string): BooleanValue | null {
  const trimmed = value.trim()
  if (YES_PATTERN.test(trimmed)) return "yes"
  if (NO_PATTERN.test(trimmed)) return "no"
  return null
}

type BooleanChipProps = {
  label: string
  value: string
}

const BooleanChip = ({ label, value }: BooleanChipProps) => {
  const detected = detectBoolean(value)

  if (detected === null) {
    return <SpecRow label={label} value={value} />
  }

  const trimmed = value.trim()
  const bareKeywordMatch = detected === "yes" ? YES_PATTERN : NO_PATTERN
  const matched = trimmed.match(bareKeywordMatch)
  const hasExtraDetail = matched ? trimmed.length > matched[0].length : false

  return (
    <div className="grid grid-cols-[auto_1fr] items-center gap-x-6 gap-y-1 border-b border-gray-800 py-2 text-sm last:border-0">
      <dt className="whitespace-nowrap text-gray-400">{label}</dt>
      <dd className="flex items-center justify-end gap-2">
        {hasExtraDetail && (
          <span className="text-xs text-gray-500">{trimmed}</span>
        )}
        <span
          className={
            detected === "yes"
              ? "inline-flex rounded-full border border-[#ccff00]/40 bg-[#ccff00]/10 px-2.5 py-0.5 text-xs font-medium text-[#ccff00]"
              : "inline-flex rounded-full border border-gray-700 bg-gray-800 px-2.5 py-0.5 text-xs font-medium text-gray-400"
          }
        >
          {detected === "yes" ? "Yes" : "No"}
        </span>
      </dd>
    </div>
  )
}

export default BooleanChip
