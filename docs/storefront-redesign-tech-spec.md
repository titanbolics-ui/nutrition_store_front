# Technical Specification — Storefront Redesign (Onyx Genetics)

Spec for AI-assisted implementation. Stages run **in order**; dependencies noted. Each
stage has acceptance tests that must pass before the next. This touches the Medusa
backend (`nutrition_store`) and the storefront (`nutrition_store_front`).

## Why (business context)

The product page is one undifferentiated wall of text, which undercuts the trust the niche
depends on. We restructure into two product templates (compounds vs peptides) with a shared
reconstitution calculator, fix the variant/category model, add three in-house brands as a
product attribute (all one warehouse under the hood — brands are labels/merchandising, not
separate sites), and rebuild the homepage to sell. Trust is built with structured data and
honesty (real lab results only, honest out-of-stock), never with filler copy.

**Note:** brands are purely labels — same catalog logic, same fulfillment, one warehouse.
A brand is an attribute on the product (like manufacturer), NOT a separate storefront or
domain. It drives a badge, a catalog filter, and homepage brand entries — nothing more.

**SEO/GEO note (2026):** the same structural choices that make pages trustworthy also make
them win in search AND get cited by AI answer engines (ChatGPT, Perplexity, AI Overviews).
Consolidated variants + canonical avoid duplicate-content dilution; factual, promo-free,
Q&A-structured copy is exactly what AI engines quote (promotional tone measurably lowers
citation). So "data, not persuasion" is not just tone — it's the SEO/GEO strategy. GEO is an
additive layer on solid SEO, not a replacement (organic still sends far more traffic;
AI-referred converts higher and grows fast). Concrete requirements live in Stage B (schema +
canonical), Stage C (promo-free BLUF copy + FAQ), and Stage G (crawlability + schema plumbing).

## Global rules

1. Additive and reversible. Never break existing checkout, order, or passwordless flows.
2. Any data migration (variants, categories) requires a DB backup first and a documented
   rollback. Never destroy product data without a restore path.
3. URL changes require 301 redirects from old paths — links are already circulating in
   WhatsApp and search. Breaking them loses customers and SEO.
4. Honesty constraints, non-negotiable in this niche:
   - Lab results: only link/show COA where a REAL report exists (we currently have 3).
     Never render a fake batch number or a dead COA link. No report → no batch row, silently.
   - Out-of-stock: show honestly (with restock ETA if known), never hide or fake stock.
   - No invented purity figures. Only real tested values.
5. The reconstitution calculator is a MEDICAL calculation. Wrong math = customer draws the
   wrong dose. Every formula is unit-tested with worked examples. A disclaimer is mandatory.
6. Read `/mnt/skills/public/frontend-design/SKILL.md` before any visual work. Keep the
   existing brand (near-black background, acid-green accent) — it works; do NOT redesign the
   identity, only the structure and new sections.
7. Content lives in product `metadata` as structured JSON with schema validation. Do NOT
   build an external CMS. Editing stays manual JSON for now; an admin block-editor is a
   FUTURE module, not this spec.

---

## Stage A — Peptide subcategories + homepage collections (Medusa)

**Goal:** fix peptide navigation and give the homepage curated entry points — WITHOUT
disturbing the working steroid taxonomy. (This stage was rewritten after inspecting the
live catalog: the original "Compounds by cycle goal" plan was wrong — see corrections below.)

**Reality of the live catalog (do not fight it):**
- Steroids already have a good tree: `Oral Steroids` and `Injectable Steroids` roots, each
  with substance children (Testosterone, Trenbolone, Masteron, …). This matches how
  customers search (by substance name). **Leave it untouched.**
- `Peptides` is a flat root with 20+ products directly under it — this is the real work.
- Products are already multi-categorized (Tirzepatide in Peptides + Weight Loss, Tamoxifen
  in PCT, …). This is CORRECT and stays.

**Deliverables:**
1. **Do NOT restructure the steroid tree.** No changes to Oral/Injectable Steroids or their
   substance children.
2. **Peptide subcategories** — add children under `Peptides` by research class, derived from
   the ACTUAL peptide catalog (propose from what exists — e.g. GLP-1/Metabolic, Repair/
   Recovery, IGF/GH-Axis, Melanocortin — do NOT invent classes). Assign existing peptides to
   the right child; anything ambiguous → report for manual assignment, don't guess.
3. **Multi-category is kept.** Drop any "one product → one leaf category" assumption. A
   product may live in several categories.
4. **Homepage collections (Medusa collections, NOT categories)** — the cycle/goal groupings
   (Mass & Strength, Lean & Shredded, Peptides & GLP-1, Anti-Aging & HGH, and any others) are
   **manual curated collections**, hand-picked by the operator, separate from the taxonomy.
   Categories = taxonomy (how you browse); collections = curation (what we promote). Create
   the collections matching the 4 hardcoded homepage cards
   (horizontal-scroll-section/index.tsx) and wire those cards to link to their collection's
   filtered view. Collections are populated manually — build the mechanism, the operator
   fills them.
5. **Template resolution** — because of multi-category, template can't always be inferred
   from category. Add an explicit product attribute `template: "compound" | "peptide"` that
   WINS when set; category inference (root = Peptides → peptide, else compound) is only the
   fallback when the attribute is unset.
6. Category landing pages: each peptide subcategory gets its own page (reusing the catalog
   grid) so ads can point at a specific class.

**Acceptance tests:**
- Steroid tree unchanged (diff shows no category edits under Oral/Injectable Steroids).
- Peptides root has the new subcategories; every existing peptide resolves to one, or
  appears in the unassigned report.
- A product can sit in multiple categories without error (verify with a real cross-tagged
  product like Tirzepatide).
- Collections exist and are separate from categories; the 4 homepage cards link to their
  collection views; an empty collection renders cleanly (operator hasn't filled it yet).
- Template resolution: a product with explicit `template` uses it; a product without falls
  back to category inference. Verify both paths.
- `/categories/<peptide-subclass>` renders only that subclass's products.
- Existing catalog routes still work (no regression).

---

## Stage B — Variant consolidation (Medusa, DATA MIGRATION — highest risk)

**Goal:** products that exist as multiple duplicate cards (e.g. Tirzepatide in many
dosages, Test E in volumes) become ONE product with internal variants. This is how
Medusa is meant to work and fixes split reviews, broken best-seller logic, and hidden
choice.

**SEO rationale (2026 consensus — this confirms consolidation is correct for us):** our
variants differ by dosage/volume — the "size" type, which almost never has enough
uniqueness to justify separate pages. Splitting them into separate URLs creates
near-duplicate pages that split ranking signals (Google indexes more pages but trusts
fewer). With a 189-product catalog full of duplicate cards, consolidation + canonical is
the right call. Exception: if a specific dosage has genuinely unique search demand AND
unique content, it may stay separately indexed — but that's rare; default is consolidate.

**Deliverables:**
1. BACKUP the DB first (a FRESH backup — data changed since Stage A's cross-tagging).
   Document the exact backup + restore commands in the report.
2. Identify duplicate-card groups: products that are the same item differing only by
   dosage/volume/size. Produce the grouping as a report for ME to approve BEFORE merging —
   do not auto-merge without sign-off. Distinguish true duplicates (same item, different
   dose → merge) from similarly-named different products (do NOT merge). Grouping is MY
   decision; you propose.
3. For each approved group: create one product with variants (the Test E page already does
   this — "Select Volume"; replicate that pattern). Migrate inventory per variant. Preserve
   each old product's best content into the consolidated one.
4. 301-redirect every old product URL to the new consolidated URL (or to the right variant
   anchor). No old link may 404. Redirects are stronger than canonical hints and links live
   in WhatsApp — this is mandatory, not optional.
5. Canonical tags: variant URLs (?variant=…) carry a canonical pointing to the parent
   product URL, so only the parent is indexed — prevents keyword cannibalization between
   dosages of the same product.
6. Structured data (2026 Google pattern): the consolidated product emits `ProductGroup` +
   `hasVariant`. ProductGroup needs a name; each nested variant `Product` needs a unique
   SKU/GTIN, the attribute it varies by (dosage/volume), and its own preselection URL. Do
   NOT emit competing Product entities per variant — represent variants within one group.
7. Idempotent + resumable: if the migration stops halfway, re-running continues cleanly,
   never double-merges.

**Acceptance tests:**
- On a RESTORED COPY of real data (not fresh seed): run migration → each duplicate group is
  one product with the right variants; inventory totals match pre-migration sums.
- Every old product URL 301s to a live page (test a sample of real old URLs).
- Variant URLs carry a canonical to the parent; only the parent is indexable.
- Consolidated product emits valid ProductGroup + hasVariant schema (validate against
  Google's Rich Results structure); no duplicate competing Product entities.
- Re-run migration → no further changes, no duplicate variants.
- Reviews/ratings (if any) survive consolidation, not lost.
- Rollback rehearsal: restore from backup → original state returns.

---

## Stage C — Two content templates + shared content blocks (Medusa schema + storefront)

**Goal:** structured, trustworthy product pages — two templates because compounds and
peptides have genuinely different buying logic — plus a free-form block zone so individual
products can be enriched (a diagram, a formula, an image) without breaking consistency.

**Template selection:** explicit `template` product attribute wins when set; otherwise
inferred from root category (root = Peptides → peptide template, else compound). This
matters because products are multi-categorized (Stage A), so category alone is not always
decisive. One resolution helper, used everywhere the page picks a template.

**Deliverables:**

1. `metadata.content` JSON schema, validated on save (reject malformed JSON with a clear
   error — a typo must not silently corrupt a page):

   Compound:
   ```
   {
     type: "compound",
     overview: { what, howItWorks },
     dosage: { beginner, intermediate, advanced, cycleLength, administration, pct },
     profile: { anabolicRating, androgenicRating, ester, halfLife, aromatization, detectionTime },
     sideEffects: { estrogenic, androgenic, cardiovascular, suppression },
     reconstitution?: { enabled, vialAmount, unit },   // optional — see Stage D
     coaUrl?,                                           // only if a real report exists
     faq?: [ { q, a } ],                                // optional — GEO Q&A, see item 7
     contentBlocks?: [ ... ]                            // see below
   }
   ```

   Peptide:
   ```
   {
     type: "peptide",
     overview: { what, mechanism },
     keyHighlights: [ ... ],
     research: { useCases, models },
     reconstitution?: { enabled, vialAmount, unit },
     stacking?: [ { productHandle, label } ],           // cross-sell + trust
     coaUrl?,
     faq?: [ { q, a } ],                                // optional — GEO Q&A, see item 7
     contentBlocks?: [ ... ]
   }
   ```

2. Shared `contentBlocks` (both templates) — the free-form zone for per-product enrichment:
   ```
   contentBlocks: [
     { type: "text",    body },
     { type: "image",   url, caption? },
     { type: "callout", body },
     { type: "table",   headers, rows }
   ]
   ```
   Empty/absent → renders nothing (clean default). Present → rendered in array order in a
   dedicated section. This is what lets a specific product carry a mechanism diagram or a
   formula while every product keeps the same structured core.

3. Storefront: two page components (compound / peptide), selected by resolveProductTemplate
   (explicit `template` wins, else root category). Render structured sections as TABS or
   accordions (not one wall of text — that's the whole point):
   - Compound tabs: Overview · Dosage & Cycle · Profile · Side Effects · Lab Results (if coaUrl)
   - Peptide tabs: Overview · Key Highlights · Research · Stacking · Lab Results (if coaUrl)
   - Both: a Calculator tab IF `reconstitution.enabled` (Stage D), and the contentBlocks
     section if non-empty.
   - Dosage on compounds: render beginner/intermediate/advanced as a visual scale, not raw text.
   - **HGH note:** HGH resolves to the peptide template as a TECHNICAL container (it needs
     reconstitution + IU mode), NOT as a customer-facing classification. Tab/section labels
     on the HGH page must be neutral ("Product Details", "How to Reconstitute"), never
     "Peptide" — a growth hormone labelled "Peptide Info" reads as miscategorized and hurts
     trust. Keep peptide-template labels generic enough to work for both.
4. Top-of-page (above the fold, decision zone): name, manufacturer, brand, image, a trust
   strip (`Lab Tested · In Stock` — Stage E feeds the stock badge), variant selector,
   price, add-to-cart, one-line summary, and an inline batch+purity line ONLY where a real
   COA exists.
5. Remove the marketing "Conclusion" section AND strip promotional tone from all product
   copy — not just the Conclusion. Phrases like "premium grade", "top choice", "engineered
   for the elite", "the best", "act now" must go. This is both a trust decision and a GEO
   one: 2026 research (Princeton GEO study, Semrush) shows promotional tone REDUCES AI
   citation rates (~-26%), while factual/Q&A content raises them. "Data, not persuasion" is
   now doubly correct — it reads as serious AND gets cited by AI. Real numbers (purity,
   half-life, concentration) are the highest-value content: quotations/statistics/citations
   drive the biggest AI-visibility gains.
6. **BLUF structure (front-load the facts).** AI answer engines evaluate a page largely on
   its opening content. The one-line summary + the first lines of Overview must state the
   factual essence directly (what it is, concentration, key property) — not a marketing
   build-up. Lead with the answer, not with persuasion.
7. **FAQ / Q&A section per product.** Add a short Q&A block (e.g. "What is the half-life of
   Test E?", "How do I reconstitute this peptide?", "Is this lab tested?"). Q&A formatting
   measurably raises AI citation rates and matches how AI fans a query into sub-questions.
   Store the Q&A in the content JSON (`faq: [{ q, a }]`, optional) so it's editable per
   product and rendered as its own section + eligible for FAQ structured data (Stage schema).

**Acceptance tests:**
- Saving invalid content JSON → rejected with a readable error; valid → saved.
- A compound product renders the compound template with its tabs; a peptide renders the
  peptide template. Template follows the explicit `template` attribute when set, else the
  root-category fallback; verify both a set-attribute product and an inferred one.
- A product with `contentBlocks` renders them in order (text/image/callout/table all work);
  a product without renders no block section and looks clean.
- `coaUrl` absent → no Lab Results tab, no batch row, nothing broken.
- No "Conclusion" section anywhere; no promotional phrases ("premium grade", "top choice",
  "elite", "the best", "act now") in any rendered product copy — grep the templates/content.
- Overview/summary front-loads the factual essence in the first lines (BLUF), no marketing
  build-up before the facts.
- A product with `faq` renders a Q&A section; without `faq`, no section, nothing broken.
- HGH page labels are neutral (no "Peptide" wording), though it uses the peptide template.
- Mobile: tabs/accordions usable at 375px; keyboard focus visible.

---

## Stage D — Reconstitution calculator (shared component, MEDICAL math)

**Goal:** an interactive calculator on the product page (and reusable in the future
tool-hub) that turns vial amount + BAC water + desired dose into an exact syringe draw,
shown as a number AND a visual syringe scale. Cross-template: enabled by
`reconstitution.enabled` on ANY product (peptide, HGH, lyophilized compound), not tied to
template type.

**Two input modes:**

- **mg/mcg mode** (peptides, most lyophilized): vial in mg, dose in mcg or mg.
  ```
  concentration_mg_per_ml = vialMg / bacMl
  dose_mg   = doseMcg / 1000
  draw_ml   = dose_mg / concentration_mg_per_ml
  units_u100 = draw_ml * 100
  ```
  Worked check: vial 5 mg, BAC 2 ml → 2.5 mg/ml; dose 500 mcg = 0.5 mg;
  0.5 / 2.5 = 0.20 ml = 20 units. ✓

- **IU mode** (HGH only — vials are labelled in IU, dose is in IU; do NOT convert to mg):
  ```
  units_u100 = (dose_IU / vial_IU) * bacMl * 100
  ```
  Worked check: vial 36 IU, BAC 1 ml, dose 2 IU → 2/36 = 0.056 ml = 5.6 units. ✓
  - Provide an EDITABLE mg↔IU factor (default `1 mg ≈ 3 IU`, WHO standard for rhGH) used
    only for an optional informational mg-equivalent display. The factor must be editable
    because some products specify a different potency (e.g. 2.8 IU/mg) on their label.
  - Mode is driven by `reconstitution.unit` ("mg" | "IU"); IU mode is essentially HGH.

**Common requirements:**
- Syringe scale fixed at U-100 (1 ml = 100 units, 0.01 ml = 1 unit). No syringe-type
  selector for now (we don't sell syringes; U-100 is the de-facto standard).
- Visual syringe bar with the draw zone highlighted — this is what makes it trustworthy;
  not optional.
- Guard rails (the reason this needs tests):
  - `bacMl <= 0` → no division by zero; show a prompt to enter water volume.
  - `draw_ml > syringeVolume` → warning "dose exceeds syringe volume — add more water or
    lower the dose", not a silent number.
  - Negative / non-numeric inputs → handled, never NaN on screen.
- **Blend / multi-active edge case (must handle explicitly).** Some reconstitution products
  are BLENDS of several peptides in one vial (e.g. Super Slim Mix = AOD-9604 + Fragment
  176-191 + Adipotide, 11 mg TOTAL). Here `vialAmount` is the SUM of multiple actives, not a
  single active — so "draw for dose X of the active" is meaningless per-component. When a
  product's composition lists multiple actives (flag via metadata, e.g.
  `reconstitution.isBlend = true`): either hide the calculator, OR show it with an explicit
  note "blend — result is total draw volume, not a single-component dose." Never present a
  blend draw as if it were a single-compound dose — that would mislead on dosing.
- Mandatory disclaimer under the result: "For research calculation purposes. Not medical
  advice."
- Styling matches the brand (dark + acid-green), NOT the gold reference screenshot.
- Built as a self-contained component so it drops into the product page now and the
  tool-hub later — write once.

**Acceptance tests (unit, exhaustive on math):**
- mg/mcg worked example above → 0.20 ml / 20 units exactly.
- IU worked example above → 5.6 units.
- bacMl = 0 → guard message, no NaN/Infinity.
- draw_ml > syringe volume → warning shown, no raw number.
- editable IU factor changes the mg-equivalent display correctly; default is 3.
- non-numeric / negative inputs → handled gracefully.
- Component renders only when `reconstitution.enabled`; absent → no Calculator tab.
- Blend product (`isBlend = true`) → calculator hidden OR shown with the blend note; never
  presents a per-component dose. Verify with a Super Slim Mix-shaped fixture.
- Mobile + keyboard accessible.

---

## Stage E — Brand attribute + stock badges (Medusa attributes + storefront)

**Goal:** three in-house brands as a product attribute (labels only), plus honest 3-state
stock. No US-domestic anything — that supplier is gone; all products ship from one warehouse.

**Deliverables:**
1. Attributes:
   - `brand`: one of the three brand labels (an attribute on the product, like manufacturer).
     Brands share the same catalog logic and fulfillment — purely merchandising.
   - stock state derived from inventory: In Stock / Low Stock (threshold, e.g. <5) /
     Out of Stock — three states, not two (Low Stock is an urgency lever).
   - optional `restockEta` for out-of-stock ("Back in ~10 days") — better than a dead
     "Out of stock" given known recurring shortages.
2. Badges:
   - Product card: small brand badge; plus "OUT OF STOCK" dim overlay / "LOW STOCK" when
     applicable.
   - Product page: brand shown near title (optionally with brand logo); stock state near price.
   - Catalog filters: filter by brand; "In Stock only" toggle.
3. Each brand may have a small identity inside the site (logo, short blurb, optionally a
   subtle accent within the existing theme) so it reads as a line, not just a tag — but it
   stays ONE site, one theme. Do not build separate brand sites.

**Acceptance tests:**
- A product's brand renders as a badge on card + near title on page.
- Brand filter shows only that brand's products.
- Three stock states render correctly from real inventory; Low Stock triggers at threshold.
- Out-of-stock with restockEta shows the ETA; without, shows plain out-of-stock.
- "In Stock only" filter works.
- No US-domestic references anywhere (removed).

---

## Stage F — Homepage rebuild (storefront)

**Goal:** a homepage that sells to the US market and uses the data the earlier stages
produced. Keep the existing identity; add structure and sections. Read frontend-design
SKILL first.

**Deliverables (section order):**
1. Hero — keep existing strength (works already).
2. Trust strip — keep (lab tested / delivery / reviews).
3. **Brands section** — three clean entries into per-brand collections ("Our Brands"), each
   linking to a brand-filtered storefront. Merchandising + navigation, one site.
4. Best sellers — expand from 4 to ~8.
5. **Back in Stock / New Arrivals** — given recurring shortages, "back in stock" recaptures
   waiting customers.
6. Cycle / goal blocks (Mass & Strength, Lean & Shredded …) — make them clickable entries
   into the Stage A subcategories, not just a slider.
7. Lab proof — keep the "Independently Verified" block, but only the 3 REAL reports. No
   fake per-product batch links.
8. **Trustpilot** — embed real reviews (reputation is already managed there); stronger than
   a "5-STAR REVIEWS" text line.
9. Footer — keep.

Do NOT turn the homepage into a longread. US buyers in this niche want: find fast, trust,
buy. Hero → trust → Brands → best sellers → back-in-stock → cycles → lab proof →
Trustpilot → footer is enough.

**Acceptance tests:**
- Homepage renders all sections; cycle blocks link to real subcategory pages.
- Brands section shows three brand entries, each linking to a brand-filtered view.
- Back-in-stock shows products that returned to stock.
- Only the 3 real COAs appear; no fake batch links.
- Mobile responsive; reduced-motion respected; no layout shift on load.

---

## Stage G — Technical SEO / GEO plumbing (storefront, low-effort high-leverage)

**Goal:** make the site crawlable and citable by AI engines. These are small, mostly-free
actions with outsized 2026 leverage — do them once, they compound. GEO is an additive layer
on solid SEO, not a replacement: traditional organic still sends far more traffic, but
AI-referred traffic converts higher and is growing fast.

**Deliverables:**
1. `robots.txt`: explicitly ALLOW `GPTBot` (OpenAI) and other AI crawlers (PerplexityBot,
   Google-Extended, ClaudeBot). Blocking GPTBot removes the store from the model's long-term
   memory — we WANT the models to know our products so they recommend them. (E-commerce
   wants to be crawled, unlike IP-protective publishers.)
2. Submit the sitemap to **Bing Webmaster Tools** — ChatGPT's web search uses Bing's index,
   so Bing coverage is a prerequisite for ChatGPT citations. Most stores skip this; it's free.
3. FAQ structured data (`FAQPage` schema) generated from each product's `faq[]` (Stage C),
   plus `Product`/`ProductGroup` schema (Stage B) with price, availability, and — where a
   real report exists — the tested purity as a property. Schema is a CTR/eligibility lever
   (rich results, merchant listings), NOT a ranking shortcut; implement required fields
   correctly so we qualify for richer listings.
4. Core Web Vitals gate: product + category pages must pass the 75th-percentile thresholds
   (LCP ≤ 2.5s, INP ≤ 200ms, CLS ≤ 0.1). Biggest lever is the hero/product image — serve
   sized `srcset`, WebP/AVIF, compressed under ~200 KB. This helps both ranking and
   conversion.
5. Ensure product pages are server-rendered / crawlable (not JS-only content) so both search
   and AI crawlers can read the facts — the structured factual copy from Stage C is the
   highest-value citable content, so it must be in the HTML, not injected client-side only.

**Acceptance tests:**
- `robots.txt` allows GPTBot/PerplexityBot/Google-Extended/ClaudeBot; verify none are
  disallowed.
- Sitemap validates and is submitted to Bing (document the submission).
- A product with `faq` emits valid FAQPage schema; a consolidated product emits valid
  ProductGroup+hasVariant (Google Rich Results test passes).
- Product/category pages pass CWV thresholds on mobile (measure LCP/INP/CLS).
- Product factual copy is present in server-rendered HTML (view-source shows it, not just a
  JS bundle).

**Dependency:** Stage G's schema pieces need Stage B (ProductGroup) and Stage C (faq) done
first; robots.txt/Bing/CWV can happen anytime. Run G after C, ideally alongside F.

---

## Rollout order & dependencies

```
A (peptide subcats + collections) ─┬─► B (variant merge, backup+rollback) ─┐
                └─► C (content templates) ─► D (calculator, after C)        │
                                              │                            │
                          E (brand + stock) ◄┘ (independent of D, needs A)  │
                                              │                            │
                                   F (homepage) ◄── needs A, C, E           │
                                              │                            │
                     G (SEO/GEO plumbing) ◄───┴── schema needs B + C ◄──────┘
                        (robots/Bing/CWV anytime; run alongside F)
```

Per-stage production gate: acceptance tests green + (for B) a rehearsed rollback + stage
note appended to HANDOFF.md. Stage B (data migration) gets extra care: backup verified
restorable BEFORE running, grouping approved by me BEFORE merging.

## Process

- One stage per session. Plan mode first; for B and C show the schema/grouping and wait for
  approval before touching data.
- If the spec conflicts with the codebase, stop and flag — don't improvise.
- Standard report after each stage; do not commit until reviewed; do not push.