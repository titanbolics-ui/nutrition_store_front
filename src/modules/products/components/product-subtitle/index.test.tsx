import { test, afterEach } from "node:test"
import assert from "node:assert/strict"
import * as React from "react"
import { cleanup, render, screen } from "@testing-library/react"
import ProductSubtitle from "./index.tsx"

afterEach(() => {
  cleanup()
})

function product(metadata: Record<string, unknown> | null) {
  return { id: "prod_1", title: "Oxandrolone ZPHC", metadata } as any
}

test("active ingredient renders as a pill, aliases as chips", () => {
  render(
    <ProductSubtitle
      product={product({
        active_ingredient: "Oxandrolone",
        content: { type: "compound", alsoKnownAs: ["Anavar", "Var"] },
      })}
    />
  )
  assert.equal(screen.getByTestId("active-ingredient").textContent, "Oxandrolone")
  const chips = screen.getAllByTestId("aka-chip").map((c) => c.textContent)
  assert.deepEqual(chips, ["Anavar", "Var"])
})

test("ingredient only renders the pill, no chips", () => {
  render(
    <ProductSubtitle
      product={product({ active_ingredient: "Tirzepatide" })}
    />
  )
  assert.equal(screen.getByTestId("active-ingredient").textContent, "Tirzepatide")
  assert.equal(screen.queryByTestId("aka-chip"), null)
})

test("aliases only render chips, even if other content sections are incomplete", () => {
  render(
    <ProductSubtitle
      product={product({ content: { alsoKnownAs: ["Anavar"] } })}
    />
  )
  assert.equal(screen.queryByTestId("active-ingredient"), null)
  const chips = screen.getAllByTestId("aka-chip").map((c) => c.textContent)
  assert.deepEqual(chips, ["Anavar"])
})

test("neither source renders nothing", () => {
  const { container } = render(<ProductSubtitle product={product(null)} />)
  assert.equal(container.textContent, "")

  cleanup()
  const { container: c2 } = render(
    <ProductSubtitle
      product={product({ active_ingredient: "  ", content: { alsoKnownAs: [] } })}
    />
  )
  assert.equal(c2.textContent, "")
})
