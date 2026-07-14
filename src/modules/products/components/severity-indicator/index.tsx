import SpecRow from "../spec-row"

export type SeverityLevel = "none" | "low" | "moderate" | "high"

const LEVELS: SeverityLevel[] = ["none", "low", "moderate", "high"]

const KEYWORD_RULES: [RegExp, SeverityLevel][] = [
  [/\b(none|n\/a|negligible|not applicable|rare)\b/i, "none"],
  [/\b(low|mild|minimal|slight)\b/i, "low"],
  [/\b(moderate|medium|average)\b/i, "moderate"],
  [/\b(high|severe|significant|strong|elevated)\b/i, "high"],
]

export function deriveSeverity(value: string): SeverityLevel | null {
  for (const [pattern, level] of KEYWORD_RULES) {
    if (pattern.test(value)) return level
  }
  return null
}

type SeverityIndicatorProps = {
  label: string
  value: string
}

const SeverityIndicator = ({ label, value }: SeverityIndicatorProps) => {
  const level = deriveSeverity(value)

  if (level === null) {
    return <SpecRow label={label} value={value} />
  }

  const litCount = LEVELS.indexOf(level)

  return (
    <div className="grid grid-cols-[auto_1fr] items-baseline gap-x-6 gap-y-2 border-b border-gray-800 py-2 text-sm last:border-0">
      <dt className="whitespace-nowrap text-gray-400">{label}</dt>
      <dd className="flex flex-col items-end gap-1.5">
        <span className="text-right font-medium text-white">{value}</span>
        <div className="flex w-24 gap-1" aria-hidden="true">
          {LEVELS.slice(1).map((_, i) => (
            <span
              key={i}
              className={`h-1 flex-1 rounded-full ${
                i < litCount ? "bg-[#ccff00]" : "bg-gray-700"
              }`}
            />
          ))}
        </div>
      </dd>
    </div>
  )
}

export default SeverityIndicator
