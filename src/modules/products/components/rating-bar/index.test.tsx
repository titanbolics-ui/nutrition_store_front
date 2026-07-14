import { test, afterEach } from "node:test"
import assert from "node:assert/strict"
import * as React from "react"
import { cleanup, render, screen } from "@testing-library/react"
import RatingBar, { parseRating } from "./index.tsx"

afterEach(() => {
  cleanup()
})

test("parseRating extracts a leading integer", () => {
  assert.equal(parseRating("100"), 100)
  assert.equal(parseRating("320"), 320)
})

test("parseRating extracts a leading decimal", () => {
  assert.equal(parseRating("4.5 days"), 4.5)
})

test("parseRating returns null for non-numeric text", () => {
  assert.equal(parseRating("Very High"), null)
  assert.equal(parseRating(""), null)
})

test("numeric value renders a filled bar", () => {
  const { container } = render(<RatingBar label="Anabolic rating" value="100" />)
  assert.ok(screen.getByText("Anabolic rating"))
  assert.ok(screen.getByText("100"))
  assert.ok(container.querySelector('[aria-hidden="true"]'))
})

test("non-numeric value falls back to plain text, no bar, no crash", () => {
  render(<RatingBar label="Anabolic rating" value="Very High" />)
  assert.ok(screen.getByText("Anabolic rating"))
  assert.ok(screen.getByText("Very High"))
})
