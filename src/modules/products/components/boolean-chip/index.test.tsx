import { test, afterEach } from "node:test"
import assert from "node:assert/strict"
import * as React from "react"
import { cleanup, render, screen } from "@testing-library/react"
import BooleanChip, { detectBoolean } from "./index.tsx"

afterEach(() => {
  cleanup()
})

test("detectBoolean recognizes yes/no keywords", () => {
  assert.equal(detectBoolean("Yes"), "yes")
  assert.equal(detectBoolean("No"), "no")
  assert.equal(detectBoolean("Significant"), "yes")
  assert.equal(detectBoolean("Minimal"), "no")
})

test("detectBoolean returns null for ambiguous text", () => {
  assert.equal(detectBoolean("Partial"), null)
  assert.equal(detectBoolean("Depends on dose"), null)
})

test("bare yes renders a chip with no extra detail text", () => {
  render(<BooleanChip label="Aromatization" value="Yes" />)
  assert.ok(screen.getByText("Aromatization"))
  assert.ok(screen.getByText("Yes"))
})

test("qualified yes keeps the raw text alongside the chip", () => {
  render(<BooleanChip label="Aromatization" value="Yes (moderate)" />)
  assert.ok(screen.getByText("Yes (moderate)"))
  assert.ok(screen.getByText("Yes"))
})

test("ambiguous text falls back to plain SpecRow, no chip invented", () => {
  render(<BooleanChip label="Aromatization" value="Partial" />)
  assert.ok(screen.getByText("Aromatization"))
  assert.ok(screen.getByText("Partial"))
})
