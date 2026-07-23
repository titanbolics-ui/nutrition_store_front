import { test, afterEach, beforeEach, mock } from "node:test"
import assert from "node:assert/strict"
import * as React from "react"
import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { AppRouterContext } from "next/dist/shared/lib/app-router-context.shared-runtime"
import {
  PathnameContext,
  SearchParamsContext,
} from "next/dist/shared/lib/hooks-client-context.shared-runtime"
import BrandFilter from "./index.tsx"

afterEach(() => cleanup())

const brands = [
  { id: "ptyp_1", value: "ZPHC", slug: "zphc" },
  { id: "ptyp_2", value: "Spectrum Pharma", slug: "spectrum-pharma" },
  { id: "ptyp_3", value: "CanadaBioLabs", slug: "canadabiolabs" },
]

let pushed: string[] = []
const routerStub: any = {
  push: (href: string) => pushed.push(href),
  replace: mock.fn(),
  refresh: mock.fn(),
  back: mock.fn(),
  forward: mock.fn(),
  prefetch: mock.fn(),
}

beforeEach(() => {
  pushed = []
})

function renderFilter(search = "") {
  render(
    <AppRouterContext.Provider value={routerStub}>
      <PathnameContext.Provider value="/us/store">
        <SearchParamsContext.Provider value={new URLSearchParams(search) as any}>
          <BrandFilter brands={brands} />
        </SearchParamsContext.Provider>
      </PathnameContext.Provider>
    </AppRouterContext.Provider>
  )
}

test("renders a chip per brand plus the In Stock toggle", () => {
  renderFilter()
  const chips = screen.getAllByTestId("brand-filter-chip")
  assert.equal(chips.length, 3)
  assert.deepEqual(
    chips.map((c) => c.textContent),
    ["ZPHC", "Spectrum Pharma", "CanadaBioLabs"]
  )
  assert.ok(screen.getByTestId("in-stock-toggle"))
})

test("clicking a brand sets ?brand=<slug>", () => {
  renderFilter()
  fireEvent.click(screen.getByText("ZPHC"))
  assert.deepEqual(pushed, ["/us/store?brand=zphc"])
})

test("clicking the active brand clears the filter", () => {
  renderFilter("brand=zphc")
  const [zphc] = screen.getAllByTestId("brand-filter-chip")
  assert.equal(zphc.dataset.active, "true")
  fireEvent.click(zphc)
  assert.deepEqual(pushed, ["/us/store"])
})

test("brands are mutually exclusive — picking another replaces the current one", () => {
  renderFilter("brand=zphc")
  fireEvent.click(screen.getByText("CanadaBioLabs"))
  assert.deepEqual(pushed, ["/us/store?brand=canadabiolabs"])
})

test("In Stock toggle sets and clears ?stock=in independently of brand", () => {
  renderFilter("brand=zphc")
  fireEvent.click(screen.getByTestId("in-stock-toggle"))
  assert.deepEqual(pushed, ["/us/store?brand=zphc&stock=in"])

  cleanup()
  renderFilter("brand=zphc&stock=in")
  assert.equal(screen.getByTestId("in-stock-toggle").dataset.active, "true")
  fireEvent.click(screen.getByTestId("in-stock-toggle"))
  assert.deepEqual(pushed.at(-1), "/us/store?brand=zphc")
})

test("changing a filter drops the stale page param", () => {
  renderFilter("page=4&sortBy=price_asc")
  fireEvent.click(screen.getByText("ZPHC"))
  assert.deepEqual(pushed, ["/us/store?sortBy=price_asc&brand=zphc"])
})
