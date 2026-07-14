import React from "react"

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

/**
 * Wraps every whole-word, case-insensitive occurrence of `term` in `text`
 * with a muted acid-green accent — used to make the active substance stand
 * out in body copy without shouting (design system: one accent, no noise).
 *
 * Returns the plain string unchanged when there is no term or no match, so
 * callers can drop it in place of a bare `{text}`.
 */
export function highlightTerm(
  text: string,
  term?: string | null
): React.ReactNode {
  const needle = term?.trim()
  if (!text || !needle) {
    return text
  }

  // Whole-word match: a run that is not itself surrounded by word characters.
  const pattern = new RegExp(`(?<![\\p{L}\\p{N}])(${escapeRegExp(needle)})(?![\\p{L}\\p{N}])`, "giu")
  const parts = text.split(pattern)

  if (parts.length === 1) {
    return text
  }

  // String.split with a capture group interleaves the matches at odd indices.
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <span key={i} className="text-[#ccff00]/80 font-medium">
        {part}
      </span>
    ) : (
      part
    )
  )
}
