import { test, afterEach } from "node:test"
import assert from "node:assert/strict"
import { cleanup, render, screen } from "@testing-library/react"
import ProductInfo from "./index.tsx"

afterEach(() => cleanup())

function product(overrides: Record<string, any> = {}): any {
  return {
    id: "prod_1",
    title: "Oxandrolone ZPHC",
    metadata: {},
    ...overrides,
  }
}

test("brand badge renders near the title from product.type.value", () => {
  render(<ProductInfo product={product({ type: { id: "ptyp_1", value: "ZPHC" } })} />)
  const badge = screen.getByTestId("brand-badge")
  assert.equal(badge.textContent, "ZPHC")
})

test("no brand badge when the product has no type", () => {
  render(<ProductInfo product={product()} />)
  assert.equal(screen.queryByTestId("brand-badge"), null)
})
