import {
  Activity,
  ArrowUpRight,
  Dna,
  FlaskConical,
  Flame,
  HeartPulse,
  Layers,
  LucideIcon,
  Package,
  Pill,
  ShieldCheck,
  Syringe,
  Zap,
} from "lucide-react"

import { listCategories } from "@lib/data/categories"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

// handle-keyword → icon (design doc: lucide icon mapping per section)
const ICON_MAP: [string, LucideIcon][] = [
  ["oral", Pill],
  ["injectable", Syringe],
  ["sarm", FlaskConical],
  ["peptide", Dna],
  ["hgh", Activity],
  ["post-cycle", ShieldCheck],
  ["pct", ShieldCheck],
  ["weight", Flame],
  ["sexual", HeartPulse],
  ["mix", Layers],
  ["additional", Package],
  ["advanced", Zap],
]

const iconFor = (handle: string): LucideIcon =>
  ICON_MAP.find(([needle]) => handle.includes(needle))?.[1] ?? FlaskConical

// Muted analogous "lab tones" — neighbours of acid-green, low saturation, used
// only as a faint dark tile glow (alpha ~0.05-0.08). Tiles differ subtly but
// acid-green stays THE bright accent (icons/hover). Sanctioned palette
// extension — see docs/frontend-design.md.
const MUTED_TINTS = [
  "132, 204, 22", // lime
  "45, 212, 191", // teal
  "163, 163, 60", // olive
  "52, 211, 153", // emerald
  "110, 160, 90", // moss
  "94, 199, 170", // cyan-green
]

const tileGlow = (i: number, corner: string) =>
  `radial-gradient(circle at ${corner}, rgba(${
    MUTED_TINTS[i % MUTED_TINTS.length]
  }, 0.07) 0%, rgba(0,0,0,0) 60%)`

const CORNERS = ["20% 25%", "80% 25%", "25% 80%", "80% 80%"]

/**
 * Catalog gateway under the reviews: bento grid of real root categories.
 * Type + a category icon lead each tile over a muted analogous tone; the acid
 * "All products" tile closes the grid. First two cells are large.
 */
export default async function CategoryBento() {
  const allCategories = await listCategories().catch(() => [])
  const rootCategories =
    allCategories?.filter((category) => !category.parent_category) ?? []

  if (rootCategories.length === 0) {
    return null
  }

  return (
    <section
      className="relative bg-black py-16 md:py-24 overflow-hidden"
      data-testid="category-bento"
    >
      {/* Background grid texture */}
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)`,
          backgroundSize: "4rem 4rem",
        }}
      />

      <div className="content-container relative z-10">
        <div className="mb-10 md:mb-14">
          <div className="flex items-center gap-3 mb-4">
            <span className="h-px w-10 bg-[#ccff00]/60" aria-hidden="true" />
            <span className="text-[#ccff00] font-mono text-xs uppercase tracking-[0.3em]">
              The catalog
            </span>
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tight">
            Shop by <span className="text-[#ccff00]">category.</span>
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 auto-rows-[110px] md:auto-rows-[140px]">
          {rootCategories.map((category, i) => {
            const isLarge = i < 2
            const Icon = iconFor(category.handle)
            const tint = MUTED_TINTS[i % MUTED_TINTS.length]
            return (
              <LocalizedClientLink
                key={category.id}
                href={`/categories/${category.handle}`}
                data-testid="bento-category-tile"
                className={
                  "group relative flex flex-col justify-between p-4 md:p-6 rounded-xl border border-[#252A31] bg-[#0A0B0D] overflow-hidden transition-all duration-300 hover:border-[#ccff00]/50 hover:-translate-y-0.5 " +
                  (isLarge ? "col-span-2 row-span-2" : "")
                }
              >
                {/* Muted analogous tone */}
                <div
                  aria-hidden="true"
                  className="absolute inset-0 pointer-events-none"
                  style={{ background: tileGlow(i, CORNERS[i % CORNERS.length]) }}
                />
                {/* Acid hover glow — the bright accent stays green */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#ccff00]/[0.06] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                <div className="relative flex items-start justify-between gap-2">
                  <span
                    className={
                      "flex items-center justify-center rounded-lg border bg-black/50 text-gray-300 group-hover:text-[#ccff00] group-hover:border-[#ccff00]/40 transition-colors duration-200 " +
                      (isLarge ? "h-10 w-10 md:h-12 md:w-12" : "h-8 w-8")
                    }
                    style={{ borderColor: `rgba(${tint}, 0.35)` }}
                  >
                    <Icon
                      className={isLarge ? "h-5 w-5 md:h-6 md:w-6" : "h-4 w-4"}
                      aria-hidden="true"
                    />
                  </span>
                  <ArrowUpRight
                    className="h-4 w-4 text-gray-600 group-hover:text-[#ccff00] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-200"
                    aria-hidden="true"
                  />
                </div>

                <div className="relative">
                  <span
                    className={
                      "block font-black text-white uppercase tracking-tight leading-[1.05] group-hover:text-[#ccff00] transition-colors duration-200 " +
                      (isLarge ? "text-2xl md:text-4xl" : "text-sm md:text-lg")
                    }
                  >
                    {category.name}
                  </span>
                  {category.category_children &&
                    category.category_children.length > 0 && (
                      <span className="mt-1 block font-mono text-[10px] text-gray-600 uppercase tracking-widest">
                        {category.category_children.length} lines
                      </span>
                    )}
                </div>
              </LocalizedClientLink>
            )
          })}

          {/* All-products tile */}
          <LocalizedClientLink
            href="/store"
            data-testid="bento-all-tile"
            className="group relative flex flex-col justify-between p-4 md:p-6 rounded-xl bg-[#ccff00] overflow-hidden col-span-2 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_0_35px_rgba(204,255,0,0.35)]"
          >
            <div className="flex items-start justify-end">
              <ArrowUpRight
                className="h-5 w-5 text-black group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200"
                aria-hidden="true"
              />
            </div>
            <span className="font-black text-black uppercase tracking-tight text-xl md:text-3xl leading-none">
              All products →
            </span>
          </LocalizedClientLink>
        </div>
      </div>
    </section>
  )
}
