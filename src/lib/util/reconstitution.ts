import type { HttpTypes } from "@medusajs/types"

/**
 * Reconstitution math for the Stage D calculator. MEDICAL calculation —
 * wrong math means the customer draws the wrong dose, so everything here is
 * pure, exhaustively unit-tested against the worked examples in
 * docs/storefront-redesign-tech-spec.md (Stage D), and can never leak
 * NaN/Infinity to the caller.
 *
 * All syringes are U-100: 1 ml = 100 units regardless of barrel size.
 */
export const SYRINGE_ML = 1
export const SYRINGE_UNITS = 100
export const SYRINGE_SIZES = [0.3, 0.5, 1.0] as const
export type SyringeSize = (typeof SYRINGE_SIZES)[number]

/** WHO standard for rhGH; editable per product label (some list e.g. 2.8 IU/mg). */
export const DEFAULT_IU_PER_MG = 3

export type ReconstitutionUnit = "mg" | "IU"

/** Vial-amount preset chips, per mode. Vial is user-entered, not product data. */
export const VIAL_PRESETS: Record<ReconstitutionUnit, number[]> = {
  mg: [2, 5, 10, 15, 30],
  IU: [100, 140, 150],
}
export const DEFAULT_VIAL: Record<ReconstitutionUnit, number> = {
  mg: 5,
  IU: 140,
}

export type ProductReconstitution = {
  enabled: true
  unit: ReconstitutionUnit
  isBlend: boolean
}

/**
 * IU vs mg mode. Only HGH is dosed in IU (vials labelled in IU, dose in IU);
 * everything else reconstituted (peptides, lyophilized compounds) is mg. HGH
 * is detected by its own root category (`handle === "hgh"`), with class /
 * active_ingredient metadata as fallbacks. An explicit
 * `metadata.reconstitution.unit` overrides this (see readProductReconstitution).
 */
export function resolveReconstitutionUnit(
  product: HttpTypes.StoreProduct
): ReconstitutionUnit {
  const inHghCategory = (product.categories ?? []).some((category) => {
    const root = category.parent_category ?? category
    return root.handle === "hgh"
  })
  const meta = product.metadata ?? {}
  const classStr = typeof meta.class === "string" ? meta.class : ""
  const ingredient =
    typeof meta.active_ingredient === "string" ? meta.active_ingredient : ""

  const isHgh =
    inHghCategory ||
    classStr.toUpperCase().includes("HGH") ||
    ingredient.toUpperCase() === "HGH"

  return isHgh ? "IU" : "mg"
}

/**
 * Reconstitution gate lives on PRODUCT metadata, not variants — the vial
 * amount varies too much to bind to a variant (e.g. NAD vials are 500 mg), so
 * it's asked from the user instead. Never throws on a malformed shape; treated
 * as disabled. `unit` is auto-resolved from the product unless explicitly set.
 */
export function readProductReconstitution(
  product: HttpTypes.StoreProduct
): ProductReconstitution | null {
  const raw = product.metadata?.reconstitution
  if (!raw || typeof raw !== "object") return null

  const r = raw as Record<string, unknown>
  if (r.enabled !== true) return null

  const unit =
    r.unit === "mg" || r.unit === "IU"
      ? r.unit
      : resolveReconstitutionUnit(product)

  return { enabled: true, unit, isBlend: r.isBlend === true }
}

export function hasReconstitutionEnabled(
  product: HttpTypes.StoreProduct
): boolean {
  return readProductReconstitution(product) !== null
}

export type DoseUnit = "mcg" | "mg" | "IU"

export type DrawInput = {
  /** Vial content, in the config's unit (mg or IU). */
  vialAmount: number
  unit: ReconstitutionUnit
  /** BAC water added to the vial, ml. */
  bacMl: number
  dose: number
  /** mcg/mg in mg mode, IU in IU mode. */
  doseUnit: DoseUnit
  /** Syringe barrel volume, ml. Defaults to SYRINGE_ML (1 ml). */
  syringeMl?: number
}

export type DrawResult =
  | {
      ok: true
      drawMl: number
      units: number
      /** mg/ml in mg mode, IU/ml in IU mode. */
      concentrationPerMl: number
    }
  | { ok: false; reason: "no-water" | "invalid-input" | "exceeds-syringe" }

export function computeDraw(input: DrawInput): DrawResult {
  const { vialAmount, unit, bacMl, dose, doseUnit, syringeMl = SYRINGE_ML } = input

  if (
    !Number.isFinite(vialAmount) ||
    !Number.isFinite(bacMl) ||
    !Number.isFinite(dose) ||
    vialAmount <= 0 ||
    dose <= 0
  ) {
    return { ok: false, reason: "invalid-input" }
  }
  // Mismatched dose unit for the mode is a programming error, not user input,
  // but still must never divide into a wrong number.
  if (unit === "mg" ? doseUnit === "IU" : doseUnit !== "IU") {
    return { ok: false, reason: "invalid-input" }
  }
  if (bacMl <= 0) {
    return { ok: false, reason: "no-water" }
  }

  let drawMl: number
  let concentrationPerMl: number
  if (unit === "mg") {
    const doseMg = doseUnit === "mcg" ? dose / 1000 : dose
    concentrationPerMl = vialAmount / bacMl
    drawMl = doseMg / concentrationPerMl
  } else {
    // IU mode (HGH): vial and dose are both in IU — never converted to mg.
    concentrationPerMl = vialAmount / bacMl
    drawMl = (dose / vialAmount) * bacMl
  }

  if (drawMl > syringeMl) {
    return { ok: false, reason: "exceeds-syringe" }
  }

  return { ok: true, drawMl, units: drawMl * SYRINGE_UNITS, concentrationPerMl }
}

/**
 * Informational mg-equivalent of an IU dose (display only — never feeds the
 * draw math). Returns null when the factor is unusable.
 */
export function mgEquivalent(doseIU: number, iuPerMg: number): number | null {
  if (
    !Number.isFinite(doseIU) ||
    !Number.isFinite(iuPerMg) ||
    doseIU <= 0 ||
    iuPerMg <= 0
  ) {
    return null
  }
  return doseIU / iuPerMg
}

/** Display rounding: syringe units to 1 decimal, trailing .0 dropped ("20", "5.6"). */
export function formatUnits(units: number): string {
  return String(Math.round(units * 10) / 10)
}

/** Display rounding: ml to 3 decimals max ("0.2", "0.056"). */
export function formatMl(ml: number): string {
  return String(Math.round(ml * 1000) / 1000)
}
