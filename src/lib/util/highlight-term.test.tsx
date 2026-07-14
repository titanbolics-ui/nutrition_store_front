import { test, afterEach } from "node:test"
import assert from "node:assert/strict"
import * as React from "react"
import { cleanup, render, screen } from "@testing-library/react"
import { highlightTerm } from "./highlight-term.tsx"

afterEach(() => {
  cleanup()
})

function renderNode(node: React.ReactNode) {
  return render(<div data-testid="out">{node}</div>)
}

test("no term returns the text unchanged", () => {
  assert.equal(highlightTerm("Oxandrolone is mild"), "Oxandrolone is mild")
  assert.equal(highlightTerm("text", "  "), "text")
})

test("highlights every whole-word, case-insensitive occurrence", () => {
  renderNode(highlightTerm("Oxandrolone and oxandrolone again", "Oxandrolone"))
  const marks = screen
    .getByTestId("out")
    .querySelectorAll("span.text-\\[\\#ccff00\\]\\/80")
  assert.equal(marks.length, 2)
  assert.equal(marks[0].textContent, "Oxandrolone")
  assert.equal(marks[1].textContent, "oxandrolone")
})

test("does not match inside a larger word (whole-word only)", () => {
  const { container } = renderNode(highlightTerm("Various Var variables", "Var"))
  const marks = container.querySelectorAll("span.text-\\[\\#ccff00\\]\\/80")
  assert.equal(marks.length, 1)
  assert.equal(marks[0].textContent, "Var")
})

test("no occurrence returns the plain string", () => {
  assert.equal(highlightTerm("nothing here", "Oxandrolone"), "nothing here")
})

test("regex metacharacters in the term are treated literally", () => {
  const { container } = renderNode(highlightTerm("dose (A) now", "(A)"))
  const marks = container.querySelectorAll("span.text-\\[\\#ccff00\\]\\/80")
  assert.equal(marks.length, 1)
  assert.equal(marks[0].textContent, "(A)")
})
