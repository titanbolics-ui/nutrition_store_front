import { ChevronDown } from "lucide-react"
import Accordion from "@modules/products/components/product-tabs/accordion"
import type { FaqEntry } from "./types"

const FaqChevronTrigger = () => (
  <div className="group rounded-rounded p-[6px]">
    <ChevronDown
      className="h-5 w-5 text-gray-400 transition-transform duration-300 group-radix-state-open:rotate-180 group-radix-state-open:text-[#ccff00]"
      aria-hidden="true"
    />
  </div>
)

const FaqSection = ({ faq }: { faq: FaqEntry[] }) => {
  if (!faq.length) return null

  return (
    <Accordion type="single" collapsible data-testid="faq-section">
      {faq.map((entry, i) => (
        <Accordion.Item
          key={i}
          value={String(i)}
          title={<span className="font-medium text-white">{entry.q}</span>}
          customTrigger={<FaqChevronTrigger />}
        >
          <p className="text-sm text-gray-400">{entry.a}</p>
        </Accordion.Item>
      ))}
    </Accordion>
  )
}

export default FaqSection
