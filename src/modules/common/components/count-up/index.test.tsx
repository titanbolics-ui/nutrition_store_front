import { test, afterEach } from "node:test"
import assert from "node:assert/strict"
import * as React from "react"
import { cleanup, render, screen } from "@testing-library/react"
import CountUp from "./index.tsx"

afterEach(() => cleanup())

// jsdom has no IntersectionObserver — the component must fall back to
// rendering the real final value (which is also what SSR emits).
test("renders the formatted final value without IntersectionObserver", () => {
  render(<CountUp value={10000} suffix="+" data-testid="count" />)
  assert.equal(screen.getByTestId("count").textContent, "10,000+")
})

test("respects decimals and prefix/suffix", () => {
  render(
    <CountUp
      value={99.8}
      decimals={1}
      prefix="~"
      suffix="%"
      data-testid="count"
    />
  )
  assert.equal(screen.getByTestId("count").textContent, "~99.8%")
})
