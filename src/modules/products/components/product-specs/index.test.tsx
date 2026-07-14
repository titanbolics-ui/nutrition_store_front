import { test, afterEach } from "node:test"
import assert from "node:assert/strict"
import * as React from "react"
import { cleanup, render, screen } from "@testing-library/react"
import ProductSpecs, { hasAvailableSpecs } from "./index.tsx"

afterEach(() => {
  cleanup()
})

function product(metadata: Record<string, unknown>) {
  return { id: "prod_1", metadata } as any
}

test("hasAvailableSpecs is false when no spec metadata exists", () => {
  assert.equal(hasAvailableSpecs(product({})), false)
})

test("hasAvailableSpecs is true for flat metadata fields", () => {
  assert.equal(hasAvailableSpecs(product({ manufacturer: "Acme Labs" })), true)
})

test("hasAvailableSpecs is true for nested specs JSON", () => {
  assert.equal(
    hasAvailableSpecs(product({ specs: JSON.stringify({ form: "Vial" }) })),
    true
  )
})

test("ProductSpecs renders null when no specs exist", () => {
  const { container } = render(<ProductSpecs product={product({})} />)
  assert.equal(container.innerHTML, "")
})

test("ProductSpecs renders rows with no label/value collision", () => {
  render(<ProductSpecs product={product({ manufacturer: "Acme Labs" })} />)
  assert.ok(screen.getByText("Manufacturer"))
  assert.ok(screen.getByText("Acme Labs"))
})
