# Onyx Genetics — Design System

Reference for all visual/UI work. Direction: **body-tech energy + scientific
precision**, animation **dialed to the middle** (present and smooth, never
flashy). Dark base, acid-green accent, data shown as visuals not gray text.
Trust through drive (form) + accuracy (content).

Read this before any UI task. Match it; don't invent a parallel style.

---

## Core principle

Every product page must feel like a **serious lab that also lifts** — precise
data (ratings as bars, molecular/safety icons, clean tables) presented with
energy (acid-green accents, smooth reveals, tactile hover). Never a wall of gray
text. Never a carnival of animations. The middle.

---

## Palette

| Token | Value | Use |
|---|---|---|
| Background | near-black `#0A0B0D` / `#0D0F12` | page base |
| Surface | slightly lifted `#14171C` | cards, tab panels, spec rows |
| Surface-raised | `#1B1F26` | hover state, active card |
| Accent (primary) | acid-green `#C6F135` / existing brand green | CTAs, active tab, bar fills, key numbers |
| Accent-dim | green at 15% opacity | subtle borders, glows, active backgrounds |
| Warning/amber | existing amber | low-stock, waiting states ONLY |
| Text-primary | near-white `#F2F4F5` | headings, values |
| Text-secondary | muted gray `#8A9199` | labels, descriptions |
| Border | `#252A31` | dividers, card outlines |

Rule: **one accent (green)**. Amber only for stock warnings. No third BRIGHT
color. Sanctioned exception (user 2026-07-23): the category-bento tiles may
carry MUTED analogous "lab tones" — dark, low-saturation neighbours of
acid-green (lime/teal/olive/emerald/moss/cyan-green) used ONLY as a faint tile
glow at alpha ≤0.08 and a ~0.35-alpha icon border. Acid-green stays the one
BRIGHT accent (icons on hover, CTAs, key numbers). Saturated/bright per-tile
colors remain banned.
Red only for genuine errors, never for out-of-stock.

---

## Typography

- Headings: existing display font, bold, tight tracking. Product title large.
- Body: existing sans, comfortable line-height (1.6) for descriptions.
- **Numbers/data get weight**: ratings, mg values, half-life → bold, often in
  accent green. The data is the hero — make it visually louder than labels.
- Labels (Estrogenic, Ester, Half-life): text-secondary, smaller, UPPERCASE
  optional for spec labels. Never let a label crowd its value (see spacing bug).

---

## Spacing (fixes the current "cheap" feel)

THE #1 bug right now: labels touch values ("EstrogenicNone", "AdministrationOral").
- Label ↔ value: minimum `gap-4` / 1rem between them, always. In two-column
  spec/side-effect rows use a proper grid (`grid-cols-[auto_1fr] gap-x-6`) so the
  label column and value column never collide.
- Section padding: generous. Cards `p-5`/`p-6`. Breathing room between tabs
  content and the next section (`mt-10`+).
- Never cramped. White space is part of the "premium" read.

---

## Icons (currently missing — add them)

Use **lucide-react** (already in the stack). Every structured section gets a
leading icon, consistent size (`size-5`), text-secondary color, accent on hover/
active. Suggested mapping:

- Overview → `FileText` / `Info`
- Dosage & Cycle → `Syringe` or `Activity`
- Profile → `Atom` / `FlaskConical` (molecular feel)
- Side Effects → `ShieldAlert` / `TriangleAlert`
- Lab Results → `BadgeCheck` / `ScrollText`
- Reconstitution/Calculator → `Beaker` / `Calculator`
- Specifications rows: small inline icons per attribute where sensible
  (manufacturer → `Factory`, form → `Pill`/`Syringe`, concentration → `Droplet`)
- Stock states: in `CircleCheck` green / low `TriangleAlert` amber / out
  `CircleSlash` muted
- FAQ items → `ChevronDown` that rotates on open

Icons are anchors, not decoration — they help the eye find sections in a
data-dense page. Don't overdo: one per section header + spec-row icons, not on
every line.

---

## Data visualization (the "scientific" half — this is what's missing)

Turn gray key-value text into visuals:

- **Profile ratings** (anabolic/androgenic): horizontal bar, accent-green fill on
  a muted track, number at the end. Same visual language as the existing
  dosage scale (which already looks good — extend it here). E.g. Anabolic 322 →
  a bar scaled against a sensible max, filled green.
- **Dosage scale** (already done, keep): beginner/intermediate/advanced segmented
  bar. This is the reference pattern — reuse its look for other ratings.
- **Half-life / detection time**: could be a simple timeline chip, or bold value
  with a clock icon — keep light, don't over-engineer.
- **Side effects severity**: each category (estrogenic/androgenic/cardio/
  suppression) gets a small severity indicator (dot or mini-bar: none/low/mod/
  high) alongside the text, so risk is scannable before reading.
- Aromatization / boolean traits: a clear yes/no chip, not a word buried in text.

Charts: keep them lightweight (CSS bars, small SVG). No heavy chart library for
these — they're indicators, not dashboards.

---

## Animation (confident setting — updated 2026-07-23, user decision)

Shared vocabulary lives in `src/lib/util/motion.ts` (fadeUp / staggerContainer /
fadeUpChild / EASE_OUT) — use those, don't invent per-section values.
`prefers-reduced-motion` is enforced globally via `MotionConfig reducedMotion="user"`
(`app/providers/motion-provider.tsx`); CSS animations must add their own
`@media (prefers-reduced-motion: reduce)` guard.

Do:
- Tab switch: content cross-fades / slides in subtly (~150–200ms ease-out).
- Section reveal on scroll: gentle fade-up (opacity + ~24px translate), once, not
  on every re-scroll. Stagger children ~80ms.
- **Subtle multi-layer parallax** (hero, section backgrounds): layers drift at
  different scroll speeds via `useScroll`+`useTransform`. Depth, not carnival —
  offsets under ~150px.
- **Pointer parallax** (hero, desktop only — user asked for "coolest
  animations" 2026-07-23): cursor shifts hero layers a few px via
  spring-smoothed motion values. MUST be disabled on `(pointer: coarse)` and
  under reduced motion. Keep it subtle (single-digit → ~30px max).
- **Category ticker** (hero): a marquee of real category names ("what we
  sell") that doubles as quick-nav; pause on hover, static scroll row under
  reduced motion.
- Numbers count up once in view (`CountUp` in `modules/common/components/count-up` —
  SSR renders the final value; animation is progressive enhancement).
- Slow marquee strips (e.g. guarantee band): linear, ≥20s per loop, pause on
  hover, static under reduced motion.
- Rating bars: fill animates from 0 to value when scrolled into view. ~400ms. Once.
- Hover: cards lift slightly (`-translate-y-1` + subtle green glow/border),
  buttons have a tactile press state. Fast (~120ms).
- Accordion (mobile): smooth height expand, chevron rotate.
- Product grid: CSS stagger reveal (`.product-grid-item`, `--i` delay) — SSR-safe.

Don't:
- No scroll hijacking (auto `scrollIntoView`, forced snap on entry) — removed
  deliberately, it reads as broken.
- No typewriter/typing gimmicks.
- No bouncing, no attention-seeking loops, nothing that delays reading the data.
- No single transition longer than ~600ms.

The test: motion should feel like the interface is *responsive and alive*, not
like it's *performing*.

Hero canon (v4 "Big Split", user-approved 2026-07-23): left — oversized type
(one line per word, ~7.5rem desktop) + ONE primary CTA (secondary is a quiet
text link); right — the athlete PRESENT (duotone ~90% opacity + acid rim glow,
masked only where it meets the copy). NO product packshot in the hero: the
white-background thumbnails float as a big white rectangle over the dark hero
and read cheap ("смішно", user 2026-07-23) — products get their showcase in
the sections below instead. Reintroduce a hero product only with a
dark/transparent-background render. Also BANNED in heroes: card decks,
carousels, auto-cycling anything (2026 research + failed iterations). Parallax
must be VISIBLE: layers at clearly different speeds and at least one
counter-scroll layer; background travel ~10-12% of viewport, not 5%. Trust
copy: GMP factories + independent Janoshik spot-checks — NEVER "every batch
tested" (only 3 reports exist), no invented percentages. "10,000+" is
WAREHOUSE shipments — label it so.

Goal sections (goals-showcase): NO pinning — the pinned crossfade experiment
shipped 2026-07-23 and was scrapped the same day after user testing (chapter
texts overlapped, photos buried). The pattern is: each goal is a normal-flow
full-height section with its OWN parallax (background image drifts ±6% via
useScroll on the section; giant stroked chapter number drifts faster on its
own layer). Photos stay VISIBLE: `saturate-[0.35] opacity-55` (never full
grayscale-to-black), per-photo `object-position` tuned so faces are in frame,
side gradient alternates left/right so text always sits on the darkened half.
Light scene = green glow position varies per section; no new hues.

Product rails (`store/components/product-rail`): catalog-grade cards (dark
surface, white photo window, title, mono acid price, stock dot — amber only
for low stock), scroll-snap with next-card peek on mobile, 44px arrow buttons
on desktop that hide at the edges, edge behavior native (no drag hijack).

Trustpilot mark (reviews): attribution only — TP-green (#00B67A) star tiles +
wordmark + "Reviews from Trustpilot". Deliberately NOT a link. External brand
colors are allowed for recognized trust marks (precedent: PayPal/CashApp in
the footer); they don't count against the one-accent rule.

---

## Component specifics

**Tabs (desktop):** active tab = accent-green underline + text-primary; inactive
= text-secondary. Icon + label. Content panel fades on switch. Currently there's
a stray scrollbar/arrow artifact near the tabs (see screenshot) — remove it;
tabs shouldn't have a vertical scroll control.

**Accordion (mobile):** each section a row with icon + label + chevron; smooth
expand; only structured sections, same content as desktop tabs.

**Spec / side-effect rows:** two-column grid, label (secondary, with optional
icon) left, value (primary) right or below on mobile. Enforced gap. Severity
indicator where relevant. Dividers between rows (`border`).

**Profile section:** lead with the rating bars (anabolic/androgenic), then a
clean spec grid for ester/half-life/aromatization/detection. Molecular icon in
the header.

**FAQ:** clean accordion or open list; question bold primary, answer secondary;
subtle divider between. Chevron rotates.

---

## Mobile (375px) — currently broken, must be solid

- Sticky action bar must NOT overlap the buttons or content; stock line below the
  price row, not inline.
- No stray widgets (the "N" circle / Turnstile) leaking into corners.
- Empty-looking accordions: if a section has no data, HIDE it — don't render an
  empty expandable (Specifications showed empty on mobile).
- Everything reachable, tappable (min 44px targets), no horizontal overflow.

---

## What "good" looks like (acceptance feel)

A visitor lands on a compound page and within one glance sees: the product,
price, stock, and — scrolling — scannable DATA (rating bars, severity dots,
clean specs with icons) that reveal smoothly, with acid-green accents guiding the
eye. It reads as a lab that respects the customer's intelligence, energized but
not noisy. Not a gray text dump. Not a flashing storefront. The middle.