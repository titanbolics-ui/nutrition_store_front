/**
 * Peptide-layout labels are written generically so they read correctly for
 * HGH too (it uses this layout as a technical container via the manual
 * metadata.template override, but is not customer-facing "Peptide"). None of
 * these strings mention "peptide".
 */
export const TAB_LABELS = {
  compound: {
    overview: "Overview",
    dosage: "Dosage & Cycle",
    profile: "Profile",
    sideEffects: "Side Effects",
    labResults: "Lab Results",
    calculator: "Calculator",
  },
  peptide: {
    overview: "Overview",
    keyHighlights: "Key Highlights",
    research: "Research",
    stacking: "Stacking",
    labResults: "Lab Results",
    calculator: "Calculator",
  },
} as const
