import { test } from "node:test"
import assert from "node:assert/strict"
import { classifyOptionValue, FORM_LABELS } from "./resolve-variant-form.ts"

test("value keyword wins: tablets", () => {
  assert.equal(classifyOptionValue("100 tabs"), "tablets")
  assert.equal(classifyOptionValue("100 tablets"), "tablets")
  assert.equal(classifyOptionValue("50 tabs", "Injectable"), "tablets")
})

test("value keyword wins: ampoule", () => {
  assert.equal(classifyOptionValue("1ml amp"), "ampoule")
  assert.equal(classifyOptionValue("1ml amps"), "ampoule")
  assert.equal(classifyOptionValue("10 ampoules"), "ampoule")
  assert.equal(classifyOptionValue("10amp x 2ml"), "ampoule")
})

test("value keyword wins: vial-like (vial, kit, pen)", () => {
  assert.equal(classifyOptionValue("10ml Vial"), "vial")
  assert.equal(classifyOptionValue("5 vials × 5 mg"), "vial")
  assert.equal(classifyOptionValue("50 mg kit"), "vial")
  assert.equal(classifyOptionValue("30 mg Premixed Pen"), "vial")
})

test("falls back to metadata.form when the value says nothing", () => {
  assert.equal(classifyOptionValue("10mg", "Oral"), "tablets")
  assert.equal(classifyOptionValue("250mg/ml", "Injectable"), "vial")
})

test("unclassifiable value with no usable form returns null", () => {
  assert.equal(classifyOptionValue("250mg/ml"), null)
  assert.equal(classifyOptionValue("10mg", "N/A"), null)
  assert.equal(classifyOptionValue("10mg", undefined), null)
  assert.equal(classifyOptionValue("10mg", 42), null)
})

test("every form has a display label", () => {
  assert.equal(FORM_LABELS.tablets, "Tablets")
  assert.equal(FORM_LABELS.ampoule, "Ampoules")
  assert.equal(FORM_LABELS.vial, "Vials")
})
