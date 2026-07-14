type DosageScaleProps = {
  dosage: { beginner: string; intermediate: string; advanced: string }
}

const STAGES = [
  { key: "beginner", label: "Beginner" },
  { key: "intermediate", label: "Intermediate" },
  { key: "advanced", label: "Advanced" },
] as const

const DosageScale = ({ dosage }: DosageScaleProps) => {
  return (
    <div
      className="grid grid-cols-1 gap-4 sm:grid-cols-3"
      data-testid="dosage-scale"
    >
      {STAGES.map((stage, i) => (
        <div
          key={stage.key}
          className="rounded-lg border border-gray-800 bg-gray-900/50 p-4 transition-all duration-[120ms] motion-safe:hover:-translate-y-0.5 hover:border-[#ccff00]/40 hover:shadow-[0_0_20px_-4px_rgba(204,255,0,0.35)]"
        >
          <div className="mb-3 flex gap-1" aria-hidden="true">
            {STAGES.map((_, barIndex) => (
              <span
                key={barIndex}
                className={`h-1.5 flex-1 rounded-full ${
                  barIndex <= i ? "bg-[#ccff00]" : "bg-gray-700"
                }`}
              />
            ))}
          </div>
          <div className="text-xs font-semibold uppercase tracking-wide text-gray-400">
            {stage.label}
          </div>
          <div className="mt-1 text-sm font-medium text-white">
            {dosage[stage.key]}
          </div>
        </div>
      ))}
    </div>
  )
}

export default DosageScale
