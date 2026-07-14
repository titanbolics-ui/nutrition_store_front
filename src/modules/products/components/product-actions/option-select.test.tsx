import { test, afterEach } from "node:test"
import assert from "node:assert/strict"
import * as React from "react"
import { cleanup, render, screen, fireEvent } from "@testing-library/react"
import OptionSelect from "./option-select.tsx"

afterEach(() => {
  cleanup()
})

const OPTION_ID = "opt_volume"

function option(values: string[]) {
  return {
    id: OPTION_ID,
    title: "Volume",
    values: values.map((value, i) => ({ id: `val_${i}`, value })),
  } as any
}

function variant(value: string, inventory_quantity: number) {
  return {
    manage_inventory: true,
    allow_backorder: false,
    inventory_quantity,
    options: [{ option_id: OPTION_ID, value }],
  } as any
}

test("values are grouped by form with icon headers (mixed amp + vial)", () => {
  render(
    <OptionSelect
      option={option(["1ml amp", "10 ampoules", "10ml Vial"])}
      current={undefined}
      updateOption={() => {}}
      title="Volume"
      disabled={false}
      productForm="Injectable"
    />
  )

  const labels = screen
    .getAllByTestId("option-group-label")
    .map((el) => el.textContent)
  assert.deepEqual(labels, ["Ampoules", "Vials"])
})

test("unclassifiable values fall back to a single group titled by the option", () => {
  render(
    <OptionSelect
      option={option(["10mg", "25mg"])}
      current={undefined}
      updateOption={() => {}}
      title="Concentration"
      disabled={false}
    />
  )

  const labels = screen
    .getAllByTestId("option-group-label")
    .map((el) => el.textContent)
  assert.deepEqual(labels, ["Concentration"])
})

test("out-of-stock value renders muted + strikethrough and is not selectable", () => {
  const calls: string[] = []
  render(
    <OptionSelect
      option={option(["100 tabs", "50 tabs"])}
      current={undefined}
      updateOption={(_, v) => calls.push(v)}
      title="Volume"
      disabled={false}
      variants={[variant("100 tabs", 0), variant("50 tabs", 20)]}
      productForm="Oral"
    />
  )

  const oos = screen.getByRole("button", { name: "100 tabs" })
  assert.equal(oos.getAttribute("aria-disabled"), "true")
  assert.equal(oos.getAttribute("title"), "Out of stock")
  assert.ok(oos.className.includes("line-through"))

  fireEvent.click(oos)
  assert.deepEqual(calls, [])

  const inStock = screen.getByRole("button", { name: "50 tabs" })
  assert.equal(inStock.getAttribute("aria-disabled"), null)
  fireEvent.click(inStock)
  assert.deepEqual(calls, ["50 tabs"])
})

test("selected chip gets the accent treatment", () => {
  render(
    <OptionSelect
      option={option(["100 tabs"])}
      current="100 tabs"
      updateOption={() => {}}
      title="Volume"
      disabled={false}
      variants={[variant("100 tabs", 20)]}
      productForm="Oral"
    />
  )

  const chip = screen.getByRole("button", { name: "100 tabs" })
  assert.ok(chip.className.includes("border-[#ccff00]"))
})

test("stock check respects the other selected options", () => {
  const sizeOption = {
    id: "opt_size",
    title: "Volume",
    values: [{ id: "v1", value: "100 tabs" }],
  } as any
  // "100 tabs" exists in 10mg (out of stock) and 25mg (in stock): with 10mg
  // selected on the other option, the chip must read out of stock.
  const variants = [
    {
      manage_inventory: true,
      allow_backorder: false,
      inventory_quantity: 0,
      options: [
        { option_id: "opt_size", value: "100 tabs" },
        { option_id: "opt_conc", value: "10mg" },
      ],
    },
    {
      manage_inventory: true,
      allow_backorder: false,
      inventory_quantity: 5,
      options: [
        { option_id: "opt_size", value: "100 tabs" },
        { option_id: "opt_conc", value: "25mg" },
      ],
    },
  ] as any

  render(
    <OptionSelect
      option={sizeOption}
      current={undefined}
      updateOption={() => {}}
      title="Volume"
      disabled={false}
      variants={variants}
      selectedOptions={{ opt_conc: "10mg" }}
      productForm="Oral"
    />
  )

  const chip = screen.getByRole("button", { name: "100 tabs" })
  assert.equal(chip.getAttribute("aria-disabled"), "true")
})
