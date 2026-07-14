import { test, afterEach } from "node:test"
import assert from "node:assert/strict"
import * as React from "react"
import { cleanup, render, screen } from "@testing-library/react"
import ProductInfoAccordions from "./index.tsx"

afterEach(() => {
  cleanup()
})

function product(metadata: Record<string, unknown>) {
  return { id: "prod_1", metadata } as any
}

test("no spec metadata: no Specifications row, Shipping still renders", () => {
  render(<ProductInfoAccordions product={product({})} />)
  assert.equal(screen.queryByText("Specifications"), null)
  assert.ok(screen.getByText("Shipping & Delivery"))
})

test("spec metadata present: both Shipping and Specifications render, Shipping first", () => {
  render(<ProductInfoAccordions product={product({ manufacturer: "Acme Labs" })} />)
  const shipping = screen.getByText("Shipping & Delivery")
  const specs = screen.getByText("Specifications")
  assert.ok(
    shipping.compareDocumentPosition(specs) & Node.DOCUMENT_POSITION_FOLLOWING,
    "Shipping & Delivery must come before Specifications"
  )
})

test("collapsed content is still mounted in the DOM (SEO)", () => {
  render(<ProductInfoAccordions product={product({ manufacturer: "Acme Labs" })} />)
  // Nothing is expanded by default, yet the content must be in the HTML.
  assert.ok(screen.getByText("Discreet Shipping"))
  assert.ok(screen.getByText("Acme Labs"))
})
