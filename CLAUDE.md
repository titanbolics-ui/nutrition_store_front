## Design (read before ANY visual work)
- ALWAYS read /mnt/skills/public/frontend-design/SKILL.md before building or reshaping UI.
- Keep the existing brand identity: near-black background, single acid-green accent.
  Do NOT redesign the identity — only structure and new sections. The brand works.
- The gold/tan look in any reference screenshots is NOT our palette — adapt logic, not color.
- Quality floor, always: responsive to 375px, visible keyboard focus, reduced-motion respected.
- Spend boldness in one signature element per page; keep everything else quiet.

## Product page architecture
- TWO templates, selected by the product's ROOT category (Compounds → compound template,
  Peptides → peptide template). Template is a consequence of category, not a separate field.
- Product content lives in product `metadata.content` as structured JSON (schema per
  template) + a shared `contentBlocks[]` free-form zone. Validate JSON on save; a typo must
  never silently corrupt a page.
- Structured sections render as tabs/accordions, never one wall of text.
- Optional sections render ONLY when their data exists: no coaUrl → no Lab Results tab;
  empty contentBlocks → no block section; no reconstitution.enabled → no Calculator tab.

## Honesty constraints (this niche — non-negotiable)
- Lab results / COA: show ONLY where a real report exists (currently 3). Never render a fake
  batch number or dead COA link. No report → no batch row, silently.
- Stock: show honestly, 3 states (In / Low / Out), restock ETA if known. Never fake stock.
- No invented purity figures. Real tested values only.
- No marketing "Conclusion" sections. Data, not persuasion — matches how the whole project
  builds trust.

## Medical calculator (reconstitution)
- Wrong math = customer draws the wrong dose. Every formula is unit-tested with the worked
  examples in the spec. Guard division-by-zero and dose-exceeds-syringe. Mandatory
  disclaimer "For research calculation purposes. Not medical advice."
- U-100 syringe scale fixed (1 ml = 100 units). Two modes: mg/mcg and IU (HGH); IU mg-factor
  default 3, editable.

## Data migrations (variant/category work)
- Backup DB before any migration; document restore commands; rehearse rollback.
- URL changes → 301 redirects from old paths (links live in WhatsApp + search).
- Migrations idempotent and resumable; never double-merge.