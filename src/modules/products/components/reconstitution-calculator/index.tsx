"use client"

import { useId, useState } from "react"
import type { HttpTypes } from "@medusajs/types"
import { Info, TriangleAlert } from "lucide-react"
import {
  DEFAULT_IU_PER_MG,
  DEFAULT_VIAL,
  SYRINGE_SIZES,
  SYRINGE_UNITS,
  VIAL_PRESETS,
  computeDraw,
  formatMl,
  formatUnits,
  mgEquivalent,
  readProductReconstitution,
  type DoseUnit,
  type SyringeSize,
} from "@lib/util/reconstitution"

/**
 * Stage D reconstitution calculator, reference-style UX: guided questions with
 * preset chips ("Other" reveals a free input), a sentence result, and a
 * ruler-style U-100 scale. Gated at the product level
 * (metadata.reconstitution.enabled); mode (mg vs IU) is auto-resolved from the
 * product (HGH → IU). Vial amount, water, dose and syringe are all user-entered
 * — nothing is read from variants — so it drops into the product page Calculator
 * tab now and the future tool-hub unchanged. All math lives in
 * @lib/util/reconstitution (pure, unit-tested); this component only parses
 * input strings and renders states.
 */

/** Tolerant decimal parse: trims, accepts comma as decimal separator. */
function parseDecimal(value: string): number {
  const trimmed = value.trim().replace(",", ".")
  if (!trimmed) return NaN
  return Number(trimmed)
}

const WATER_PRESETS = [1, 2, 3, 5]
const MG_DOSE_PRESETS: { value: number; unit: "mcg" | "mg" }[] = [
  { value: 50, unit: "mcg" },
  { value: 100, unit: "mcg" },
  { value: 250, unit: "mcg" },
  { value: 500, unit: "mcg" },
  { value: 1, unit: "mg" },
  { value: 2.5, unit: "mg" },
]
const IU_DOSE_PRESETS: { value: number; unit: "IU" }[] = [
  { value: 1, unit: "IU" },
  { value: 2, unit: "IU" },
  { value: 3, unit: "IU" },
  { value: 4, unit: "IU" },
]
// Chip selection state: a preset index, or the explicit "other" sentinel —
// the custom input value never masquerades as a preset.
type ChipChoice = number | "other"

const inputClasses =
  "w-full rounded-lg border border-gray-800 bg-gray-900/50 px-3 py-2 text-sm text-white placeholder:text-gray-600 focus:border-[#ccff00] focus:outline-none"

const questionClasses = "text-sm font-semibold text-white"

const chipClasses = (active: boolean) =>
  "rounded-md border px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ccff00] " +
  (active
    ? "border-[#ccff00] bg-[#ccff00]/10 text-[#ccff00]"
    : "border-gray-800 text-gray-400 hover:text-white")

const Highlight = ({ children }: { children: React.ReactNode }) => (
  <strong className="font-bold text-[#ccff00]">{children}</strong>
)

const SyringeIcon = ({ active, barrelPct }: { active: boolean; barrelPct: number }) => {
  const stroke = active ? "#ccff00" : "#6b7280"
  const barrel = 26 + (64 - 26) * barrelPct
  return (
    <svg
      viewBox="0 0 110 24"
      className="h-6 w-28 flex-shrink-0"
      aria-hidden="true"
      fill="none"
      stroke={stroke}
      strokeWidth="1.5"
    >
      {/* needle */}
      <line x1="2" y1="12" x2="18" y2="12" />
      {/* barrel, length scaled per size */}
      <rect x="18" y="6" width={barrel} height="12" rx="2" />
      {Array.from({ length: 5 }, (_, i) => {
        const x = 18 + ((i + 1) * barrel) / 6
        return <line key={i} x1={x} y1="8" x2={x} y2={i % 2 ? "12" : "14"} />
      })}
      {/* plunger rod + thumb rest */}
      <line x1={18 + barrel} y1="12" x2={18 + barrel + 16} y2="12" />
      <line x1={18 + barrel + 16} y1="5" x2={18 + barrel + 16} y2="19" strokeWidth="3" />
      {/* flange */}
      <line x1={18 + barrel} y1="2" x2={18 + barrel} y2="22" />
    </svg>
  )
}

const VialIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 32"
    className={className}
    aria-hidden="true"
    fill="none"
    stroke="#6b7280"
    strokeWidth="1.5"
  >
    <rect x="7" y="1" width="10" height="4" rx="1" stroke="#ccff00" />
    <path d="M8 5v3l-2 3v18a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V11l-2-3V5" />
    <line x1="6" y1="20" x2="18" y2="20" />
  </svg>
)

/**
 * Ruler-style U-100 scale: minor ticks every 2 units, labelled major ticks
 * every 10, draw zone filled from 0. Decorative (numbers live in the result
 * sentence), hence aria-hidden.
 */
const RulerScale = ({
  units,
  maxUnits,
}: {
  units: number | null
  maxUnits: number
}) => {
  const fillPct = units === null ? 0 : (Math.min(units, maxUnits) / maxUnits) * 100
  const minors = Array.from({ length: maxUnits / 2 - 1 }, (_, i) => (i + 1) * 2)
  const majors = Array.from({ length: maxUnits / 10 }, (_, i) => (i + 1) * 10)
  return (
    <div aria-hidden="true" className="pt-1">
      <div className="relative h-10 rounded-md border border-gray-800 bg-gray-900/50">
        <div
          className="absolute inset-y-0 left-0 border-r-2 border-[#ccff00] bg-[#ccff00]/15 transition-[width] duration-300 ease-out motion-reduce:transition-none"
          style={{ width: `${fillPct}%` }}
        />
        {minors.map((u) => (
          <span
            key={u}
            className={
              "absolute top-0 w-px bg-gray-600 " + (u % 10 === 0 ? "h-5" : "h-2.5")
            }
            style={{ left: `${(u / maxUnits) * 100}%` }}
          />
        ))}
        {majors.map((u) => (
          <span
            key={u}
            className="absolute bottom-0.5 -translate-x-1/2 text-[10px] font-medium text-gray-500"
            style={{ left: `${(u / maxUnits) * 100}%` }}
          >
            {u}
          </span>
        ))}
      </div>
      <p className="mt-1 text-right text-[10px] text-gray-600">
        U-100 · {maxUnits} units = {formatMl(maxUnits / SYRINGE_UNITS)} ml
      </p>
    </div>
  )
}

const ReconstitutionCalculator = ({
  product,
}: {
  product: HttpTypes.StoreProduct
}) => {
  const idPrefix = useId()
  // Pure read, safe to call before hooks; the actual early-return is after them
  // so hook order stays stable.
  const config = readProductReconstitution(product)
  const unit = config?.unit ?? "mg"
  const isIU = unit === "IU"
  const vialPresets = VIAL_PRESETS[unit]
  const defaultVialIndex = Math.max(0, vialPresets.indexOf(DEFAULT_VIAL[unit]))

  const [syringeMl, setSyringeMl] = useState<SyringeSize>(1.0)
  const [vialChoice, setVialChoice] = useState<ChipChoice>(defaultVialIndex)
  const [vialOther, setVialOther] = useState("")
  const [waterChoice, setWaterChoice] = useState<ChipChoice>(1) // preset index → 2 ml
  const [waterOther, setWaterOther] = useState("")
  const [mgDoseChoice, setMgDoseChoice] = useState<ChipChoice>(3) // → 500 mcg
  const [iuDoseChoice, setIuDoseChoice] = useState<ChipChoice>(1) // → 2 IU
  const [doseOther, setDoseOther] = useState("")
  const [doseOtherUnit, setDoseOtherUnit] = useState<"mcg" | "mg">("mcg")
  const [factorInput, setFactorInput] = useState(String(DEFAULT_IU_PER_MG))

  if (!config) return null

  const isBlend = config.isBlend

  const vialAmount =
    vialChoice === "other" ? parseDecimal(vialOther) : vialPresets[vialChoice]

  const bacMl =
    waterChoice === "other" ? parseDecimal(waterOther) : WATER_PRESETS[waterChoice]

  const doseChoice = isIU ? iuDoseChoice : mgDoseChoice
  const setDoseChoice = isIU ? setIuDoseChoice : setMgDoseChoice
  const dosePresets = isIU ? IU_DOSE_PRESETS : MG_DOSE_PRESETS
  let dose: number
  let doseUnit: DoseUnit
  if (doseChoice === "other") {
    dose = parseDecimal(doseOther)
    doseUnit = isIU ? "IU" : doseOtherUnit
  } else {
    const preset = dosePresets[doseChoice]
    dose = preset.value
    doseUnit = preset.unit
  }

  const result = computeDraw({
    vialAmount,
    unit,
    bacMl,
    dose,
    doseUnit,
    syringeMl,
  })

  const factor = parseDecimal(factorInput)
  const doseMgEquivalent = isIU ? mgEquivalent(dose, factor) : null

  // Empty "Other" fields get a calm prompt instead of the invalid-input
  // message — an untouched custom field isn't an error state.
  let hint: string | null = null
  if (vialChoice === "other" && !vialOther.trim()) {
    hint = `Enter how many ${unit} are in your vial to see your draw.`
  } else if (waterChoice === "other" && !waterOther.trim()) {
    hint = "Enter the BAC water volume to see your draw."
  } else if (doseChoice === "other" && !doseOther.trim()) {
    hint = "Enter your desired dose to see your draw."
  } else if (!result.ok) {
    hint =
      result.reason === "no-water"
        ? "Water volume must be above 0 ml."
        : result.reason === "invalid-input"
          ? "Enter valid positive numbers."
          : null
  }
  const exceeds = !result.ok && result.reason === "exceeds-syringe"
  const maxUnits = Math.round(syringeMl * SYRINGE_UNITS)

  const doseLabel =
    doseUnit === "mcg"
      ? `${formatMl(dose)} mcg (${formatMl(dose / 1000)} mg)`
      : doseUnit === "mg"
        ? `${formatMl(dose)} mg`
        : doseMgEquivalent !== null
          ? `${formatMl(dose)} IU (≈ ${formatMl(doseMgEquivalent)} mg at ${formatMl(factor)} IU/mg)`
          : `${formatMl(dose)} IU`

  return (
    <div
      className="flex max-w-3xl flex-col gap-8"
      data-testid="reconstitution-calculator"
    >
      <div className="grid grid-cols-1 gap-8 small:grid-cols-2">
        <section className="flex flex-col gap-3">
          <h4 className={questionClasses}>
            What is the total volume of your syringe?
          </h4>
          <div className="flex flex-col gap-2" role="group" aria-label="Syringe volume">
            {SYRINGE_SIZES.map((size, i) => {
              const active = syringeMl === size
              return (
                <button
                  key={size}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setSyringeMl(size)}
                  className={
                    "flex items-center gap-4 rounded-lg border px-4 py-3 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ccff00] " +
                    (active
                      ? "border-[#ccff00] bg-[#ccff00]/10"
                      : "border-gray-800 hover:border-gray-700")
                  }
                >
                  <span
                    className={
                      "w-12 text-sm font-semibold " +
                      (active ? "text-[#ccff00]" : "text-gray-300")
                    }
                  >
                    {size.toFixed(1)} ml
                  </span>
                  <SyringeIcon active={active} barrelPct={i / (SYRINGE_SIZES.length - 1)} />
                </button>
              )
            })}
          </div>
        </section>

        <div className="flex flex-col gap-6">
          <section className="flex flex-col gap-3" data-testid="vial-group">
            <div className="flex items-center gap-3">
              <VialIcon className="h-10 w-8 flex-shrink-0" />
              <h4 className={questionClasses}>
                How many {unit} are in your vial?
                {isBlend && (
                  <span className="font-normal text-gray-500"> (total of all actives)</span>
                )}
              </h4>
            </div>
            <div className="flex flex-wrap gap-2" role="group" aria-label="Vial amount">
              {vialPresets.map((amount, i) => (
                <button
                  key={amount}
                  type="button"
                  aria-pressed={vialChoice === i}
                  onClick={() => setVialChoice(i)}
                  className={chipClasses(vialChoice === i)}
                >
                  {amount} {unit}
                </button>
              ))}
              <button
                type="button"
                aria-pressed={vialChoice === "other"}
                onClick={() => setVialChoice("other")}
                className={chipClasses(vialChoice === "other")}
              >
                Other
              </button>
            </div>
            {vialChoice === "other" && (
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor={`${idPrefix}-vial`}
                  className="text-xs uppercase tracking-wide text-gray-500"
                >
                  Custom vial amount ({unit})
                </label>
                <input
                  id={`${idPrefix}-vial`}
                  type="text"
                  inputMode="decimal"
                  autoComplete="off"
                  value={vialOther}
                  onChange={(e) => setVialOther(e.target.value)}
                  placeholder={isIU ? "e.g. 100" : "e.g. 500"}
                  className={inputClasses + " max-w-[10rem]"}
                />
              </div>
            )}
            {isBlend && (
              <p className="flex items-start gap-2 text-sm text-gray-300">
                <Info
                  className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#ccff00]"
                  aria-hidden="true"
                />
                <span>
                  Blend — the result is the <strong>total draw volume</strong>{" "}
                  for the combined actives, not a single-component dose.
                </span>
              </p>
            )}
          </section>

          <section className="flex flex-col gap-3" data-testid="water-group">
            <h4 className={questionClasses}>
              How much bacteriostatic water are you adding?
            </h4>
            <div
              className="flex flex-wrap gap-2"
              role="group"
              aria-label="Bacteriostatic water"
            >
              {WATER_PRESETS.map((ml, i) => (
                <button
                  key={ml}
                  type="button"
                  aria-pressed={waterChoice === i}
                  onClick={() => setWaterChoice(i)}
                  className={chipClasses(waterChoice === i)}
                >
                  {ml} ml
                </button>
              ))}
              <button
                type="button"
                aria-pressed={waterChoice === "other"}
                onClick={() => setWaterChoice("other")}
                className={chipClasses(waterChoice === "other")}
              >
                Other
              </button>
            </div>
            {waterChoice === "other" && (
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor={`${idPrefix}-water`}
                  className="text-xs uppercase tracking-wide text-gray-500"
                >
                  Custom water volume (ml)
                </label>
                <input
                  id={`${idPrefix}-water`}
                  type="text"
                  inputMode="decimal"
                  autoComplete="off"
                  value={waterOther}
                  onChange={(e) => setWaterOther(e.target.value)}
                  placeholder="e.g. 2.5"
                  className={inputClasses + " max-w-[10rem]"}
                />
              </div>
            )}
          </section>

          <section className="flex flex-col gap-3" data-testid="dose-group">
            <h4 className={questionClasses}>
              {isBlend
                ? "How much total do you want in each dose?"
                : "How much do you want in each dose?"}
            </h4>
            <div className="flex flex-wrap gap-2" role="group" aria-label="Dose">
              {dosePresets.map((preset, i) => (
                <button
                  key={`${preset.value}-${preset.unit}`}
                  type="button"
                  aria-pressed={doseChoice === i}
                  onClick={() => setDoseChoice(i)}
                  className={chipClasses(doseChoice === i)}
                >
                  {preset.value} {preset.unit}
                </button>
              ))}
              <button
                type="button"
                aria-pressed={doseChoice === "other"}
                onClick={() => setDoseChoice("other")}
                className={chipClasses(doseChoice === "other")}
              >
                Other
              </button>
            </div>
            {doseChoice === "other" && (
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor={`${idPrefix}-dose`}
                  className="text-xs uppercase tracking-wide text-gray-500"
                >
                  {isBlend ? "Custom total dose" : "Custom dose"}
                </label>
                <div className="flex gap-2">
                  <div className="relative max-w-[10rem]">
                    <input
                      id={`${idPrefix}-dose`}
                      type="text"
                      inputMode="decimal"
                      autoComplete="off"
                      value={doseOther}
                      onChange={(e) => setDoseOther(e.target.value)}
                      placeholder={isIU ? "e.g. 2" : "e.g. 500"}
                      className={inputClasses + (isIU ? " pr-10" : "")}
                    />
                    {isIU && (
                      <span
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs text-gray-500"
                      >
                        IU
                      </span>
                    )}
                  </div>
                  {!isIU && (
                    <div
                      className="flex overflow-hidden rounded-lg border border-gray-800"
                      role="group"
                      aria-label="Dose unit"
                    >
                      {(["mcg", "mg"] as const).map((u) => (
                        <button
                          key={u}
                          type="button"
                          aria-pressed={doseOtherUnit === u}
                          onClick={() => setDoseOtherUnit(u)}
                          className={
                            "px-3 text-xs font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#ccff00] " +
                            (doseOtherUnit === u
                              ? "bg-[#ccff00]/10 text-[#ccff00]"
                              : "text-gray-400 hover:text-white")
                          }
                        >
                          {u}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </section>

          {isIU && (
            <section className="flex flex-col gap-1.5">
              <label
                htmlFor={`${idPrefix}-factor`}
                className="text-xs uppercase tracking-wide text-gray-500"
              >
                IU per mg (from product label)
              </label>
              <div className="relative max-w-[10rem]">
                <input
                  id={`${idPrefix}-factor`}
                  type="text"
                  inputMode="decimal"
                  autoComplete="off"
                  value={factorInput}
                  onChange={(e) => setFactorInput(e.target.value)}
                  className={inputClasses + " pr-14"}
                />
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs text-gray-500"
                >
                  IU/mg
                </span>
              </div>
            </section>
          )}
        </div>
      </div>

      <div aria-live="polite" className="flex flex-col gap-3">
        {result.ok ? (
          <>
            <p className="text-base leading-relaxed text-gray-300">
              Your vial concentration is{" "}
              <Highlight>
                {formatMl(result.concentrationPerMl)} {unit}/ml
              </Highlight>
              .
              <br />
              To achieve <Highlight>{doseLabel}</Highlight>, draw{" "}
              <Highlight>
                {formatMl(result.drawMl)} ml{isBlend ? " total" : ""}
              </Highlight>{" "}
              (<Highlight>{formatUnits(result.units)} units</Highlight> on a
              U-100 syringe).
            </p>
            <RulerScale units={result.units} maxUnits={maxUnits} />
            <p className="text-xs text-gray-500">
              Bonus tip: {doseLabel.split(" (")[0]} on a{" "}
              {formatMl(result.concentrationPerMl)} {unit}/ml vial = draw{" "}
              {formatUnits(result.units)} units on a U-100 insulin syringe.
            </p>
          </>
        ) : exceeds ? (
          <>
            <p className="flex items-start gap-2 text-sm text-amber-400">
              <TriangleAlert
                className="mt-0.5 h-4 w-4 flex-shrink-0"
                aria-hidden="true"
              />
              <span>
                Dose exceeds the {syringeMl.toFixed(1)} ml syringe — add more
                water, lower the dose, or pick a bigger syringe.
              </span>
            </p>
            <RulerScale units={null} maxUnits={maxUnits} />
          </>
        ) : (
          <>
            <p className="text-sm text-gray-400">{hint}</p>
            <RulerScale units={null} maxUnits={maxUnits} />
          </>
        )}
      </div>

      <p className="text-xs text-gray-600">
        For research calculation purposes. Not medical advice.
      </p>
    </div>
  )
}

export default ReconstitutionCalculator
