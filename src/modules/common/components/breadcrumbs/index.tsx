import LocalizedClientLink from "@modules/common/components/localized-client-link"

type BreadcrumbItem = {
  label: string
  href: string
}

type BreadcrumbsProps = {
  items: BreadcrumbItem[]
  /** Non-link tail of the trail — the page the visitor is on. */
  current?: string
  className?: string
}

/**
 * Single compact line: Home › Category › Current. Quiet by design — small
 * secondary text, no buttons; truncates instead of wrapping.
 */
export default function Breadcrumbs({
  items,
  current,
  className,
}: BreadcrumbsProps) {
  if (items.length === 0 && !current) return null

  return (
    <nav
      aria-label="Breadcrumb"
      className={`flex min-w-0 items-center gap-1.5 overflow-hidden whitespace-nowrap text-xs text-gray-500 ${
        className ?? ""
      }`}
    >
      <LocalizedClientLink
        href="/"
        className="transition-colors hover:text-gray-300"
      >
        Home
      </LocalizedClientLink>

      {items.map((item) => (
        <span key={item.href} className="flex min-w-0 items-center gap-1.5">
          <span aria-hidden="true">›</span>
          <LocalizedClientLink
            href={item.href}
            className="truncate transition-colors hover:text-gray-300"
          >
            {item.label}
          </LocalizedClientLink>
        </span>
      ))}

      {current && (
        <span className="flex min-w-0 items-center gap-1.5">
          <span aria-hidden="true">›</span>
          <span className="truncate text-gray-400" aria-current="page">
            {current}
          </span>
        </span>
      )}
    </nav>
  )
}
