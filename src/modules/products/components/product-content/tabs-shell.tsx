"use client"

import * as TabsPrimitive from "@radix-ui/react-tabs"
import type { ReactNode } from "react"
import Accordion from "@modules/products/components/product-tabs/accordion"

export type ContentPanel = {
  value: string
  label: string
  // A pre-rendered icon element, not a component reference — this crosses
  // the Server → "use client" boundary as serialized markup (same channel
  // as `content`), whereas a bare component function can't be serialized.
  icon?: ReactNode
  content: ReactNode
}

/**
 * Desktop renders a Radix tab strip; mobile (below the `small:` / 1024px
 * breakpoint) renders the same panels as an accordion, reusing the existing
 * Accordion primitive from product-tabs/accordion.tsx. Both are always in
 * the DOM and toggled with responsive classes rather than JS media-query
 * detection, so there's no hydration flash.
 *
 * Every panel is force-mounted so inactive/collapsed content is present in
 * the initial HTML for search/AI crawlers — Radix would otherwise unmount
 * it. Tabs need the explicit data-[state=inactive]:hidden (Radix skips the
 * hidden attr under forceMount); the accordion applies `hidden` itself.
 * The switch animation is CSS-only (animate-fade-in-top re-triggers when the
 * active class returns), replacing the old mount-time framer-motion fade
 * that force-mounting made a no-op.
 */
const ProductContentTabs = ({ panels }: { panels: ContentPanel[] }) => {
  if (!panels.length) return null

  return (
    <div className="w-full">
      <div className="hidden small:block">
        <TabsPrimitive.Root defaultValue={panels[0].value} className="w-full">
          <TabsPrimitive.List
            className="no-scrollbar flex gap-6 overflow-x-auto border-b border-gray-800"
            aria-label="Product details"
          >
            {panels.map((panel) => (
              <TabsPrimitive.Trigger
                key={panel.value}
                value={panel.value}
                className="relative -mb-px flex items-center gap-2 whitespace-nowrap border-b-2 border-transparent px-1 py-3 text-sm font-medium text-gray-400 transition-colors hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ccff00] data-[state=active]:border-[#ccff00] data-[state=active]:text-white"
              >
                {panel.icon}
                {panel.label}
              </TabsPrimitive.Trigger>
            ))}
          </TabsPrimitive.List>
          {panels.map((panel) => (
            <TabsPrimitive.Content
              key={panel.value}
              value={panel.value}
              forceMount
              className="py-8 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#ccff00] data-[state=inactive]:hidden data-[state=active]:animate-fade-in-top motion-reduce:animate-none"
            >
              {panel.content}
            </TabsPrimitive.Content>
          ))}
        </TabsPrimitive.Root>
      </div>

      <div className="small:hidden">
        <Accordion type="multiple" defaultValue={[panels[0].value]}>
          {panels.map((panel) => (
            <Accordion.Item
              key={panel.value}
              value={panel.value}
              title={
                <span className="flex items-center gap-2">
                  {panel.icon}
                  {panel.label}
                </span>
              }
              headingSize="medium"
              forceMountContent
            >
              <div className="py-4">{panel.content}</div>
            </Accordion.Item>
          ))}
        </Accordion>
      </div>
    </div>
  )
}

export default ProductContentTabs
