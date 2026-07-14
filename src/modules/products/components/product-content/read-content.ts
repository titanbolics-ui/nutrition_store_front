import type { HttpTypes } from "@medusajs/types"
import type { ProductContent } from "./types"

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0
}

function hasStringFields(value: unknown, keys: string[]): boolean {
  if (!value || typeof value !== "object") return false
  return keys.every((key) => isNonEmptyString((value as Record<string, unknown>)[key]))
}

/**
 * Never throws. A malformed or legacy metadata.content value (or none at
 * all) returns null so the caller falls back to the existing page — a typo
 * must not crash the product page, only fail to render the new sections.
 * The backend's zod schema is the actual source of truth for what's allowed
 * to be saved; this is a lightweight mirror sufficient to decide whether to
 * render, not a full validator.
 */
export function readProductContent(
  product: HttpTypes.StoreProduct
): ProductContent | null {
  const raw = product.metadata?.content
  if (!raw || typeof raw !== "object") {
    return null
  }

  const content = raw as Record<string, unknown>

  if (content.type === "compound") {
    const valid =
      hasStringFields(content.overview, ["what", "howItWorks"]) &&
      hasStringFields(content.dosage, [
        "beginner",
        "intermediate",
        "advanced",
        "cycleLength",
        "administration",
        "pct",
      ]) &&
      hasStringFields(content.profile, [
        "anabolicRating",
        "androgenicRating",
        "ester",
        "halfLife",
        "aromatization",
        "detectionTime",
      ]) &&
      hasStringFields(content.sideEffects, [
        "estrogenic",
        "androgenic",
        "cardiovascular",
        "suppression",
      ])

    return valid ? (content as unknown as ProductContent) : null
  }

  if (content.type === "peptide") {
    const valid =
      hasStringFields(content.overview, ["what", "mechanism"]) &&
      Array.isArray(content.keyHighlights) &&
      content.keyHighlights.length > 0 &&
      hasStringFields(content.research, ["useCases", "models"])

    return valid ? (content as unknown as ProductContent) : null
  }

  return null
}
