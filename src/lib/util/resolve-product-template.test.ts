import { test } from "node:test"
import assert from "node:assert/strict"
import { resolveProductTemplate } from "./resolve-product-template.ts"

function category(opts: {
  handle: string
  parent?: { handle: string } | null
}) {
  return {
    id: `cat_${opts.handle}`,
    handle: opts.handle,
    parent_category: opts.parent
      ? { id: `cat_${opts.parent.handle}`, handle: opts.parent.handle }
      : null,
  } as any
}

function product(opts: {
  template?: unknown
  categories?: any[]
}) {
  return {
    metadata:
      opts.template === undefined ? null : { template: opts.template },
    categories: opts.categories,
  } as any
}

test("explicit metadata.template: compound wins over a Peptides category", () => {
  const p = product({
    template: "compound",
    categories: [category({ handle: "gh-axis", parent: { handle: "peptides" } })],
  })
  assert.equal(resolveProductTemplate(p), "compound")
})

test("explicit metadata.template: peptide wins for a product under a non-Peptides category (HGH case)", () => {
  const p = product({
    template: "peptide",
    categories: [category({ handle: "hgh" })],
  })
  assert.equal(resolveProductTemplate(p), "peptide")
})

test("product under a Peptides subcategory resolves to peptide", () => {
  const p = product({
    categories: [category({ handle: "gh-axis", parent: { handle: "peptides" } })],
  })
  assert.equal(resolveProductTemplate(p), "peptide")
})

test("product directly under the Peptides root category resolves to peptide", () => {
  const p = product({
    categories: [category({ handle: "peptides" })],
  })
  assert.equal(resolveProductTemplate(p), "peptide")
})

test("product under an unrelated category resolves to compound", () => {
  const p = product({
    categories: [category({ handle: "testosterone", parent: { handle: "injectable-steroids" } })],
  })
  assert.equal(resolveProductTemplate(p), "compound")
})

test("no categories, no metadata falls back to compound, never crashes", () => {
  const p = product({})
  assert.equal(resolveProductTemplate(p), "compound")
})

test("garbage metadata.template value is ignored, falls through to category inference", () => {
  const p = product({
    template: "foo",
    categories: [category({ handle: "peptides" })],
  })
  assert.equal(resolveProductTemplate(p), "peptide")
})
