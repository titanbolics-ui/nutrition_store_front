import type { HttpTypes } from "@medusajs/types"
import {
  Beaker,
  BadgeCheck,
  FileText,
  FlaskConical,
  ShieldAlert,
  Syringe,
} from "lucide-react"
import type { CompoundContent as CompoundContentType } from "./types"
import ProductContentTabs, { ContentPanel } from "./tabs-shell"
import DosageScale from "./dosage-scale"
import ContentBlocks from "./content-blocks"
import FaqSection from "./faq-section"
import AlsoKnownAs from "./also-known-as"
import CalculatorPlaceholder, {
  hasReconstitutionEnabled,
} from "./calculator-placeholder"
import { TAB_LABELS } from "./labels"
import SpecRow from "../spec-row"
import RatingBar from "../rating-bar"
import SeverityIndicator from "../severity-indicator"
import BooleanChip from "../boolean-chip"
import FadeInSection from "../fade-in-section"
import { highlightTerm } from "@lib/util/highlight-term"

type Props = {
  product: HttpTypes.StoreProduct
  content: CompoundContentType
  activeIngredient?: string
}

const CompoundContent = ({ product, content, activeIngredient }: Props) => {
  const labels = TAB_LABELS.compound
  const panels: ContentPanel[] = []

  panels.push({
    value: "overview",
    label: labels.overview,
    icon: <FileText className="h-4 w-4" aria-hidden="true" />,
    content: (
      <div className="flex flex-col gap-3 text-sm text-gray-300">
        <p>{highlightTerm(content.overview.what, activeIngredient)}</p>
        <p>{highlightTerm(content.overview.howItWorks, activeIngredient)}</p>
        <AlsoKnownAs names={content.alsoKnownAs} />
      </div>
    ),
  })

  panels.push({
    value: "dosage",
    label: labels.dosage,
    icon: <Syringe className="h-4 w-4" aria-hidden="true" />,
    content: (
      <div className="flex flex-col gap-6">
        <FadeInSection>
          <DosageScale dosage={content.dosage} />
        </FadeInSection>
        <dl className="grid grid-cols-1 gap-x-8 sm:grid-cols-3">
          <SpecRow label="Cycle length" value={content.dosage.cycleLength} />
          <SpecRow label="Administration" value={content.dosage.administration} />
          <SpecRow label="PCT" value={content.dosage.pct} />
        </dl>
      </div>
    ),
  })

  panels.push({
    value: "profile",
    label: labels.profile,
    icon: <FlaskConical className="h-4 w-4" aria-hidden="true" />,
    content: (
      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <RatingBar label="Anabolic rating" value={content.profile.anabolicRating} />
          <RatingBar label="Androgenic rating" value={content.profile.androgenicRating} />
        </div>
        <dl className="grid grid-cols-1 gap-x-8 sm:grid-cols-2">
          <SpecRow label="Ester" value={content.profile.ester} />
          <SpecRow label="Half-life" value={content.profile.halfLife} />
          <BooleanChip label="Aromatization" value={content.profile.aromatization} />
          <SpecRow label="Detection time" value={content.profile.detectionTime} />
        </dl>
      </div>
    ),
  })

  panels.push({
    value: "sideEffects",
    label: labels.sideEffects,
    icon: <ShieldAlert className="h-4 w-4" aria-hidden="true" />,
    content: (
      <dl className="grid grid-cols-1 gap-x-8 sm:grid-cols-2">
        <SeverityIndicator label="Estrogenic" value={content.sideEffects.estrogenic} />
        <SeverityIndicator label="Androgenic" value={content.sideEffects.androgenic} />
        <SeverityIndicator label="Cardiovascular" value={content.sideEffects.cardiovascular} />
        <SeverityIndicator label="Suppression" value={content.sideEffects.suppression} />
      </dl>
    ),
  })

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
    <div className="flex flex-col gap-8" data-testid="compound-content">
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

export default CompoundContent
