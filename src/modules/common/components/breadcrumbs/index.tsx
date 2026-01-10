import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { ChevronRight } from "@medusajs/icons"

type BreadcrumbItem = {
  label: string
  href: string
}

type BreadcrumbsProps = {
  items: BreadcrumbItem[]
}

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  if (items.length === 0) return null

  return (
    <nav
      aria-label="Breadcrumb"
      className="flex items-center gap-2 text-sm text-ui-fg-muted mb-4"
    >
      <LocalizedClientLink
        href="/"
        className="hover:text-ui-fg-base transition-colors"
      >
        Home
      </LocalizedClientLink>

      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          <ChevronRight className="w-4 h-4" />
          {index === items.length - 1 ? (
            <span className="text-ui-fg-base font-medium">{item.label}</span>
          ) : (
            <LocalizedClientLink
              href={item.href}
              className="hover:text-ui-fg-base transition-colors"
            >
              {item.label}
            </LocalizedClientLink>
          )}
        </div>
      ))}
    </nav>
  )
}

