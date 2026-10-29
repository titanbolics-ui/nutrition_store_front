import { test, afterEach } from "node:test"
import assert from "node:assert/strict"
import * as React from "react"
import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { PathParamsContext } from "next/dist/shared/lib/hooks-client-context.shared-runtime"
import ProductRail, { RailProduct } from "./index.tsx"

afterEach(() => cleanup())

const products: RailProduct[] = [
  {
    title: "Testosterone Enanthate 250mg/ml 10ml ZPHC",
    thumbnail: "/a.png",
    handle: "test-e",
    price: "$52.00",
    stockState: "in_stock",
  },
  {
    title: "Anavar [Spectrum Pharma]",
    thumbnail: "/b.png",
    handle: "anavar",
    price: "$80.00",
    stockState: "low_stock",
  },
  {
    title: "Masteron 100",
    thumbnail: "/c.png",
    handle: "masteron",
    price: null,
    stockState: "out_of_stock",
  },
]

function renderRail(items: RailProduct[] = products) {
  return render(
    <PathParamsContext.Provider value={{ countryCode: "us" }}>
      <ProductRail products={items} />
    </PathParamsContext.Provider>
  )
}

test("renders a catalog-grade card per product with stock labels", () => {
  renderRail()
  const cards = screen.getAllByTestId("rail-card")
  assert.equal(cards.length, 3)
  assert.match(cards[0].textContent!, /In Stock/)
  assert.match(cards[1].textContent!, /Low Stock/)
  assert.match(cards[2].textContent!, /Out of Stock/)
  assert.match(cards[0].textContent!, /\$52\.00/)
  assert.equal(
    cards[0].getAttribute("href"),
    "/us/products/test-e"
  )
})

test("renders nothing for an empty list", () => {
  const { container } = renderRail([])
  assert.equal(container.innerHTML, "")
})

test("arrow clicks are safe in environments without scrollBy", () => {
  renderRail()
  fireEvent.click(screen.getByTestId("rail-next"))
  fireEvent.click(screen.getByTestId("rail-prev"))
  assert.equal(screen.getAllByTestId("rail-card").length, 3)
})
