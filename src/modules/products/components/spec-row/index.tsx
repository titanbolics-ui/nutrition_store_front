import type { LucideIcon } from "lucide-react"

type SpecRowProps = {
  label: string
  value: string
  icon?: LucideIcon
}

const SpecRow = ({ label, value, icon: Icon }: SpecRowProps) => (
  <div className="grid grid-cols-[auto_1fr] items-baseline gap-x-6 gap-y-1 border-b border-gray-800 py-2 text-sm last:border-0">
    <dt className="flex items-center gap-2 whitespace-nowrap text-gray-400">
      {Icon && <Icon className="h-4 w-4 flex-shrink-0" aria-hidden="true" />}
      {label}
    </dt>
    <dd className="justify-self-end text-right font-medium text-white">
      {value}
    </dd>
  </div>
)

export default SpecRow
