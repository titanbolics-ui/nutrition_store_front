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
