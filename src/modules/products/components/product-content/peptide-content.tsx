import type { HttpTypes } from "@medusajs/types"
import {
  BadgeCheck,
  Beaker,
  FileText,
  Layers,
  ScrollText,
  Sparkles,
} from "lucide-react"
import type { PeptideContent as PeptideContentType } from "./types"
import ProductContentTabs, { ContentPanel } from "./tabs-shell"
import ContentBlocks from "./content-blocks"
import FaqSection from "./faq-section"
import AlsoKnownAs from "./also-known-as"
import CalculatorPlaceholder, {
  hasReconstitutionEnabled,
} from "./calculator-placeholder"
import { TAB_LABELS } from "./labels"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import FadeInSection from "../fade-in-section"
import { highlightTerm } from "@lib/util/highlight-term"

type Props = {
  product: HttpTypes.StoreProduct
  content: PeptideContentType
  activeIngredient?: string
}

const PeptideContent = ({ product, content, activeIngredient }: Props) => {
  const labels = TAB_LABELS.peptide
  const panels: ContentPanel[] = []

  panels.push({
    value: "overview",
    label: labels.overview,
    icon: <FileText className="h-4 w-4" aria-hidden="true" />,
    content: (
      <div className="flex flex-col gap-3 text-sm text-gray-300">
        <p>{highlightTerm(content.overview.what, activeIngredient)}</p>
        <p>{highlightTerm(content.overview.mechanism, activeIngredient)}</p>
        <AlsoKnownAs names={content.alsoKnownAs} />
      </div>
    ),
  })

  panels.push({
    value: "keyHighlights",
    label: labels.keyHighlights,
    icon: <Sparkles className="h-4 w-4" aria-hidden="true" />,
    content: (
      <ul className="flex flex-col gap-2 text-sm text-gray-300">
        {content.keyHighlights.map((highlight, i) => (
          <li key={i} className="flex items-start gap-2">
            <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#ccff00]" />
            {highlight}
          </li>
        ))}
      </ul>
    ),
  })

  panels.push({
    value: "research",
    label: labels.research,
    icon: <ScrollText className="h-4 w-4" aria-hidden="true" />,
    content: (
      <dl className="flex flex-col gap-4 text-sm text-gray-300">
        <div>
          <dt className="text-xs uppercase tracking-wide text-gray-500">
            Use cases
          </dt>
          <dd className="mt-1">{content.research.useCases}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-gray-500">
            Models
          </dt>
          <dd className="mt-1">{content.research.models}</dd>
        </div>
      </dl>
    ),
  })

  if (content.stacking && content.stacking.length > 0) {
    panels.push({
      value: "stacking",
      label: labels.stacking,
      icon: <Layers className="h-4 w-4" aria-hidden="true" />,
      content: (
        <ul className="flex flex-col gap-2 text-sm">
          {content.stacking.map((entry, i) => (
            <li key={i}>
              <LocalizedClientLink
                href={`/products/${entry.productHandle}`}
                className="text-[#ccff00] underline underline-offset-4"
              >
                {entry.label}
              </LocalizedClientLink>
            </li>
          ))}
        </ul>
      ),
    })
  }

  if (hasReconstitutionEnabled(product)) {
    panels.push({
      value: "calculator",
      label: labels.calculator,
      icon: <Beaker className="h-4 w-4" aria-hidden="true" />,
      content: <CalculatorPlaceholder product={product} />,
    })
  }

  if (content.coaUrl) {
    panels.push({
      value: "labResults",
      label: labels.labResults,
      icon: <BadgeCheck className="h-4 w-4" aria-hidden="true" />,
      content: (
        <a
          href={content.coaUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 text-sm font-medium text-[#ccff00] underline underline-offset-4"
        >
          View lab report (COA)
        </a>
      ),
    })
  }

  return (
    <div className="flex flex-col gap-8" data-testid="peptide-content">
      <ProductContentTabs panels={panels} />
      {content.faq && content.faq.length > 0 && (
        <FadeInSection>
          <section>
            <h3 className="mb-4 text-lg font-semibold text-white">FAQ</h3>
            <FaqSection faq={content.faq} />
          </section>
        </FadeInSection>
      )}
      {content.contentBlocks && content.contentBlocks.length > 0 && (
        <FadeInSection>
          <section>
            <ContentBlocks blocks={content.contentBlocks} />
          </section>
        </FadeInSection>
      )}
    </div>
  )
}

export default PeptideContent
