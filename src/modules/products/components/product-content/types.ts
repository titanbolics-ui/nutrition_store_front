export type FaqEntry = { q: string; a: string }

export type ContentBlock =
  | { type: "text"; title?: string; body: string }
  | { type: "image"; url: string; caption?: string }
  | { type: "callout"; title?: string; body: string }
  | { type: "table"; headers: string[]; rows: string[][] }

export type CompoundContent = {
  type: "compound"
  overview: { what: string; howItWorks: string }
  dosage: {
    beginner: string
    intermediate: string
    advanced: string
    cycleLength: string
    administration: string
    pct: string
  }
  profile: {
    anabolicRating: string
    androgenicRating: string
    ester: string
    halfLife: string
    aromatization: string
    detectionTime: string
  }
  sideEffects: {
    estrogenic: string
    androgenic: string
    cardiovascular: string
    suppression: string
  }
  coaUrl?: string
  faq?: FaqEntry[]
  contentBlocks?: ContentBlock[]
  alsoKnownAs?: string[]
}

export type PeptideContent = {
  type: "peptide"
  overview: { what: string; mechanism: string }
  keyHighlights: string[]
  research: { useCases: string; models: string }
  stacking?: { productHandle: string; label: string }[]
  coaUrl?: string
  faq?: FaqEntry[]
  contentBlocks?: ContentBlock[]
  alsoKnownAs?: string[]
}

export type ProductContent = CompoundContent | PeptideContent
