import { test, afterEach } from "node:test"
import assert from "node:assert/strict"
import * as React from "react"
import { cleanup, render, screen } from "@testing-library/react"
import ProductContentTabs, { ContentPanel } from "./tabs-shell.tsx"

afterEach(() => {
  cleanup()
})

const panels: ContentPanel[] = [
  { value: "overview", label: "Overview", content: <p>overview body text</p> },
  { value: "dosage", label: "Dosage & Cycle", content: <p>dosage body text</p> },
  { value: "profile", label: "Profile", content: <p>profile body text</p> },
]

test("every panel's content is in the DOM, including inactive tabs (SEO)", () => {
  render(<ProductContentTabs panels={panels} />)

  // Twice each: desktop tab panel + mobile accordion panel, both force-mounted.
  assert.equal(screen.getAllByText("overview body text").length, 2)
  assert.equal(screen.getAllByText("dosage body text").length, 2)
  assert.equal(screen.getAllByText("profile body text").length, 2)
})

test("inactive desktop tab panels are hidden, the active one is not", () => {
  const { container } = render(<ProductContentTabs panels={panels} />)

  const tabPanels = container.querySelectorAll('[role="tabpanel"]')
  assert.equal(tabPanels.length, 3)

  const active = Array.from(tabPanels).filter(
    (p) => p.getAttribute("data-state") === "active"
  )
  const inactive = Array.from(tabPanels).filter(
    (p) => p.getAttribute("data-state") === "inactive"
  )
  assert.equal(active.length, 1)
  assert.equal(inactive.length, 2)
  for (const panel of inactive) {
    assert.ok(
      panel.className.includes("data-[state=inactive]:hidden"),
      "inactive panels must carry the hidden-when-inactive class"
    )
  }
})

test("collapsed mobile accordion content stays mounted but hidden via CSS", () => {
  const { container } = render(<ProductContentTabs panels={panels} />)

  // First accordion item is open by default; the others are closed but
  // force-mounted and hidden by the radix-state-closed:hidden class (Radix
  // does not set the hidden attribute under forceMount).
  const closedRegions = Array.from(
    container.querySelectorAll('[role="region"][data-state="closed"]')
  )
  assert.equal(closedRegions.length, 2)
  for (const region of closedRegions) {
    assert.ok(region.textContent!.length > 0, "content must stay mounted")
    assert.ok(
      region.className.includes("radix-state-closed:hidden"),
      "closed regions must carry the hide-when-closed class"
    )
  }
})
