import { test, afterEach } from "node:test"
import assert from "node:assert/strict"
import * as React from "react"
import { cleanup, render, screen } from "@testing-library/react"
import SeverityIndicator, { deriveSeverity } from "./index.tsx"

afterEach(() => {
  cleanup()
})

test("deriveSeverity recognizes each level", () => {
  assert.equal(deriveSeverity("None"), "none")
  assert.equal(deriveSeverity("Mild"), "low")
  assert.equal(deriveSeverity("Moderate"), "moderate")
  assert.equal(deriveSeverity("Severe"), "high")
})

test("deriveSeverity returns null for unrecognized text", () => {
  assert.equal(deriveSeverity("Partial"), null)
  assert.equal(deriveSeverity("Depends on dosage"), null)
})

test("known keyword renders raw text plus a mini-bar", () => {
  const { container } = render(
    <SeverityIndicator label="Estrogenic" value="Moderate" />
  )
  assert.ok(screen.getByText("Estrogenic"))
  assert.ok(screen.getByText("Moderate"))
  assert.ok(container.querySelector('[aria-hidden="true"]'))
})

test("unrecognized text falls back to plain text, no indicator invented", () => {
  render(<SeverityIndicator label="Estrogenic" value="Depends on dosage" />)
  assert.ok(screen.getByText("Estrogenic"))
  assert.ok(screen.getByText("Depends on dosage"))
})
