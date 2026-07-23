import { test } from "node:test"
import assert from "node:assert/strict"
import {
  DEFAULT_IU_PER_MG,
  computeDraw,
  formatMl,
  formatUnits,
  hasReconstitutionEnabled,
  mgEquivalent,
  readProductReconstitution,
  resolveReconstitutionUnit,
} from "./reconstitution"

// --- computeDraw: worked examples from the spec (must be exact) ---

test("spec worked example, mg mode: 5 mg vial + 2 ml BAC, 500 mcg dose → 0.20 ml / 20 units", () => {
  const result = computeDraw({
    vialAmount: 5,
    unit: "mg",
    bacMl: 2,
    dose: 500,
    doseUnit: "mcg",
  })
  assert.ok(result.ok)
  assert.equal(result.drawMl, 0.2)
  assert.equal(result.units, 20)
  assert.equal(result.concentrationPerMl, 2.5)
})

test("mg mode: dose entered in mg matches its mcg equivalent", () => {
  const inMg = computeDraw({
    vialAmount: 5,
    unit: "mg",
    bacMl: 2,
    dose: 0.5,
    doseUnit: "mg",
  })
  const inMcg = computeDraw({
    vialAmount: 5,
    unit: "mg",
    bacMl: 2,
    dose: 500,
    doseUnit: "mcg",
  })
  assert.ok(inMg.ok && inMcg.ok)
  assert.equal(inMg.drawMl, inMcg.drawMl)
  assert.equal(inMg.units, inMcg.units)
})

test("spec worked example, IU mode: 36 IU vial + 1 ml BAC, 2 IU dose → 5.6 units", () => {
  const result = computeDraw({
    vialAmount: 36,
    unit: "IU",
    bacMl: 1,
    dose: 2,
    doseUnit: "IU",
  })
  assert.ok(result.ok)
  assert.equal(formatUnits(result.units), "5.6")
  assert.equal(formatMl(result.drawMl), "0.056")
})

// --- computeDraw: guard rails ---

test("bacMl = 0 → no-water, never NaN/Infinity", () => {
  const result = computeDraw({
    vialAmount: 5,
    unit: "mg",
    bacMl: 0,
    dose: 500,
    doseUnit: "mcg",
  })
  assert.deepEqual(result, { ok: false, reason: "no-water" })
})

test("negative bacMl → no-water", () => {
  const result = computeDraw({
    vialAmount: 36,
    unit: "IU",
    bacMl: -1,
    dose: 2,
    doseUnit: "IU",
  })
  assert.deepEqual(result, { ok: false, reason: "no-water" })
})

test("draw over 1 ml (U-100 syringe volume) → exceeds-syringe, no raw number", () => {
  // 5 mg vial in 5 ml → 1 mg/ml; 2 mg dose → 2 ml draw.
  const result = computeDraw({
    vialAmount: 5,
    unit: "mg",
    bacMl: 5,
    dose: 2,
    doseUnit: "mg",
  })
  assert.deepEqual(result, { ok: false, reason: "exceeds-syringe" })
})

test("syringe volume parameter: a 0.4 ml draw exceeds a 0.3 ml syringe but fits 0.5 and 1.0", () => {
  // 5 mg in 5 ml = 1 mg/ml; 0.4 mg dose = 0.4 ml draw.
  const input = { vialAmount: 5, unit: "mg" as const, bacMl: 5, dose: 0.4, doseUnit: "mg" as const }
  assert.deepEqual(computeDraw({ ...input, syringeMl: 0.3 }), {
    ok: false,
    reason: "exceeds-syringe",
  })
  for (const syringeMl of [0.5, 1.0]) {
    const result = computeDraw({ ...input, syringeMl })
    assert.ok(result.ok, `syringeMl=${syringeMl}`)
    assert.equal(result.units, 40)
  }
})

test("draw of exactly the syringe volume is still a valid result (0.3 ml boundary)", () => {
  // 5 mg in 5 ml = 1 mg/ml; 0.3 mg dose = 0.3 ml draw.
  const result = computeDraw({
    vialAmount: 5,
    unit: "mg",
    bacMl: 5,
    dose: 0.3,
    doseUnit: "mg",
    syringeMl: 0.3,
  })
  assert.ok(result.ok)
  assert.equal(result.units, 30)
})

test("draw of exactly 1 ml (100 units) is still a valid result", () => {
  const result = computeDraw({
    vialAmount: 5,
    unit: "mg",
    bacMl: 1,
    dose: 5,
    doseUnit: "mg",
  })
  assert.ok(result.ok)
  assert.equal(result.units, 100)
})

test("non-numeric and negative doses → invalid-input", () => {
  for (const dose of [NaN, Infinity, -500, 0]) {
    const result = computeDraw({
      vialAmount: 5,
      unit: "mg",
      bacMl: 2,
      dose,
      doseUnit: "mcg",
    })
    assert.deepEqual(result, { ok: false, reason: "invalid-input" }, `dose=${dose}`)
  }
})

test("non-finite bacMl or vialAmount → invalid-input", () => {
  assert.deepEqual(
    computeDraw({ vialAmount: 5, unit: "mg", bacMl: NaN, dose: 500, doseUnit: "mcg" }),
    { ok: false, reason: "invalid-input" }
  )
  assert.deepEqual(
    computeDraw({ vialAmount: 0, unit: "mg", bacMl: 2, dose: 500, doseUnit: "mcg" }),
    { ok: false, reason: "invalid-input" }
  )
})

test("dose unit mismatched with mode → invalid-input, never a wrong number", () => {
  assert.deepEqual(
    computeDraw({ vialAmount: 5, unit: "mg", bacMl: 2, dose: 2, doseUnit: "IU" }),
    { ok: false, reason: "invalid-input" }
  )
  assert.deepEqual(
    computeDraw({ vialAmount: 36, unit: "IU", bacMl: 1, dose: 500, doseUnit: "mcg" }),
    { ok: false, reason: "invalid-input" }
  )
})

// --- mg-equivalent (IU mode, informational only) ---

test("mg-equivalent with the default factor of 3: 6 IU → 2 mg", () => {
  assert.equal(DEFAULT_IU_PER_MG, 3)
  assert.equal(mgEquivalent(6, DEFAULT_IU_PER_MG), 2)
})

test("editing the IU factor changes the mg-equivalent (2.8 IU/mg label case)", () => {
  assert.equal(mgEquivalent(5.6, 2.8), 2)
})

test("unusable IU factor or dose → null, not NaN", () => {
  assert.equal(mgEquivalent(6, 0), null)
  assert.equal(mgEquivalent(6, -3), null)
  assert.equal(mgEquivalent(6, NaN), null)
  assert.equal(mgEquivalent(0, 3), null)
})

// --- resolveReconstitutionUnit (mg vs IU mode detection) ---

function product(opts: {
  reconstitution?: unknown
  categories?: { handle: string; parentHandle?: string }[]
  class?: string
  active_ingredient?: string
}) {
  return {
    id: "prod_1",
    metadata: {
      ...(opts.reconstitution !== undefined
        ? { reconstitution: opts.reconstitution }
        : {}),
      ...(opts.class !== undefined ? { class: opts.class } : {}),
      ...(opts.active_ingredient !== undefined
        ? { active_ingredient: opts.active_ingredient }
        : {}),
    },
    categories: (opts.categories ?? []).map((c) => ({
      handle: c.handle,
      parent_category: c.parentHandle ? { handle: c.parentHandle } : null,
    })),
  } as any
}

test("HGH is detected as IU via its root category handle 'hgh'", () => {
  assert.equal(
    resolveReconstitutionUnit(product({ categories: [{ handle: "hgh" }] })),
    "IU"
  )
  // even nested under the hgh root
  assert.equal(
    resolveReconstitutionUnit(
      product({ categories: [{ handle: "somatropin", parentHandle: "hgh" }] })
    ),
    "IU"
  )
})

test("HGH is detected as IU via class or active_ingredient metadata", () => {
  assert.equal(
    resolveReconstitutionUnit(product({ class: "HGH & Peptides" })),
    "IU"
  )
  assert.equal(
    resolveReconstitutionUnit(product({ active_ingredient: "HGH" })),
    "IU"
  )
})

test("a peptide (no HGH signal) resolves to mg", () => {
  assert.equal(
    resolveReconstitutionUnit(
      product({ categories: [{ handle: "peptides" }], class: "Peptides" })
    ),
    "mg"
  )
  assert.equal(resolveReconstitutionUnit(product({})), "mg")
})

// --- readProductReconstitution / hasReconstitutionEnabled (product-level gate) ---

test("enabled product resolves unit automatically, isBlend defaults to false", () => {
  assert.deepEqual(
    readProductReconstitution(
      product({ reconstitution: { enabled: true }, categories: [{ handle: "peptides" }] })
    ),
    { enabled: true, unit: "mg", isBlend: false }
  )
  assert.deepEqual(
    readProductReconstitution(
      product({ reconstitution: { enabled: true }, categories: [{ handle: "hgh" }] })
    ),
    { enabled: true, unit: "IU", isBlend: false }
  )
})

test("explicit unit overrides auto-detection", () => {
  assert.equal(
    readProductReconstitution(
      product({ reconstitution: { enabled: true, unit: "IU" } })
    )?.unit,
    "IU"
  )
  // garbage unit falls back to auto (mg here)
  assert.equal(
    readProductReconstitution(
      product({ reconstitution: { enabled: true, unit: "iu" } })
    )?.unit,
    "mg"
  )
})

test("isBlend passes through only when exactly true", () => {
  assert.equal(
    readProductReconstitution(
      product({ reconstitution: { enabled: true, isBlend: true } })
    )?.isBlend,
    true
  )
  assert.equal(
    readProductReconstitution(
      product({ reconstitution: { enabled: true, isBlend: "yes" } })
    )?.isBlend,
    false
  )
})

test("disabled, missing, or malformed reconstitution reads as null", () => {
  assert.equal(readProductReconstitution(product({})), null)
  assert.equal(readProductReconstitution(product({ reconstitution: "garbage" })), null)
  assert.equal(
    readProductReconstitution(product({ reconstitution: { enabled: false } })),
    null
  )
  assert.equal(
    readProductReconstitution(product({ reconstitution: { unit: "mg" } })),
    null
  )
})

test("hasReconstitutionEnabled mirrors the product-level gate", () => {
  assert.equal(
    hasReconstitutionEnabled(product({ reconstitution: { enabled: true } })),
    true
  )
  assert.equal(hasReconstitutionEnabled(product({})), false)
  assert.equal(hasReconstitutionEnabled({ id: "prod_1" } as any), false)
})

// --- display rounding ---

test("formatUnits drops trailing .0 and rounds to 1 decimal", () => {
  assert.equal(formatUnits(20), "20")
  assert.equal(formatUnits(5.5555555), "5.6")
})

test("formatMl rounds to 3 decimals", () => {
  assert.equal(formatMl(0.2), "0.2")
  assert.equal(formatMl(0.0555555), "0.056")
})
