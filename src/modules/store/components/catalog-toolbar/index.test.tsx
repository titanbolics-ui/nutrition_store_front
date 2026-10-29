import { test, afterEach, beforeEach, mock } from "node:test"
import assert from "node:assert/strict"
import * as React from "react"
import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { AppRouterContext } from "next/dist/shared/lib/app-router-context.shared-runtime"
import {
  PathnameContext,
  SearchParamsContext,
} from "next/dist/shared/lib/hooks-client-context.shared-runtime"
import CatalogToolbar from "./index.tsx"
import type { SortOptions } from "@modules/store/components/refinement-list/sort-products"

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

function renderToolbar(search = "", sortBy: SortOptions = "featured") {
  render(
    <AppRouterContext.Provider value={routerStub}>
      <PathnameContext.Provider value="/us/store">
        <SearchParamsContext.Provider value={new URLSearchParams(search) as any}>
          <CatalogToolbar brands={brands} count={42} sortBy={sortBy} />
        </SearchParamsContext.Provider>
      </PathnameContext.Provider>
    </AppRouterContext.Provider>
  )
}

test("renders All + one chip per brand; All is active without a brand param", () => {
  renderToolbar()
  const chips = screen.getAllByTestId("brand-filter-chip")
  assert.deepEqual(
    chips.map((c) => c.textContent),
    ["All", "ZPHC", "Spectrum Pharma", "CanadaBioLabs"]
  )
  assert.equal(chips[0].dataset.active, "true")
  assert.ok(screen.getByTestId("in-stock-toggle"))
})

test("clicking a brand chip sets ?brand=<slug>", () => {
  renderToolbar()
  fireEvent.click(screen.getByText("ZPHC"))
  assert.deepEqual(pushed, ["/us/store?brand=zphc"])
})

test("clicking the active brand chip clears the filter", () => {
  renderToolbar("brand=zphc")
  const zphc = screen
    .getAllByTestId("brand-filter-chip")
    .find((c) => c.textContent === "ZPHC")!
  assert.equal(zphc.dataset.active, "true")
  fireEvent.click(zphc)
  assert.deepEqual(pushed, ["/us/store"])
})

test("In Stock switch sets and clears ?stock=in independently of brand", () => {
  renderToolbar("brand=zphc")
  fireEvent.click(screen.getByTestId("in-stock-toggle"))
  assert.deepEqual(pushed, ["/us/store?brand=zphc&stock=in"])

  cleanup()
  renderToolbar("brand=zphc&stock=in")
  assert.equal(screen.getByTestId("in-stock-toggle").dataset.active, "true")
  fireEvent.click(screen.getByTestId("in-stock-toggle"))
  assert.deepEqual(pushed.at(-1), "/us/store?brand=zphc")
})

test("changing a filter drops the stale page param", () => {
  renderToolbar("page=4&sortBy=price_asc")
  fireEvent.click(screen.getByText("ZPHC"))
  assert.deepEqual(pushed, ["/us/store?sortBy=price_asc&brand=zphc"])
})

test("desktop sort dropdown pushes ?sortBy=<value>", () => {
  renderToolbar()
  fireEvent.click(screen.getByTestId("sort-dropdown-button"))
  const options = screen.getAllByTestId("sort-option")
  assert.equal(options.length, 3)
  fireEvent.click(options[1])
  assert.deepEqual(pushed, ["/us/store?sortBy=price_asc"])
})

test("mobile filter button shows the active filter count and opens the sheet", () => {
  renderToolbar("brand=zphc&stock=in")
  assert.equal(screen.getByTestId("active-filter-count").textContent, "2")

  fireEvent.click(screen.getByTestId("mobile-filter-button"))
  assert.ok(screen.getByTestId("filter-sheet"))
  // Sheet radio rows: All brands + 3 brands
  const rows = screen.getAllByTestId("sheet-radio-row")
  assert.equal(rows.length, 4)
})

test("filter sheet applies a brand immediately and Clear all resets both filters", () => {
  renderToolbar("brand=zphc&stock=in&page=3")
  fireEvent.click(screen.getByTestId("mobile-filter-button"))

  const canada = screen
    .getAllByTestId("sheet-radio-row")
    .find((r) => r.textContent?.includes("CanadaBioLabs"))!
  fireEvent.click(canada)
  assert.deepEqual(pushed.at(-1), "/us/store?brand=canadabiolabs&stock=in")

  fireEvent.click(screen.getByTestId("clear-filters-button"))
  assert.deepEqual(pushed.at(-1), "/us/store")
})

test("mobile sort sheet pushes ?sortBy=<value>", () => {
  renderToolbar()
  fireEvent.click(screen.getByTestId("mobile-sort-button"))
  assert.ok(screen.getByTestId("sort-sheet"))

  const latest = screen
    .getAllByTestId("sheet-radio-row")
    .find((r) => r.textContent?.includes("Latest Arrivals"))!
  fireEvent.click(latest)
  assert.deepEqual(pushed, ["/us/store?sortBy=created_at"])
})
