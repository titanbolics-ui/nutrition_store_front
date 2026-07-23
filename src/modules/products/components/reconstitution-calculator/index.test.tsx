import { test, afterEach } from "node:test"
import assert from "node:assert/strict"
import * as React from "react"
import { cleanup, render, screen, fireEvent, within } from "@testing-library/react"
import ReconstitutionCalculator from "./index.tsx"

afterEach(() => {
  cleanup()
})

// Product-level fixtures: the gate + mode live on product metadata now, and the
// vial amount is user-entered (chips + Other), not read from variants.

function mgProduct(reconstitution: unknown = { enabled: true }) {
  return {
    id: "prod_1",
    metadata: { reconstitution },
    categories: [{ handle: "peptides", parent_category: null }],
  } as any
}

function iuProduct(reconstitution: unknown = { enabled: true }) {
  return {
    id: "prod_hgh",
    metadata: { reconstitution, class: "HGH & Peptides", active_ingredient: "HGH" },
    categories: [{ handle: "hgh", parent_category: null }],
  } as any
}

const blendProduct = () => mgProduct({ enabled: true, isBlend: true })

function fill(field: HTMLElement, value: string) {
  fireEvent.change(field, { target: { value } })
}

const vialGroup = () => within(screen.getByTestId("vial-group"))
const waterGroup = () => within(screen.getByTestId("water-group"))
const doseGroup = () => within(screen.getByTestId("dose-group"))

test("mg defaults (5 mg vial + 2 ml + 500 mcg) show the worked example instantly", () => {
  const { container } = render(<ReconstitutionCalculator product={mgProduct()} />)
  const text = container.textContent ?? ""
  assert.match(text, /How many mg are in your vial\?/)
  assert.match(text, /Your vial concentration is 2\.5 mg\/ml/)
  assert.match(text, /To achieve 500 mcg \(0\.5 mg\), draw 0\.2 ml \(20 units on a U-100 syringe\)/)
})

test("vial chip changes the concentration (10 mg vial → 5 mg/ml, 10 units)", () => {
  const { container } = render(<ReconstitutionCalculator product={mgProduct()} />)
  fireEvent.click(vialGroup().getByRole("button", { name: "10 mg" }))
  const text = container.textContent ?? ""
  // 10 mg in 2 ml = 5 mg/ml; 500 mcg = 0.5 mg → 0.1 ml = 10 units.
  assert.match(text, /concentration is 5 mg\/ml/)
  assert.match(text, /draw 0\.1 ml \(10 units/)
})

test("Other vial reveals a custom field; 500 mg NAD-shaped vial computes", () => {
  const { container } = render(<ReconstitutionCalculator product={mgProduct()} />)
  fireEvent.click(vialGroup().getByRole("button", { name: "Other" }))
  fill(screen.getByLabelText("Custom vial amount (mg)"), "500")
  // 500 mg in 2 ml = 250 mg/ml; 500 mcg = 0.5 mg → 0.002 ml.
  assert.match(container.textContent ?? "", /concentration is 250 mg\/ml/)
  assert.doesNotMatch(container.textContent ?? "", /NaN|Infinity/)
})

test("empty Other vial shows a prompt, no NaN", () => {
  const { container } = render(<ReconstitutionCalculator product={mgProduct()} />)
  fireEvent.click(vialGroup().getByRole("button", { name: "Other" }))
  assert.ok(screen.getByText("Enter how many mg are in your vial to see your draw."))
  assert.doesNotMatch(container.textContent ?? "", /NaN|Infinity/)
})

test("clicking a water preset chip recomputes (1 ml → 5 mg/ml, 10 units)", () => {
  const { container } = render(<ReconstitutionCalculator product={mgProduct()} />)
  fireEvent.click(waterGroup().getByRole("button", { name: "1 ml" }))
  const text = container.textContent ?? ""
  assert.match(text, /concentration is 5 mg\/ml/)
  assert.match(text, /draw 0\.1 ml \(10 units/)
})

test("Other water reveals a custom input; comma decimals accepted", () => {
  const { container } = render(<ReconstitutionCalculator product={mgProduct()} />)
  fireEvent.click(waterGroup().getByRole("button", { name: "Other" }))
  assert.ok(screen.getByText("Enter the BAC water volume to see your draw."))
  fill(screen.getByLabelText("Custom water volume (ml)"), "2,0")
  assert.match(container.textContent ?? "", /draw 0\.2 ml \(20 units/)
  assert.doesNotMatch(container.textContent ?? "", /NaN|Infinity/)
})

test("Other dose reveals input + mcg/mg toggle; 0.5 mg equals the 500 mcg preset", () => {
  const { container } = render(<ReconstitutionCalculator product={mgProduct()} />)
  fireEvent.click(doseGroup().getByRole("button", { name: "Other" }))
  assert.ok(screen.getByText("Enter your desired dose to see your draw."))
  fill(screen.getByLabelText("Custom dose"), "0.5")
  fireEvent.click(screen.getByRole("button", { name: "mg", exact: true }))
  assert.match(container.textContent ?? "", /draw 0\.2 ml \(20 units/)
})

test("water 0 via Other shows the no-water guard, no NaN", () => {
  const { container } = render(<ReconstitutionCalculator product={mgProduct()} />)
  fireEvent.click(waterGroup().getByRole("button", { name: "Other" }))
  fill(screen.getByLabelText("Custom water volume (ml)"), "0")
  assert.ok(screen.getByText("Water volume must be above 0 ml."))
  assert.doesNotMatch(container.textContent ?? "", /NaN|Infinity/)
})

test("non-numeric Other input shows the invalid-input guard, no NaN", () => {
  const { container } = render(<ReconstitutionCalculator product={mgProduct()} />)
  fireEvent.click(waterGroup().getByRole("button", { name: "Other" }))
  fill(screen.getByLabelText("Custom water volume (ml)"), "abc")
  assert.ok(screen.getByText("Enter valid positive numbers."))
  assert.doesNotMatch(container.textContent ?? "", /NaN|Infinity/)
})

test("dose exceeding the syringe shows the amber warning and no unit number", () => {
  const { container } = render(<ReconstitutionCalculator product={mgProduct()} />)
  // 5 mg in 5 ml = 1 mg/ml; 2.5 mg preset = 2.5 ml draw > 1 ml syringe.
  fireEvent.click(waterGroup().getByRole("button", { name: "5 ml" }))
  fireEvent.click(doseGroup().getByRole("button", { name: "2.5 mg" }))
  assert.match(
    container.textContent ?? "",
    /Dose exceeds the 1\.0 ml syringe — add more water, lower the dose, or pick a bigger syringe\./
  )
  assert.doesNotMatch(container.textContent ?? "", /250 units|draw 2\.5 ml/)
})

test("syringe selector: 0.3 ml makes a 0.4 ml draw exceed and rescales the ruler", () => {
  const { container } = render(<ReconstitutionCalculator product={mgProduct()} />)
  // default 5 mg vial + 2 ml water → 2.5 mg/ml; 1 mg dose = 0.4 ml draw. Fits 1.0 ml.
  fireEvent.click(doseGroup().getByRole("button", { name: "1 mg" }))
  assert.match(container.textContent ?? "", /draw 0\.4 ml \(40 units/)
  fireEvent.click(screen.getByRole("button", { name: "0.3 ml" }))
  assert.match(container.textContent ?? "", /Dose exceeds the 0\.3 ml syringe/)
  assert.match(container.textContent ?? "", /30 units = 0\.3 ml/)
})

test("HGH product renders in IU mode with a 140 IU default vial and factor 3", () => {
  const { container } = render(<ReconstitutionCalculator product={iuProduct()} />)
  assert.match(container.textContent ?? "", /How many IU are in your vial\?/)
  assert.equal(vialGroup().getByRole("button", { name: "140 IU" }).getAttribute("aria-pressed"), "true")
  assert.match(container.textContent ?? "", /To achieve 2 IU/)
  assert.equal(
    (screen.getByLabelText("IU per mg (from product label)") as HTMLInputElement).value,
    "3"
  )
})

test("IU worked example via Other vial (36 IU + 1 ml + 2 IU → 5.6 units)", () => {
  const { container } = render(<ReconstitutionCalculator product={iuProduct()} />)
  fireEvent.click(vialGroup().getByRole("button", { name: "Other" }))
  fill(screen.getByLabelText("Custom vial amount (IU)"), "36")
  fireEvent.click(waterGroup().getByRole("button", { name: "1 ml" }))
  assert.match(
    container.textContent ?? "",
    /To achieve 2 IU \(≈ 0\.667 mg at 3 IU\/mg\), draw 0\.056 ml \(5\.6 units/
  )
})

test("editing the IU factor changes the mg-equivalent display", () => {
  const { container } = render(<ReconstitutionCalculator product={iuProduct()} />)
  fireEvent.click(doseGroup().getByRole("button", { name: "Other" }))
  fill(screen.getByLabelText("Custom dose"), "5.6")
  fill(screen.getByLabelText("IU per mg (from product label)"), "2.8")
  assert.match(container.textContent ?? "", /5\.6 IU \(≈ 2 mg at 2\.8 IU\/mg\)/)
})

test("blend product shows the note and labels the result as total draw", () => {
  const { container } = render(<ReconstitutionCalculator product={blendProduct()} />)
  const text = container.textContent ?? ""
  assert.match(text, /not a single-component dose/)
  assert.match(text, /How much total do you want in each dose\?/)
  // 5 mg default vial in 2 ml = 2.5 mg/ml; 500 mcg → 0.2 ml total.
  assert.match(text, /draw 0\.2 ml total \(20 units/)
})

test("disclaimer is always present", () => {
  render(<ReconstitutionCalculator product={mgProduct()} />)
  assert.ok(
    screen.getByText("For research calculation purposes. Not medical advice.")
  )
})

test("no product-level reconstitution renders nothing", () => {
  const { container } = render(
    <ReconstitutionCalculator product={mgProduct({ enabled: false })} />
  )
  assert.equal(container.innerHTML, "")
})
