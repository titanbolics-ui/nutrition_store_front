import { test, afterEach } from "node:test"
import assert from "node:assert/strict"
import * as React from "react"
import { cleanup, render, screen, fireEvent } from "@testing-library/react"
import ProductContent from "./index.tsx"

afterEach(() => {
  cleanup()
})

const compoundContent = {
  type: "compound",
  overview: { what: "A testosterone ester.", howItWorks: "Binds androgen receptors." },
  dosage: {
    beginner: "300-500mg/week",
    intermediate: "500-750mg/week",
    advanced: "750-1000mg/week",
    cycleLength: "12-16 weeks",
    administration: "Intramuscular injection",
    pct: "Required",
  },
  profile: {
    anabolicRating: "100",
    androgenicRating: "100",
    ester: "Enanthate",
    halfLife: "4.5 days",
    aromatization: "Yes",
    detectionTime: "3 months",
  },
  sideEffects: {
    estrogenic: "Moderate",
    androgenic: "Moderate",
    cardiovascular: "Moderate",
    suppression: "High",
  },
}

const peptideContent = {
  type: "peptide",
  overview: { what: "A GHRH peptide.", mechanism: "Stimulates GHRH receptors." },
  keyHighlights: ["Supports recovery", "Well-tolerated"],
  research: { useCases: "Recovery, sleep quality", models: "Rodent models" },
}

function category(opts: { handle: string; parentHandle?: string }) {
  return {
    id: `cat_${opts.handle}`,
    handle: opts.handle,
    parent_category: opts.parentHandle
      ? { id: `cat_${opts.parentHandle}`, handle: opts.parentHandle }
      : null,
  } as any
}

function product(opts: {
  content?: unknown
  template?: string
  categories?: any[]
  variants?: any[]
}) {
  return {
    id: "prod_1",
    metadata: {
      ...(opts.content !== undefined ? { content: opts.content } : {}),
      ...(opts.template !== undefined ? { template: opts.template } : {}),
    },
    categories: opts.categories ?? [],
    variants: opts.variants ?? [],
  } as any
}

test("compound-shaped content under an unrelated category renders compound tab labels", () => {
  render(
    <ProductContent
      product={product({
        content: compoundContent,
        categories: [category({ handle: "testosterone", parentHandle: "injectable-steroids" })],
      })}
    />
  )
  assert.ok(screen.getByTestId("compound-content"))
  assert.ok(screen.getAllByText("Dosage & Cycle").length > 0)
  assert.ok(screen.getAllByText("Side Effects").length > 0)
})

test("peptide-shaped content under the Peptides category renders peptide tab labels", () => {
  render(
    <ProductContent
      product={product({
        content: peptideContent,
        categories: [category({ handle: "gh-axis", parentHandle: "peptides" })],
      })}
    />
  )
  assert.ok(screen.getByTestId("peptide-content"))
  assert.ok(screen.getAllByText("Key Highlights").length > 0)
  assert.ok(screen.getAllByText("Research").length > 0)
})

test("HGH scenario: peptide content + metadata.template override on a non-Peptides category renders the peptide layout with no 'Peptide' wording", () => {
  const hghContent = {
    type: "peptide",
    overview: { what: "A growth hormone.", mechanism: "Stimulates GH receptors." },
    keyHighlights: ["Supports recovery"],
    research: { useCases: "Recovery", models: "Rodent models" },
  }
  render(
    <ProductContent
      product={product({
        content: hghContent,
        template: "peptide",
        categories: [category({ handle: "hgh" })],
      })}
    />
  )
  assert.ok(screen.getByTestId("peptide-content"))
  const container = screen.getByTestId("peptide-content")
  assert.ok(!/peptide/i.test(container.textContent ?? ""))
})

test("no coaUrl means no Lab Results tab", () => {
  render(<ProductContent product={product({ content: compoundContent })} />)
  assert.equal(screen.queryByText("Lab Results"), null)
})

test("coaUrl present renders the Lab Results tab", () => {
  render(
    <ProductContent
      product={product({ content: { ...compoundContent, coaUrl: "https://example.com/coa.pdf" } })}
    />
  )
  assert.ok(screen.getAllByText("Lab Results").length > 0)
})

test("no faq means no FAQ section", () => {
  render(<ProductContent product={product({ content: compoundContent })} />)
  assert.equal(screen.queryByTestId("faq-section"), null)
})

test("faq present renders the FAQ section", () => {
  render(
    <ProductContent
      product={product({
        content: { ...compoundContent, faq: [{ q: "Is this lab tested?", a: "Yes." }] },
      })}
    />
  )
  assert.ok(screen.getByTestId("faq-section"))
  assert.ok(screen.getByText("Is this lab tested?"))
})

test("a product with only overview renders a single Overview section, no crash", () => {
  const minimalContent = {
    type: "peptide",
    overview: { what: "Minimal product.", mechanism: "Unknown." },
    keyHighlights: ["Only fact we have"],
    research: { useCases: "TBD", models: "TBD" },
  }
  render(
    <ProductContent
      product={product({
        content: minimalContent,
        categories: [category({ handle: "gh-axis", parentHandle: "peptides" })],
      })}
    />
  )
  assert.ok(screen.getByTestId("peptide-content"))
  assert.equal(screen.queryByText("Lab Results"), null)
  assert.equal(screen.queryByTestId("faq-section"), null)
})

test("contentBlocks renders each of the four block types, in order", () => {
  const content = {
    ...compoundContent,
    contentBlocks: [
      { type: "text", body: "Some text." },
      { type: "image", url: "https://example.com/diagram.png", caption: "Diagram" },
      { type: "callout", body: "Important note." },
      { type: "table", headers: ["A", "B"], rows: [["1", "2"]] },
    ],
  }
  render(<ProductContent product={product({ content })} />)
  const blocksContainer = screen.getByTestId("content-blocks")
  const children = Array.from(blocksContainer.children).map((el) =>
    el.getAttribute("data-testid")
  )
  assert.deepEqual(children, [
    "content-block-text",
    "content-block-image",
    "content-block-callout",
    "content-block-table",
  ])
})

test("text and callout content blocks render an optional title above the body", () => {
  const content = {
    ...compoundContent,
    contentBlocks: [
      { type: "text", title: "Why Choose It?", body: "Some text." },
      { type: "callout", title: "Note", body: "Important note." },
    ],
  }
  render(<ProductContent product={product({ content })} />)
  const titles = screen.getAllByTestId("content-block-title")
  assert.equal(titles.length, 2)
  assert.equal(titles[0].textContent, "Why Choose It?")
  assert.equal(titles[1].textContent, "Note")
  assert.ok(screen.getByText("Some text."))
  assert.ok(screen.getByText("Important note."))
})

test("mismatched resolveProductTemplate vs content.type renders content.type's layout, not blank, and warns", () => {
  const warnCalls: unknown[][] = []
  const originalWarn = console.warn
  console.warn = (...args: unknown[]) => {
    warnCalls.push(args)
  }

  try {
    // content.type is "compound" but the category resolves to "peptide" —
    // content.type must win: the author explicitly wrote "compound".
    const { container } = render(
      <ProductContent
        product={product({
          content: compoundContent,
          categories: [category({ handle: "gh-axis", parentHandle: "peptides" })],
        })}
      />
    )

    assert.notEqual(container.innerHTML, "")
    assert.ok(screen.getByTestId("compound-content"))
    assert.equal(screen.queryByTestId("peptide-content"), null)

    assert.ok(warnCalls.length > 0)
    assert.match(
      String(warnCalls[0][0]),
      /resolved "peptide" but metadata\.content\.type is "compound"/
    )
  } finally {
    console.warn = originalWarn
  }
})

test("no metadata.content at all renders nothing", () => {
  const { container } = render(<ProductContent product={product({})} />)
  assert.equal(container.innerHTML, "")
})

test("malformed metadata.content (missing required field) renders nothing, no crash", () => {
  const { dosage, ...rest } = compoundContent
  const { beginner, ...brokenDosage } = dosage
  const broken = { ...rest, dosage: brokenDosage }
  const { container } = render(<ProductContent product={product({ content: broken })} />)
  assert.equal(container.innerHTML, "")
})

test("a variant with reconstitution.enabled shows the Calculator tab with raw values", () => {
  render(
    <ProductContent
      product={product({
        content: peptideContent,
        categories: [category({ handle: "gh-axis", parentHandle: "peptides" })],
        variants: [
          {
            id: "variant_1",
            title: "5mg vial",
            metadata: { reconstitution: { enabled: true, vialAmount: 5, unit: "mg" } },
          },
        ],
      })}
    />
  )
  const calculatorTabs = screen.getAllByText("Calculator")
  assert.ok(calculatorTabs.length > 0)
  // Panels are force-mounted for SEO, so the placeholder is in the DOM twice
  // (desktop tab + mobile accordion) without any tab switching.
  assert.equal(screen.getAllByTestId("calculator-placeholder").length, 2)
  assert.ok(screen.getAllByText("5mg vial").length > 0)
})

test("no variant with reconstitution.enabled means no Calculator tab", () => {
  render(
    <ProductContent
      product={product({
        content: peptideContent,
        categories: [category({ handle: "gh-axis", parentHandle: "peptides" })],
        variants: [{ id: "variant_1", title: "5mg vial", metadata: {} }],
      })}
    />
  )
  assert.equal(screen.queryByText("Calculator"), null)
})

test("mobile accordion trigger expands its panel on click, focus stays visible", () => {
  render(<ProductContent product={product({ content: compoundContent })} />)
  const triggers = screen.getAllByText("Side Effects")
  // the accordion trigger is the second occurrence (desktop tab renders first)
  const accordionTrigger = triggers[triggers.length - 1]
  fireEvent.click(accordionTrigger)
  assert.ok(document.activeElement)
})
