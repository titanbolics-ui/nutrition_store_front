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
