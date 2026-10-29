# Stage journal — Onyx Genetics Storefront

Append one note per completed stage. Backend contract source of truth:
`nutrition_store/HANDOFF.md`.

---

## Waitlist form (out-of-stock signups) — DONE (2026-07-09)

**What:** quiet inline form under the disabled Add-to-cart button, shown only when the
selected variant is out of stock. Builds against the real backend contract in
`nutrition_store/HANDOFF.md` (Waitlist section) — `POST /store/waitlist`.

- `src/lib/actions/waitlist.ts` — `joinWaitlist()` server action, `sdk.client.fetch`
  (SDK auto-attaches the publishable key). Maps the SDK's `FetchError` (`.status`/`.message`
  — confirmed against `@medusajs/js-sdk`'s `client.d.ts`/`client.js`, which surfaces the
  backend's own JSON `message` field verbatim) into `{status: 200|400|429|"error",
  message}`.
- `src/modules/products/components/waitlist-form/index.tsx` — email + optional-consent
  (default **unchecked**) + Cloudflare Turnstile widget (plain script embed, no new npm
  dependency — `next/script` + `window.turnstile.render`, theme `dark`, fixed
  `min-h-[65px]` container so the widget's own load-in causes no layout shift). Submit
  guarded by a ref (not state) so a rapid double-click can only ever call the server
  action once; on success, a 60s internal cooldown blocks any further submit attempt.
  `submitAction` is an injectable prop (default = the real `joinWaitlist`) — the one seam
  needed to test response-state handling without network calls.
- Wired into `src/modules/products/components/product-actions/index.tsx`: renders when
  `stockState === "out_of_stock" && selectedVariant` (reuses the existing
  `resolveStockState` gate already in that file — no new stock logic). Left the sticky
  mobile `MobileActions` bar untouched (condensed CTA only, no room for this form; the
  main block it sits in is already in-flow at all widths).
- `.env.template` (new file — none existed before) — `NEXT_PUBLIC_TURNSTILE_SITE_KEY`.
- Brand: reused this repo's actual accent (`#ccff00`) and input styling from
  `contact-form.tsx` — no new palette.

**Test infra added (none existed before this stage):** `tsx`, `jsdom`, `global-jsdom`,
`@testing-library/react`, `@testing-library/user-event` as devDependencies; a `"test"`
script (`node --import tsx --import global-jsdom/register --test
src/**/*.test.{ts,tsx}`) — this also makes the two pre-existing test files
(`resolve-stock-state.test.ts`, `sort-products.test.ts`) runnable for the first time.

**Tests:** `npm run test` — 25/25 green (19 pre-existing + 6 new in
`waitlist-form/index.test.tsx`: consent unchecked by default, rapid double-submit calls
the action exactly once, 200/400/429 response states each render correctly, Turnstile
container reserves its layout space). `npm run build` clean (pre-existing
`typescript.ignoreBuildErrors: true` unchanged; the two new `.test.tsx`-only type errors
mirror the identical, pre-existing gap on the other two test files — not a regression).

**Manual browser verification (Playwright, ad hoc — not committed):** real single-variant
out-of-stock product page — form present, checkbox unchecked, no console errors, 375px
and desktop screenshots both clean. Real in-stock product page — form absent. Did **not**
verify the true 200 happy path or real Cloudflare siteverify round trip — blocked on the
pending manual step below (no site key configured yet), by design (fails closed with no
sitekey rather than rendering a broken widget).

**Manual post-merge steps (not done here):**
1. Create the Turnstile site in the Cloudflare dashboard; set
   `NEXT_PUBLIC_TURNSTILE_SITE_KEY` here (matching secret already wired backend-side).

---

## Waitlist redesign + two bugs — DONE (2026-07-10)

**What:** the waitlist block was reading as a muted system notice; redesigned it as the
conversion moment it actually is, plus fixed two bugs found while testing end-to-end on a
real out-of-stock variant.

**Bug 1 ("~2 weeks" rendering as "-2 weeks") — not a code bug.** Checked the live DB
directly (`select metadata->>'restock_eta', encode(convert_to(...,'UTF8'),'hex') ...`):
the stored value is a literal ASCII hyphen (`0x2d`), not a tilde (`0x7e`) — a data-entry
slip in Medusa Admin's metadata editor, not a formatter defect. `formatRestockEta`
(`src/lib/util/resolve-stock-state.ts`) already returns any non-ISO-shaped string
verbatim, and `formatRestockEta("~2 weeks") === "~2 weeks"` already had a passing test
before this stage. Did not change the function — added one more test documenting that
hyphen-led free text (the actual reported string) also survives verbatim. **The actual
fix is a data fix**: correct the variant's `restock_eta` metadata value in Admin.

**Bug 2 (mobile sticky bar collision + dead-end CTA) — fixed in
`product-actions/mobile-actions.tsx`:**
- Moved `<StockBadge>` out of the cramped `title — price` inline row into its own
  full-width line below the quantity/CTA row — nothing left to collide with at 375px.
- The sticky CTA no longer dead-ends on a disabled "Out of stock" button: when a valid
  variant is selected and out of stock (`oosRedirect`), the button stays enabled, reads
  "Notify me", and its click handler calls `document.getElementById("waitlist-email")
  ?.focus()` (id already present on the email input — focusing it triggers the browser's
  native scroll-into-view, no manual scroll-timing to coordinate) instead of
  `handleAddToCart`.

**Visual redesign — `waitlist-form/index.tsx`:** distinct card, brand acid-green accent
(`border-2 border-[#ccff00]/50`, faint green wash background) rather than amber — kept
green because it's the same accent already carrying the submit button and price on the
same page, so the card reads as one brand moment rather than a competing color; amber
stays reserved for its existing low-stock meaning. Copy reframed value-forward: hero line
**"Get 10% off your next order"** (`text-lg font-extrabold`, the biggest text in the
block) replaces the old apologetic "we'll email you a code" framing; submit button bumped
to `py-3 text-base`; success state raised to the same visual weight with a checkmark icon
(same treatment as `contact-form.tsx`'s success state, for consistency). Turnstile
container/behavior untouched — the "for testing only" watermark is the widget's own
notice for test sitekeys and isn't something to style around.

**New pure predicate** — `shouldShowWaitlistForm(stockState, hasSelectedVariant)` in
`resolve-stock-state.ts`, used by `product-actions/index.tsx`'s gate. Extracted mainly so
"the block renders only for OOS" has a real, non-mocked test — `ProductActions` pulls in
`next/navigation` router hooks that don't work outside Next's App Router runtime under
the plain `node:test`+RTL setup, so a full component render wasn't practical.

**Tests:** `npm run test` — 33/33 green (25 previous + 8 new: 3 `formatRestockEta`/
`shouldShowWaitlistForm` cases in `resolve-stock-state.test.ts`, 4 new in the new
`mobile-actions.test.tsx` — DOM order, OOS-redirect focus behavior, in-stock case
unaffected). `npm run build` clean.

**Manual browser verification (Playwright, ad hoc):** redesigned card screenshotted at
desktop and 375px — hero line prominent, on-brand border, no clipping. Mobile sticky bar:
stock line no longer inline with price, "Notify me" CTA active and green; clicking it
scrolled the page and focused `#waitlist-email` (`document.activeElement.id ===
"waitlist-email"` confirmed programmatically, plus visually in the after-click
screenshot — email field shows the acid-green focus ring).

---

## Three storefront fixes — DONE (2026-07-10)

**Fix 1 (uneven variant-button heights)** — `option-select.tsx`: the row was
`flex flex-wrap` + fixed `h-10`, so a 2-line label ("10 ampoules (2ml)") grew past its
siblings. Switched to `grid grid-cols-[repeat(auto-fit,minmax(100px,1fr))]` with a
uniform `min-h-[3.75rem]` on every button (not just `items-stretch`, which only
equalizes siblings sharing a row — measured empirically that the 2-line item can end up
alone in its own row at 375px, where row-scoped stretch has nothing to match against;
confirmed via Playwright `getBoundingClientRect()` before/after: `[40,40,40,58]` →
`[60,60,60,60]`). Selection logic untouched.

**Fix 2 (stray Turnstile widgets)** — could not get the widget to visibly duplicate
through live variant-switching (two candidate products for that test,
`anapolon-50`/`anastrozole-arimidex`, crash on an unrelated pre-existing data/rendering
bug — `Cannot read properties of undefined (reading 'images')` — left untouched, out of
scope). Best explanation given the timing (reported while I was actively editing/saving
during the session): dev-only Fast Refresh remounts not lining up cleanly with the
widget's own cleanup. Applied defense-in-depth regardless of the exact trigger, in
`waitlist-form/index.tsx`: clear the container's DOM (`innerHTML = ""`) immediately
before minting a new widget (idempotency insurance against any remount path, not just the
ones the `ref` guard already anticipates), and constrained the container
(`overflow-hidden max-w-full`) so nothing can visually escape the card regardless.
Added a real regression test — renders under `<React.StrictMode>` with a DOM-mutating
mock `render()`/`remove()`, asserts the container never holds more than one widget node
even across the dev double-invoke (this is the part of the bug that's deterministically
testable; call-count alone isn't the right invariant, since StrictMode legitimately calls
`render()` twice by design — checked and rejected that framing before landing on the DOM
node count instead).

**Fix 3 (OOS listing cards)** — `product-preview/index.tsx`: added a Tailwind arbitrary
descendant-selector grayscale (`[&_img]:grayscale [&_img]:opacity-50`) on `Thumbnail`'s
existing `className` prop rather than editing the shared `Thumbnail` component itself,
plus a new absolute-positioned amber badge (`Out of stock · <eta>` when all variants
agree, reusing `resolveProductRestockEta`/`formatRestockEta`) overlaid on the image,
top-left. Amber (existing low-stock color), not a new third color. The bottom
`<StockBadge>` text line is untouched (still carries `low_stock`/`in_stock` too). Card
link wrapper untouched — still fully clickable to the product page. Confirmed
`quick-add-button.tsx` already disables + visually dims for genuinely OOS **simple**
products — no change needed there.

**Tests:** `npm run test` — 34/34 green (7 new: 1 in `option-select` — no, CSS grid
layout isn't meaningfully assertable in jsdom, verified via Playwright instead; 1 new
StrictMode/DOM-invariant test in `waitlist-form/index.test.tsx`). Attempted a
`product-preview/index.test.tsx` but removed it — rendering this async server component
directly in the plain `node:test` + RTL setup hits Next's `server-only` module guard
(throws by design outside a real Next server-component boundary), a deeper
incompatibility than the router-hook one already documented; not worth mocking that
boundary for one card's cosmetic conditional. Relied on Playwright instead. `npm run
build` clean.

**Manual browser verification (Playwright, ad hoc):** variant buttons — equal height
confirmed numerically and visually, no horizontal overflow at 375px. Turnstile — 0
widget-related elements on an in-stock PDP, exactly 1 container/script on an OOS PDP,
contained within the card (screenshot). Listing — Masteron category screenshot shows 6
OOS cards with the amber badge + dimmed image, 6 unchanged in-stock cards side by side.

---

## Low-stock card badge follow-up — DONE (2026-07-10)

**What:** extended Fix 3's image-overlay badge pattern to `low_stock` too
(`product-preview/index.tsx`), same amber chip, "Low stock" text, `data-testid=
"low-stock-image-badge"`. Confirmed with you first: **no image desaturation** for
low_stock (unlike out_of_stock) — the item is still purchasable, and dimming it would
misrepresent it as unavailable per this repo's own honesty rule ("Stock: show honestly...
Never fake stock"). Bottom `StockBadge` text line unaffected either way.

**Verified:** Testosterone category listing — "Testosterone Enanthate 250mg/ml 30ml ZPHC"
(the specific product reported) now shows the amber "LOW STOCK" badge with its photo
still full color, alongside unchanged out-of-stock (badge+dim) and in-stock (unchanged)
cards. `npm run test` 34/34, `npm run build` clean.

**Follow-up (same day):** the bottom-of-card text line (above the price) still read
"Low Stock" as an amber pill — same component (`stock-badge/index.tsx`) used on the PDP
too. Added a `variant?: "pill" | "plain"` prop (default `"pill"`, PDP callers untouched)
so the card can request the plain-gray treatment (same weight as "Out of stock") for
that line specifically, since the amber pill now lives on the new image badge instead —
`product-preview/index.tsx` passes `variant="plain"`. Verified on the same product: text
above price now reads as plain gray, image badge unchanged.

---

## Product page crash on missing/deleted product — DONE (2026-07-10)

**What:** `anapolon-50` and `anastrozole-arimidex` (surfaced during the previous stage's
Turnstile repro attempts) crashed with `Cannot read properties of undefined (reading
'images')` — white screen, not a 404.

**Root cause** — `src/app/[countryCode]/(main)/products/[handle]/page.tsx`:
`getImagesForVariant(pricedProduct, ...)` ran *before* the `if (!pricedProduct)
notFound()` guard. `pricedProduct` is `undefined` whenever the handle doesn't match a
live product; inside the function, the first branch (`!selectedVariantId`, the common
no-`?v_id=` case) does `return product.images` — `product` is the undefined parameter,
throwing exactly the reported error.

**Why these two** — confirmed via direct DB check and the real store API (not guessed):
every row for both handles has `deleted_at` set (soft-deleted since 2025-12-08, zero live
variants); `GET /store/products?handle=anapolon-50` returns `{"products":[],"count":0}`.
Not a live-catalog data-shape bug — these products simply don't exist anymore. Found via
an earlier SQL query (previous stage) that didn't filter `deleted_at`.

**Catalog-wide check:** no currently-live product has zero variants; live variants with
zero linked images (~10+ found) already render fine (Medusa's query.graph returns `[]`
for an empty expanded relation, not `undefined` — confirmed on `methandienone-10mg` via
curl). The real exposure: **43 distinct handles are fully soft-deleted with no live
replacement** — any of them, or any nonexistent handle, hit this same crash. A systemic
"visit any dead/nonexistent product URL" bug, not a two-product issue.

**Fix:** moved the `notFound()` check immediately after fetching `pricedProduct`, before
`getImagesForVariant` is called. Also hardened `getImagesForVariant` itself
(`variant.images?.length`, `product.images ?? []` throughout) as defense-in-depth so a
missing image is never a crash condition regardless of caller ordering.

**Verified:** all 4 spot-checked dead handles (the original 2 + 2 more from the list of
43) now render a proper Next.js not-found page, zero console errors. Re-ran the
previously-blocked Turnstile variant-switching check on a live product with 3 OOS
variants (`methenolone-enanthate-100mgml-1ml-amp-zphc`): clicked through all 3 options
plus 6 rapid stress clicks — exactly 1 `turnstile-container`/script/`waitlist-form`
throughout, confirming Fix 2 from the prior stage holds under real variant switching, not
just the StrictMode unit test. `npm run test` 34/34, `npm run build` clean.

---

## Storefront Redesign Stage C — content templates with tabs — DONE (2026-07-10)

Source spec: `docs/storefront-redesign-tech-spec.md`. Stages A/B were intentionally
reverted by the user (manual category/variant work in prod Admin, not automated) — built
Stage C fresh, including `resolveProductTemplate` which didn't exist anywhere in code
despite being mentioned as "already exists" in an earlier version of the brief.

**What:**
- `src/lib/util/resolve-product-template.ts` — `resolveProductTemplate(product)`.
  `metadata.template` override wins when it's exactly `"compound"`/`"peptide"`; else
  infers from root category (`category.parent_category ?? category`, matched on
  `handle === "peptides"`); else `"compound"`. Verified against the real live category
  tree (`Peptides` root + 5 subcategories, `HGH` a separate root) via the store API before
  writing this, not assumed.
- `src/modules/products/components/product-content/` — new component tree: `index.tsx`
  (entry point: reads `metadata.content`; `content.type` is the source of truth for which
  layout renders, `resolveProductTemplate` is only consulted to warn on a mismatch — never
  to blank the page, see deviations below), `compound-content.tsx` / `peptide-content.tsx`
  (tab panel lists),
  `tabs-shell.tsx` (Radix `Tabs` desktop strip + the existing `Accordion` primitive from
  `product-tabs/accordion.tsx` for mobile, toggled via the `small:` (1024px) breakpoint —
  no new accordion component), `dosage-scale.tsx` (beginner/intermediate/advanced as a
  3-stage acid-green bar, not raw text), `content-blocks.tsx` (text/image/callout/table,
  in order), `faq-section.tsx`, `also-known-as.tsx`, `calculator-placeholder.tsx`
  (Stage D reservation — see deviations below), `labels.ts` (tab-label lookup, written
  generically so nothing says "Peptide" — verified against a real HGH product, see below),
  `read-content.ts` (defensive runtime shape check; malformed/absent content → `null`,
  never throws), `types.ts`.
- `src/modules/products/templates/index.tsx` — one new line,
  `<ProductContent product={product} />`, placed where `<ProductSideEffects
  product={product} />` already sits. `ProductSideEffects` (legacy `overview_html`) and
  `ProductSpecs` (legacy flat/nested specs) are untouched and keep rendering for any
  product without a valid `metadata.content` — confirmed with the user before building
  that 151 of 158 live products currently have `overview_html` and zero have
  `metadata.content` yet, so replacing those blocks outright would have blanked real
  content on production today.
- New dependency: `@radix-ui/react-tabs` (desktop tab strip; pairs with the
  already-installed `@radix-ui/react-accordion`).

**Deviations from the spec doc:**
- Reconstitution (vial amount/unit/enabled) lives on **variant metadata**
  (`variant.metadata.reconstitution`), not in `metadata.content` — this turn's schema
  instructions omitted it from content entirely and phrased the Calculator gate as "any
  variant has reconstitution.enabled." Read defensively in `calculator-placeholder.tsx`;
  an invalid shape is silently treated as disabled rather than crashing.
- `ProductContent` treats `content.type` as the source of truth for layout — content is
  hand-authored, so it's what was explicitly meant. `resolveProductTemplate` is only
  consulted to catch a mismatch (e.g. peptide-shaped content on a product whose
  category/override resolves to compound) and `console.warn` loudly; it never overrides
  `content.type` and never blanks the page — a mismatch is a content mistake to surface,
  not a reason to hide the page. (Revised after initial review: the first version rendered
  nothing on a mismatch, which was itself the "silent blank page" failure mode being
  guarded against.)
- `/mnt/skills/public/frontend-design/SKILL.md` did not exist on this machine — the dead
  path has since been removed from `CLAUDE.md` and replaced with an inline design rule.
  This stage was built using the codebase's own existing brand implementation instead
  (acid-green `#ccff00`, the existing `Accordion` primitive, the `small:` breakpoint
  convention) rather than block on
  a missing file.

**Tests:** `src/lib/util/resolve-product-template.test.ts` (7 cases: override wins over
category, override wins for the HGH case, Peptides subcategory, Peptides root itself,
unrelated category, no data fallback, garbage override value ignored) +
`src/modules/products/components/product-content/index.test.tsx` (14 cases: compound vs
peptide tab labels, HGH scenario renders peptide layout with no "Peptide" text anywhere in
that section, coaUrl present/absent, faq present/absent, overview-only product renders
cleanly, all 4 contentBlocks types in order, no content → renders nothing, malformed
content → renders nothing not a crash, Calculator tab present/absent by variant
reconstitution, mobile accordion trigger expands). `npm run test` — all 55 green (14 new +
41 pre-existing, zero regressions). `npm run build` clean (3622 static product pages).

**Manual verification:** patched two real products on the local dev DB —
`delatestryl-300-test-e-1ml-amp-canadabiolabs` (compound: dosage/profile/side-effects/lab
tabs, alsoKnownAs, a callout + table content block, all confirmed rendered server-side via
curl) and `spectros-140iu-hgh-spectrum-pharma` (HGH via `metadata.template: "peptide"`
override + a variant with `reconstitution.enabled`: Key Highlights/Research/Calculator/Lab
Results tabs rendered, Calculator showed the raw `14 IU` value, and grepping the rendered
`peptide-content` section confirmed zero "Peptide" wording in any visible label — the only
"peptide" hits on the whole page were in unrelated RelatedProducts copy and internal RSC
JSON, not this stage's UI). Both products reverted back to no `metadata.content`
afterward. Did not get to a real browser at 375px (no browser/screenshot tool available in
this environment) — verified the accordion markup is present in the server-rendered HTML
and covered keyboard-trigger expansion in the component test instead; recommend a manual
375px check in an actual browser before shipping.

**Follow-up (2026-07-11, real Admin UI usage):** the `content` metadata table field turned
out to be edited as a raw string (Admin's generic metadata editor), not an object — fixed
backend-side (see `nutrition_store/HANDOFF.md`), no frontend change needed since
`readProductContent` already only ever sees the final persisted object. Separately, added
an optional `title` field to `text`/`callout` contentBlocks (`content-blocks.tsx`,
`types.ts`) — a real authoring need (a titled paragraph/callout) that surfaced immediately
on first real use; renders as a heading above the body when present, nothing changes when
absent. `npm run test` 57/57, `npm run build` clean.

**Backend half:** `nutrition_store/HANDOFF.md` has the schema/validation side of this
stage.

## Product page restructure — slider gallery, info order, variant chips — DONE (2026-07-13)

**What:** PDP rebuilt around proven patterns (Gymshark gallery/chips, Immortals info
order) + GEO: key facts visible without a click, ALL tab content in the initial HTML.

- `image-gallery/gallery-view.tsx` (new) + `image-gallery/index.tsx` — vertical image
  wall replaced by a slider. Desktop: main image + thumbnail strip (acid-green active
  border); mobile: native CSS scroll-snap swipe carousel with dot indicators. No new
  dependency; every image stays mounted in the DOM (inactive slides CSS-hidden). The
  existing yet-another-react-lightbox zoom is unchanged (its CSS imports are why the
  markup lives in gallery-view.tsx — the node test runner can't parse CSS).
- Info column order (templates/index.tsx, 2-col layout): breadcrumb row → gallery left /
  sticky right column: title → subtitle → line-clamp-3 description → price → variant
  chips → stock+qty+CTA (+waitlist) → Shipping & Delivery + Specifications accordions
  (moved from the old left-column ProductTabs, which is deleted;
  `product-info-accordions/index.tsx` is its successor, force-mounted for SEO).
- `product-subtitle/index.tsx` (new) — "Oxandrolone — also known as Anavar" from
  `metadata.active_ingredient` + `metadata.content.alsoKnownAs` (read leniently, NOT via
  readProductContent — a broken dosage section must not hide the subtitle). DATA GAP:
  0 products have alsoKnownAs authored, 28 lack active_ingredient — admin content task.
- Variant chips (`option-select.tsx` rewritten) — values grouped by physical form via
  `lib/util/resolve-variant-form.ts` (value keyword wins over `metadata.form` fallback;
  a product mixing ampoules and vials gets two groups, each with icon + header). Icons:
  lucide Pill; custom `common/icons/vial.tsx` + `ampoule.tsx` (lucide has neither).
  Out-of-stock values: rendered but muted+strikethrough, `aria-disabled`, not clickable,
  `title="Out of stock"`; a value is OOS only when EVERY variant matching it (and the
  other selected options) is OOS — reuses `resolveStockState`, inventory already fetched.
- Breadcrumb (`common/components/breadcrumbs` restyled, `product-breadcrumb/` new):
  compact `Home › Category › Product` line, text-xs; mobile collapses to a quiet
  "‹ Category" link. BackButton usage dropped from the PDP (component itself untouched).
- SEO fix beyond the spec's assumption: Radix Tabs/Accordion UNMOUNT inactive panels —
  tab content was NOT in view-source before. Now force-mounted: tabs-shell.tsx
  (`forceMount` + `data-[state=inactive]:hidden`, switch animation is CSS
  `animate-fade-in-top`, framer-motion FadeMount removed there) and
  product-tabs/accordion.tsx (`radix-state-closed:hidden` — Radix skips the hidden attr
  under forceMount; caveat: collapsed-open height animation may jump since closed
  content measures 0, accepted for SEO).

**Verified:** `npm test` 101/101 (new: resolve-variant-form, option-select groups/OOS,
product-subtitle, gallery-view DOM/dots, tabs-shell force-mount, info-accordions).
Live view-source on running dev: "Cycle length"/"Anabolic rating"/"Detection time"
present without any tab click; Methenolone Enanthate ZPHC page renders "Ampoules" +
"Vials" groups with 3 strikethrough OOS chips; 6 gallery images ×2 (desktop+mobile) in
HTML. Prices untouched. One pre-existing tsc error in mobile-actions.tsx:151 (quantity
button, code not touched) — repo has many pre-existing tsc errors outside this task.

## Підзаголовок: pill речовини + chips назв + підсвітка в тексті — DONE (2026-07-13)

**What:** активна речовина та альт-назви зроблені помітними на сторінці товару.

- `product-subtitle/index.tsx` — редизайн: `active_ingredient` (плоский metadata) →
  acid-green «pill»; `alsoKnownAs` (ліберально з metadata.content) → приглушені chips з
  міткою «Also known as». Джерела не змінені; нема даних → null.
- `src/lib/util/highlight-term.tsx` (новий) — `highlightTerm(text, term)`: кожне повне
  (whole-word, case-insensitive, Unicode-межі) входження терма → `<span
  text-[#ccff00]/80 font-medium>` (приглушений зелений, без фону — «не шум»). Екранує
  спецсимволи; нема терма/збігу → рядок як є.
- `product-content/index.tsx` дістає `metadata.active_ingredient` і передає в
  `compound-content.tsx`/`peptide-content.tsx`; overview-абзаци (what/howItWorks/mechanism)
  обгорнуті `highlightTerm(..., activeIngredient)`.

**Backend contract:** `active_ingredient` завозиться через `content/<handle>.json` →
`nutrition_store` import-скрипт (див. його HANDOFF).

**Verified:** `npm test` 106/106 (новий highlight-term: whole-word/усі входження/metachar/
без збігу; оновлений subtitle: pill+chips/лише pill/лише chips/порожньо). tsc по цих файлах
чисто. Live view-source oxandrolone-zphc: pill «Oxandrolone», chips Anavar/Oxandrolonum/Var/
Oxandrin, у overview «Oxandrolone» приглушено-зелене.

**Прапор для ревʼю:** «Also known as» тепер у двох місцях — підзаголовок і overview-панель
(компонент `AlsoKnownAs`). Лишив обидва; можливо, прибрати з overview.

## Storefront Redesign Stage D — reconstitution calculator — DONE (2026-07-18)

Source spec: `docs/storefront-redesign-tech-spec.md` Stage D. Replaces the Stage C
`calculator-placeholder.tsx` with the real interactive calculator.

**What:**
- `src/lib/util/reconstitution.ts` (new) — all math, pure and React-free:
  `computeDraw` (mg/mcg and IU modes, discriminated result with
  `no-water`/`invalid-input`/`exceeds-syringe` guards — NaN/Infinity can never escape),
  `mgEquivalent` (IU-mode informational display only, editable factor, default
  `DEFAULT_IU_PER_MG = 3`), `formatUnits`/`formatMl` display rounding, plus
  `readReconstitution`/`hasReconstitutionEnabled` moved here from the deleted placeholder.
  U-100 fixed (`SYRINGE_ML = 1`, `SYRINGE_UNITS = 100`), no syringe-type selector.
- `src/modules/products/components/reconstitution-calculator/index.tsx` (new,
  `"use client"`) — self-contained (reads everything from `product.variants`, so it drops
  into the future tool-hub unchanged): vial chip picker when 2+ variants have a valid
  config; BAC-water + dose inputs (`inputMode="decimal"`, comma tolerated); mcg/mg toggle
  in mg mode; editable IU/mg factor field in IU mode; result hero number in acid-green
  inside an `aria-live="polite"` region; CSS-only U-100 syringe bar (ticks every 10 units,
  `motion-reduce:transition-none`); amber exceeds-syringe warning replaces the number;
  blend note + "total draw" labelling when `isBlend`; mandatory research disclaimer.
- `compound-content.tsx` / `peptide-content.tsx` — placeholder import swapped for the new
  component + util; `calculator-placeholder.tsx` deleted.

**Deviations from the spec doc:**
- Gating tightened vs the Stage C placeholder: `enabled: true` with an unusable
  `vialAmount`/`unit` (non-positive, non-number, unknown unit) now counts as disabled —
  no Calculator tab — instead of rendering raw garbage values.
- Blend handling: spec allowed hide-or-note; chose "show with explicit note" ("result is
  total draw volume, not a single-component dose"), dose label becomes "Desired total
  dose".
- No new dependencies (syringe visual is hand-rolled CSS per the design doc's "no heavy
  chart library" rule).

**Tests:** `src/lib/util/reconstitution.test.ts` (20: both spec worked examples exact —
0.20 ml/20 units and 5.6 units — mg↔mcg equivalence, all guard reasons, exactly-1-ml
boundary, factor editing incl. the 2.8 IU/mg label case, `readReconstitution` malformed
shapes, display rounding) + `reconstitution-calculator/index.test.tsx` (14: worked
examples through the real inputs, comma decimals, unit toggle, empty/zero/non-numeric
guards with a no-NaN-on-screen assertion, exceeds warning suppresses the number, blend
note + total-draw label with a Super Slim Mix-shaped fixture, disclaimer, variant
switching changes the math, no-picker single variant, garbage config renders nothing).
`npm run test` 140/140, `npm run build` clean (backend running).

**Manual verification:** patched three real products on the local dev DB (metadata backed
up to scratchpad first, restored byte-identical after): `bpc-157-25mg-zphc` (mg mode),
`somatropin-191aa-15iu-hgh-bacteriostatic-water-canadabiolabs` (IU mode: factor field
present, default 3), `super-slim-mix-zphc` (blend: note + "Desired total dose" in the
server HTML). All three pages server-rendered the calculator twice (desktop tab + mobile
accordion) via curl. NOTE: `spectros-140iu-hgh-spectrum-pharma` is unusable as a local
fixture now — `next.config.js` 301s all spectros handles to
`spectros-hgh-somatropin-spectrum-pharma`, which doesn't exist in the local dev DB → 404.
Same caveat as Stage C: no real browser available here, so the 375px layout and
keyboard-only pass are covered by construction (native inputs, `focus-visible` outlines,
`xsmall:` grid collapse) + component tests; recommend a quick manual browser check.

## Storefront Redesign Stage D.1 — calculator UI redesign (reference-style UX) — DONE (2026-07-18)

User rejected the Stage D bare-inputs look ("халтура") against their reference screenshot
(gold preset-chip calculator). Rebuilt the component's UX to the reference's structure,
brand-skinned (dark + `#ccff00`, NOT gold):

- **Guided questions with preset chips**: syringe volume 0.3/0.5/1.0 ml (selectable rows
  with hand-rolled SVG syringe illustrations, barrel length scaled per size); BAC water
  1/2/3/5 ml + Other; dose 50/100/250/500 mcg, 1 mg, 2.5 mg + Other (mg mode) or
  1/2/3/4 IU + Other (IU mode). "Other" reveals the old free inputs. Chip state uses an
  explicit `"other"` sentinel — the custom value never masquerades as a preset.
- **Defaults preselected** (2 ml water, 500 mcg / 2 IU dose, 1.0 ml syringe) → live
  result on open.
- **Sentence result**: "Your vial concentration is **X mg/ml**. To achieve **D**, draw
  **Y ml** (**Z units** on a U-100 syringe)." + "Bonus tip:" line, values bold acid-green.
- **Ruler scale** replaced the thin bar: minor ticks every 2 units, labelled majors every
  10, range = syringe × 100 (30/50/100), translucent green draw zone with a solid edge.
- **Syringe selector is a spec deviation** — spec said "no syringe-type selector for
  now"; explicit user override (2026-07-18). All sizes U-100; `computeDraw` gained a
  `syringeMl` param (default 1) for the exceeds guard; `SYRINGE_SIZES` exported. Vial
  stays product-bound (user decision — free vial choice deferred to the tool-hub).
- Guards/blend/disclaimer semantics unchanged; exceeds message now names the chosen
  syringe size and suggests picking a bigger one.

Files: `src/lib/util/reconstitution.ts` (syringeMl param), rebuilt
`reconstitution-calculator/index.tsx`, tests updated:
`reconstitution.test.ts` 22 (added 0.3/0.5/1.0 exceed + boundary cases),
`reconstitution-calculator/index.test.tsx` 15 (chip flows, instant defaults, syringe
rescale, Other flows with the old guard scenarios). `npm run test` 143/143,
`npm run build` clean. Verified server-rendered on the local dev fixtures
(bpc-157 mg, spectros IU — redirects in `next.config.js` were commented out by the user,
so the spectros URL resolves again; super-slim blend). Test metadata patches are STILL
LIVE on the dev DB (user is reviewing visually); backups in the session scratchpad.

## Storefront Redesign Stage D.2 — calculator decoupled from variants — DONE (2026-07-18)

Bug: after the user defined real variants on the HGH product (150 IU / 140 IU), those new
variants carried no `reconstitution` metadata, so the variant-gated Calculator tab vanished
on their `v_id` URLs. Also, vial size varies too much to bind to a variant (NAD vials are
500 mg). Fix: decouple the calculator from variants entirely.

- **Gate moved to product level**: `product.metadata.reconstitution.enabled` (was variant
  metadata). `hasReconstitutionEnabled` / new `readProductReconstitution` read the product,
  not variants. Variant `reconstitution` metadata is no longer read anywhere.
- **Mode auto-resolved**: `resolveReconstitutionUnit(product)` → IU when the product is HGH
  (root category handle `hgh`, or `metadata.class` contains "HGH", or `active_ingredient`
  === "HGH"); else mg. Overridable with an explicit `metadata.reconstitution.unit`.
- **Vial is user input now**: new "How many {mg|IU} are in your vial?" question with preset
  chips (`VIAL_PRESETS` — mg 2/5/10/15/30, IU 100/140/150) + "Other" custom field (covers
  NAD 500 mg). Default `DEFAULT_VIAL` mg→5, IU→140. Variant chip picker removed.
- Reference-style UI (syringe selector, water/dose chips, sentence result, ruler, bonus
  tip, guards, disclaimer) unchanged. `computeDraw` still takes `syringeMl` from Stage D.1.

Files: `src/lib/util/reconstitution.ts` (removed variant `readReconstitution`/
`ReconstitutionConfig`; added `resolveReconstitutionUnit`, `readProductReconstitution`,
`VIAL_PRESETS`, `DEFAULT_VIAL`), rebuilt vial block in
`reconstitution-calculator/index.tsx`. Tests: `reconstitution.test.ts` 25 (unit-resolution
+ product-gate cases replace variant-read), `reconstitution-calculator/index.test.tsx` 17
(product fixtures, vial chip + Other/NAD flow, HGH→IU auto), `product-content/index.test.tsx`
gating tests now set product-level metadata. `npm run test` 148/148, `npm run build` clean.

Verified server-render on the SELECTED-VARIANT URL that was broken
(`/us/products/spectros-140iu-hgh-spectrum-pharma?v_id=variant_01KXTP5QW0AWV1ZSR98VF970E5`):
calculator present, IU mode, 140 IU default. bpc-157 mg + super-slim blend also confirmed.

**Backend contract change — DONE (cross-repo rule — backend owns the contract):**
`reconstitution` now belongs on the PRODUCT, not the variant. Backend caught up the same
day (`nutrition_store/HANDOFF.md` Stage D.2): authored as a top-level key in
`content/<handle>.json` like `active_ingredient`, validated by `validateReconstitution`
(`.strict()` — a stale `vialAmount` is rejected), split into `metadata.reconstitution` by
import-content, round-tripped by export-content; documented in `content/README.md`. Spec
`storefront-redesign-tech-spec.md` updated (content-schema note + Stage D AS-BUILT block).
Dev fixtures are patched to product level (bpc/spectros `{enabled:true}`, super-slim
`{enabled:true,isBlend:true}`); variant test metadata cleared. Still live for review.

## Storefront Redesign Stage E — brand badges + catalog filters + US-domestic purge — DONE (2026-07-21)

Brand = `product.type` (Medusa product type; backend half in `nutrition_store/HANDOFF.md`
Stage E). Stock-badge deliverables were already built in previous stages (3-state resolver,
card image-badges, PDP badge near price, restock_eta plumbing) — re-verified, not rebuilt.

- **Data:** `lib/data/products.ts` — `*type` added to list fields; `listProductsWithSort`
  now fetches up to 500 (was 100 — with 156 products, pages past #9 were PHANTOM: count
  said 13 pages, fetch had 100 items, slices came back empty; last pages now render),
  takes `brandTypeId` (server-side `type_id` filter) + `inStockOnly` (in-memory via
  `resolveProductStockState`; `count`/pagination reflect the filtered set; low_stock IS
  purchasable so it stays visible). New `lib/data/product-types.ts` (`listBrandTypes`,
  slug↔type map). Unknown `?brand=` slug filters to zero, never silently unfiltered.
- **UI:** card brand caption now `product.type.value` (was `collection?.title ||
  "Spectrum Pharma"` hardcode — collections are Stage A curation, not brands); no type →
  no caption. PDP: brand pill above the title (`product-info`, `data-testid="brand-badge"`).
  New `store/components/brand-filter` — brand chips (toggle, mutually exclusive) +
  "In Stock only" pill; URL params `?brand=<slug>&stock=in`, changing filters drops `page`.
  Rendered in RefinementList (desktop) + under CategoryChips (mobile) on store/category/
  collection pages; all three pages pass `brand`/`stock` through to `PaginatedProducts`.
- **US-domestic purge (customer-visible):** checkout PayPal XT-Labs block removed
  (`checkout/components/payment/index.tsx` — `warehouse_items` gating + message).
  **Draft-product leak fixed:** Medusa's `*products` expansion on categories/collections
  returns DRAFT products; those objects were serialized into client props via
  RefinementList/CategoryChips (store page HTML carried the 15 unpublished "USA Domestic"
  products — 2.4 MB → 780 KB after the fix). `*products` dropped from `listCategories`,
  `getCategoryByHandle`, `getCollectionByHandle`; skeleton counts fall back to default 8.
- **Tests:** `brand-filter/index.test.tsx` 6 (chips, toggle-on/off, mutual exclusion,
  stock param, page-param drop; next/navigation stubbed via AppRouterContext/
  PathnameContext/SearchParamsContext providers), `product-info/index.test.tsx` 2
  (badge renders from type.value / absent without). ProductPreview itself is not
  render-testable (transitively imports `server-only` via QuickAddButton → cart data) —
  card verified on live SSR instead. `npm run test` 156/156, `npm run build` clean.
- **Live SSR verified** (dev, cookie-warmed — first hit 307s on `_medusa_cache_id`):
  `/us/store?brand=zphc&stock=in` → 12 cards, all badges ZPHC, zero OOS;
  `/us/categories/oral-steroids?brand=spectrum-pharma` → 6 Spectrum-only;
  PDP `oxandrolone-zphc` → ZPHC pill + stock badge; unfiltered store 12 pages
  (141 products), `stock=in` 11 pages; last pages render 9 real cards (phantom fix);
  `grep -i domestic` over rendered HTML and `src/` (sans tests) → clean.
- **Deviations:** spec order says "E needs A" — A/B still not done; E sits on existing
  store/category pages (same precedent as C/D). No restock_eta values in live data right
  now (mechanism tested in unit tests only). 15 unpublished handles are dead URLs;
  redirect entries prepared but NOT enabled — the `next.config.js` redirects block is
  deliberately commented out (user, Stage D.2); user decides.

## 2026-07-23 — Catalog filters UX redesign (Gymshark pattern mobile + toolbar desktop)

User reviewed Stage E filters on screenshots and requested a UX rework: navigation and
filters looked identical (pills everywhere), mobile had 3 stacked chip rows before content.
Reference chosen by user: **Gymshark mobile** (no chips at top at all).

- **Burger menu (`layout/components/side-menu`)**: hardcoded 6-item category list replaced
  with live categories (Nav fetches `listCategories()`, passes the FULL flat list — nested
  `category_children` objects don't carry their own children, so drill-down resolves each
  level through the flat list). Drill-down stack UI: tap category with children → panel
  header becomes `‹ <Name>` back button + "View all <Name>" link + children rows; leaf
  categories link directly. Service links/account/region footer only at root level.
  This also fixed the menu missing SARMS/Weight Loss/Sexual Health/etc.
- **New `store/components/catalog-toolbar`** (client), rendered from `paginated-products`
  above the grid (so the product count is always the post-filter `count`):
  - Desktop row: `[All][ZPHC][Spectrum Pharma][CanadaBioLabs] | In Stock switch | N products | Sort ▾`
    (headlessui Menu dropdown). Sidebar (`refinement-list`) now holds ONLY CategoryMenu.
  - Mobile row: `[Filter (n)] — N products — [Sort]`; both open headlessui bottom sheets
    (slide-up, drag handle, 44px rows). Filters apply IMMEDIATELY on tap (URL push with
    `scroll: false`); the sheet's "Show N products" footer stays live via SSR re-render
    and just closes the sheet. "Clear all" resets brand+stock.
  - URL contract unchanged: `?brand=<slug>&stock=in&sortBy=…`, filter changes drop `page`.
- **Deleted:** `category-chips`, `brand-filter` (+ its tests — logic and tests moved to
  catalog-toolbar), `filter-radio-group` (only consumer was the old sort radio group).
  `refinement-list/sort-products` is now a types/constants module (`SortOptions`,
  `sortOptions`) — the type is imported from ~10 places, so the path stays.
- **Category template:** description now shows on mobile above the toolbar
  (`line-clamp-2`), bottom mobile SEO duplicate removed. Mobile subcategory navigation
  moved entirely into the burger drill-down (per Gymshark reference).
- **Tests:** `catalog-toolbar/index.test.tsx` 9 cases (chips/switch/sort push URLs,
  page-param drop, sheet open, immediate apply, clear-all, active-filter badge) using the
  router-context recipe. SideMenu is NOT render-testable (CountrySelect → `lib/data/cart`
  → server-only), same class as ProductPreview. `npm run test` 159/159, build clean.
- **Live SSR verified:** store 141 products + toolbar markup, no old chip rows;
  `?brand=zphc&stock=in` → "70 products", 12 ZPHC cards, zero OOS; category page shows
  clamped description, no bottom dup; flight data carries all root categories for the
  burger; no draft/domestic leaks (804 KB page).
- No new dependencies (headlessui + lucide already in use). Backend untouched.

## 2026-07-23 — Homepage + category redesign (trust/Hormozi structure, motion 2026)

User verdict on screenshots: site felt templated (stock athlete hero, "UNLOCK YOUR
POTENTIAL"), strongest offer (seizure insurance) buried, claims without proof
("5-STAR REVIEWS" with zero reviews shown), inconsistent numbers (>98% vs >99%),
palette violations (cyan/pink/orange/purple in goals carousel, emerald in lab section).

**CRITICAL trust-copy rule (user correction):** only 3 Janoshik reports exist; there
will never be per-batch testing. Products are pharma-grade from GMP-certified factories
with in-house QC labs. NEVER write "every batch tested" or invent purity percentages.
Framing everywhere: "GMP-certified factories + independent spot-checks by Janoshik".

- **Motion foundation:** `app/providers/motion-provider.tsx` (`MotionConfig
  reducedMotion="user"` in root layout), `lib/util/motion.ts` (shared fadeUp/
  stagger/EASE_OUT), `common/components/count-up` (SSR renders final value; counts up
  once in view; safe without IntersectionObserver).
- **Hero rewrite** (`home/components/hero`): type-led, no people photos. Parallax
  layers (grid/glow/content at different scroll speeds), H1 "PROOF. NOT PROMISES."
  word reveal (typewriter gimmick removed), GMP+spot-check subline, CTAs "Shop
  Compounds" + "See Lab Reports", trust stat ticker (10,000+/99.8%/HPLC) with CountUp.
  Top-2 ranked products (page.tsx → `getHeroSpecimens`, reuses `sortByRank`) render as
  "lab specimen" glass tiles — white packshots framed deliberately, linked to PDPs.
- **New `guarantee-strip`**: acid-green marquee right under hero (risk reversal first).
  Reuses existing `.animate-marquee` CSS; static + centered under reduced motion.
- **Section order** (`page.tsx`): Hero → GuaranteeStrip → LabResults (proof before
  claims) → goals carousel → BestSellers → OnyxStandard → ReviewsSection. Homepage
  meta description fixed (was "genetics and breeding solutions").
- **Repaints:** lab section emerald→#ccff00 everywhere + spot-check header copy +
  purity CountUp; goals carousel — all 5 card accents → #ccff00, images `grayscale`
  (duotone with existing green overlay), mobile auto-snap scrollIntoView hijack
  REMOVED (kept swipe-hint observer), "NOT SURE?" → "FULL CATALOG"; onyx-standard —
  bento grid (Seizure Insurance = large 2-col "Our guarantee" card, Pharmaceutical
  Grade = wide card with honest GMP copy + "See the reports" link), "5-Star Reviews" →
  "Independently verified by Janoshik Analytics", counters CountUp.
- **New `reviews-section`**: renders null while `reviews-data.ts` is empty — REAL
  reviews only (user will supply; never seed fakes). Test enforces non-empty
  author/text on any future entry.
- **Category polish:** product grid CSS stagger (`.product-grid-item`, `--i` delay,
  reduced-motion guarded), `page-fade-in` on breadcrumb/H1, category description
  restyled quiet (xs/sm, gray-500, green left border, clamped) so SEO text stops
  screaming under the H1. Description TEXTS in Medusa are a separate content task.
- **docs/frontend-design.md** updated: animation "middle"→"confident" (subtle
  multi-layer parallax, CountUp, slow marquees allowed; scroll-hijack/typewriter
  banned; ≤600ms; global MotionConfig noted), hero canon + trust-copy rule recorded.
- Tests: count-up 2, reviews-section 3 (incl. IntersectionObserver stub pattern for
  framer-motion whileInView in jsdom). `npm run test` 164/164, build clean. Live SSR
  verified: no old slogan/cyan/emerald/"5-Star"/"every batch"; specimens =
  oxandrolone-zphc + anavar-spectrum-pharma; reviews section absent; category stagger
  vars present. No new dependencies.
- Known leftover: goals-carousel "FULL CATALOG" card still uses old hero.webp athlete
  image (muted by grayscale) — replace when a better asset exists.

## 2026-07-23 — Homepage v2: specimen deck, scroll-storytelling, real reviews

Iteration on the same-day redesign, per user feedback ("де паралакси", weak hero
showcase, merge goals with top products, real reviews supplied).

- **Hero specimen deck** (`home/components/hero`): 2 static tiles → rotating deck of 4
  glass slides. Flagships pinned first by handle (user's picks):
  `testosterone-enanthate-250mgml-10ml-zphc`, `zptrop-hgh-72iu-pen-2-chamber-cartridge`;
  top-rank products fill to 4 (`page.tsx getHeroSpecimens`: handle-fetch + rank-fetch,
  dedupe). Auto-cycles 4.5s (pause on hover/drag), front card links to PDP, back cards
  click-to-front, drag/swipe advances, progress dots, acid glow on active card.
  Reduced motion = static fan, dots still work.
- **`goals-showcase/` (NEW)** replaces `horizontal-scroll-section/` (869 lines,
  DELETED with its swipe-hint gimmick). Server `index.tsx` builds 4 chapters
  (collections bulking/cutting/longevity + category peptides) with **top-5 ranked
  products each** (`sortByRank`, min variant `calculated_price` via `convertToLocale`).
  Client `scroll-story.tsx`: pinned sticky chapters — image-into-image crossfade +
  Ken Burns + parallax, light scene interpolates green-glow position/intensity and
  base near-black tone per chapter (one accent preserved), giant stroked chapter
  numbers on a faster parallax layer, product mini-card rail (5/panel, links to PDPs)
  + Explore CTA, right-side progress rail. Invisible chapters get pointer-events:none
  (else they'd swallow clicks). Reduced motion → plain stacked blocks (StaticStory).
- **Reviews live** (`reviews-section`): 7 real Trustpilot-style reviews supplied by
  the operator, typo-cleaned only. Shown WITHOUT names/dates — stars + title + text +
  "Verified customer · <country>" (user decision). Masonry columns, acid-green stars.
  Test enforces: no author/date fields, valid rating/country/text on every entry.
- **Honest 10k label**: hero + Onyx Standard "Orders shipped" → "Warehouse shipments"
  (the 10,000+ figure is warehouse-wide, not site-only — user clarification).
- Design doc: specimen-deck canon; pinning sanctioned ONLY for chapter storytelling
  (1:1 scroll speed, no scrollIntoView); reduced-motion degradation mandatory.
- Verified: tests 164/164, build clean; live SSR — 4 specimen tiles (flagships
  present), 20 story product cards (4×5) with prices, 7 review cards, zero personal
  names in HTML, "Warehouse shipments" ×2, old section gone. No new dependencies.

## 2026-07-23 — Homepage v3: pinned storytelling scrapped → per-section parallax

User screenshot showed the pinned crossfade broken: neighbouring chapters' texts
overlapping, photos buried (full grayscale + opacity-40 + chin-crop). Lesson recorded
in docs/frontend-design.md: NO pinned crossfade chapters; per-section parallax instead.

- **goals-showcase v3**: `scroll-story.tsx` deleted. Each goal is now its own
  normal-flow section (`goal-section.tsx`): background image parallax ±6% per section,
  `saturate-[0.35] opacity-55` (visible, not buried), per-photo `object-position`
  (faces in frame — tune with the user visually), alternating side gradients (text on
  the dark half), giant stroked number on a faster layer, green glow position varies
  per section. Server part unchanged in shape but products now carry `stockState`
  (`resolveProductStockState`, inventory fields added to the fetch).
- **New shared `store/components/product-rail`**: catalog-grade cards (dark surface,
  white photo window, 2-line title, mono acid price, stock dot with amber-only-low
  rule), `snap-x` scrolling with mobile peek (~2.2 cards), desktop arrow buttons
  (hide at edges, `scrollBy` guarded for jsdom), used by all 4 goal sections.
  3 unit tests (note: next/image in node:test validates against DEFAULT config —
  use relative `/x.png` fixture paths, remote hosts fail).
- **Hero hybrid** (user choice): athlete returns as a cinematic layer — R2
  `Esthetic.jpg`, right side, grayscale + low opacity + acid wash + fade gradients,
  own parallax speed between grid and deck. Type-led copy + specimen deck unchanged.
  Photo is a placeholder-quality stock — user will supply a better one eventually.
- **Reviews → Trustpilot ribbon**: masonry wall replaced with a slow marquee
  (`animate-marquee-slow`, 45s, pause on hover; reduced-motion → static scroll row,
  duplicate sequence is aria-hidden and testid-less). Header has a Trustpilot
  attribution block (TP-green #00B67A star tiles + wordmark + "Reviews from
  Trustpilot") — deliberately NOT a link, per user ("нехай самі шукають").
- **New `category-bento`** under reviews: typographic bento of real root categories
  (first two tiles large, subcategory count in mono, acid "All products" tile
  → /store). Server component, no photos needed.
- Verified: tests 167/167, build clean; live SSR — 4 goal sections (zero pinned
  `height:*vh` containers), 4 rails × 5 cards with stock labels, TP mark with zero
  trustpilot hrefs, 7 visible review cards, 11 bento tiles + all-tile, athlete layer
  present. No new dependencies.

## 2026-07-23 — Homepage v4: Big Split hero, visible parallax, bento upgrade

User verdict on v3: specimen deck "убого і жалюгідно" (matches 2026 research: hero
carousels/decks are an anti-pattern; oversized type + ONE object + one CTA wins);
"parallax absent again" — diagnosis via AskUserQuestion confirmed animations DO run
(reduce-motion not the cause) → amplitudes were just too subtle. Bento approved,
wanted icons/colors/category backgrounds.

- **Hero v4 "Big Split"** (user-picked from ASCII previews): SpecimenDeck deleted
  (state, auto-cycle, dots). Left: oversized stacked type (~7.5rem) + primary CTA
  ("See lab reports" demoted to text link). Right: athlete PRESENT (Esthetic.jpg,
  grayscale-[0.6], opacity-80 desktop / 40 mobile, acid rim glow). ONE flagship
  packshot (Test E 10ml ZPHC, `specimens[0]`) straddles the split at md:left-[46%],
  rotate -4°→-9°, and travels AGAINST the scroll (y 0→-140) — the unmissable depth
  cue. Layer speeds: grid 120 / athlete 70 / glow 190 / flagship -140.
  `getHeroSpecimens` simplified to the two flagship handles (second = fallback).
- **Goal sections parallax amplified**: image ±12% + scale 1.05→1.15 (inset -14%),
  number ±220 counter-direction, content drifts ±30 (third speed).
- **Bento upgrade**: lucide icon per category (handle-keyword map: oral→Pill,
  injectable→Syringe, peptide→Dna, hgh→Activity, pct→ShieldCheck, weight→Flame,
  sexual→HeartPulse, sarm→FlaskConical, mix→Layers, additional→Package,
  advanced→Zap, default FlaskConical), faint top-product photo per tile
  (1-product fetch per root category, grayscale opacity-[0.10] → color 0.22 on
  hover), acid-wash gradient varying by tile index (4 corner/intensity variants,
  palette-safe). CategoryBento now takes optional `region` for priced-free fetch.
- Design doc: hero canon v4 (decks/carousels in heroes BANNED), parallax minimums
  ("background travel 10-12%, at least one counter-scroll layer").
- Verified: 167/167, build clean; SSR — zero specimen-deck, one hero-specimen
  linking to the Test E PDP, athlete layer, 11 bento tiles all with icons+thumbs,
  4 goal sections. No new dependencies.

## 2026-07-23 — Hero: flagship packshot removed (white-bg cards read cheap)

User: the hero product card looks "ridiculous/funny". Root cause: product thumbnails
are white-background packshots — floated on the dark cinematic hero they become a big
white rectangle with a tiny product and dead space (worse on mobile). This can't be
fixed while the assets are white-bg. Decision: remove the flagship card from the hero
entirely. Big Split now = oversized type + athlete only (stronger single-subject
composition); products keep their showcase in goal rails / best-sellers / bento below.
`page.tsx` dropped `getHeroSpecimens`/`FEATURED_SPECIMEN_HANDLES`/`listProducts` import
and `<Hero />` takes no props; `HeroSpecimen` type removed. Athlete bumped to opacity-90
+ counter-scroll drift/scale so the hero still has depth. Design doc records the ban and
the reintroduce-only-with-dark/transparent-render condition. Tests 167/167, build clean.

## 2026-07-23 — Homepage v5: hero "what/for whom", pointer parallax, TP fix, bento tones

- **Hero category ticker** (`hero/index.tsx`): full-width marquee of real root
  categories between CTA and stats — instant "what we sell" + quick-nav (links to
  /categories/<handle>), acid on hover, pause on hover, static row under reduced
  motion. `page.tsx` fetches `listCategories()` → root → `categories` prop
  (`HeroCategory{name,handle}`).
- **Hero pointer parallax** (desktop): cursor shifts athlete (+20px) and glow
  (−34px, opposite) via spring-smoothed motion values; disabled on
  `(pointer: coarse)` and reduced motion. Scroll parallax unchanged. Design doc
  updated to allow subtle pointer parallax in the hero.
- **Trustpilot mark fixed** (`reviews-section`): previously a big logo star stacked
  above 5 rating stars read as "6 stars". Now: "Great" label + ONE row of 5 green
  star tiles (the score); a small inline logo star sits with the "Reviews from
  Trustpilot" wordmark below as attribution — unmistakably 5. Label is "Great"
  (user, not "Excellent"). Still not a link. No aggregate number invented.
- **Bento** (`category-bento`): removed the faint product-photo backdrops
  (dropped `getCategoryThumb`, `listProducts` import, `region` prop — `page.tsx`
  calls `<CategoryBento />`). Kept icons; added `MUTED_TINTS` — muted analogous
  lab tones (lime/teal/olive/emerald/moss/cyan-green) as a faint per-tile glow
  (alpha 0.07) + ~0.35 icon-border tint, cycling by index. Acid-green stays the
  one bright accent; design doc records this as a sanctioned palette exception.
- Verified: tests 167/167, build clean; live SSR — hero ticker with 6 category
  links, TP block = 5 rating tiles + 1 tiny logo star (no "Excellent"), bento
  zero thumbnails, muted tint rgba present, 11 tiles. No new dependencies.

## 2026-10-29 — Repeat-customer order minimum ($150) notice + gating

Backend contract: `GET /store/carts/:id/order-minimum` (see backend HANDOFF).
- `lib/data/cart.ts`: `getOrderMinimum(cartId?)` (no-store, null on failure — UX only);
  `setAddresses` re-checks after `updateCart` (email/phone known only now) and returns an
  error message instead of redirecting to delivery.
- `cart/components/order-minimum-notice`: progress bar toward the minimum, brand green only
  (not amber — not a stock warning), optional "Back to cart" link.
- Cart summary: notice + disabled "Go to checkout" while below minimum (logged-in / known email).
- Checkout page: notice above the form at every step; final backend hook error surfaces via the
  existing payment error message.

## 2026-10-29 — PayPal surcharge (5%) badge + separate fee row

Backend contract: `GET|POST /store/carts/:id/payment-surcharge` (see backend HANDOFF). The fee
is a shipping method without an option, marked `data/metadata.payment_surcharge` (guest order
payload: `payment_surcharge: true`).
- `lib/util/payment-surcharge.ts`: `isSurchargeMethod`, `splitShippingMethods`, `surchargeTotal`.
- `lib/data/cart.ts`: `getPaymentSurchargeQuote`, `syncPaymentSurcharge`;
  `initiatePaymentSession` syncs the fee first; cart fields include shipping method data/metadata.
- Payment step: selecting a method syncs the fee immediately; PayPal option shows
  "+5% · +$X.XX" badge (quote from backend, refreshed on total change).
- `cart-totals` / `order-summary`: "Shipping" = delivery only, separate "PayPal fee (5%)" row.
- `shipping` step + `shipping-details`: show the delivery method, never the fee.
- `lib/data/orders.ts`: `*shipping_methods` in order fields.
- Test: `lib/util/payment-surcharge.test.ts`.
