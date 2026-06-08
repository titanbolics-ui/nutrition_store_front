import { HttpTypes } from "@medusajs/types"
import { convertToLocale } from "@lib/util/money"

type PaymentHistoryProps = {
  order: HttpTypes.StoreOrder
}

type RowType = "payment" | "refund" | "credit_issued" | "credit_applied"

type PaymentRow = {
  id: string
  date: string
  amount: number
  type: RowType
  provider: string
}

function formatProvider(providerId: string): string {
  if (providerId.includes("cash-app"))      return "Cash App"
  if (providerId.includes("crypto-manual")) return "Bitcoin"
  if (providerId.includes("paypal-manual")) return "PayPal"
  if (providerId.includes("card-manual"))   return "Card"
  if (providerId.includes("system_default") || providerId.includes("system-default")) return "Manual"
  return providerId
}

const DOT_COLOR: Record<RowType, string> = {
  payment:        "bg-emerald-400",
  refund:         "bg-red-400",
  credit_issued:  "bg-blue-400",
  credit_applied: "bg-purple-400",
}

const AMOUNT_COLOR: Record<RowType, string> = {
  payment:        "text-emerald-400",
  refund:         "text-red-400",
  credit_issued:  "text-blue-400",
  credit_applied: "text-purple-400",
}

const AMOUNT_PREFIX: Record<RowType, string> = {
  payment:        "+",
  refund:         "−",
  credit_issued:  "−",
  credit_applied: "+",
}

const LABEL: Record<RowType, string> = {
  payment:        "Payment received",
  refund:         "Refund",
  credit_issued:  "Store credit issued",
  credit_applied: "Store credit applied",
}

const PaymentHistory = ({ order }: PaymentHistoryProps) => {
  const payments = order.payment_collections?.flatMap(pc => pc.payments ?? []) ?? []
  const creditLines = ((order as any).credit_lines ?? []) as Array<{
    id: string
    created_at: string
    amount: number
    reference?: string
  }>

  const rows: PaymentRow[] = []

  for (const p of payments) {
    if (p.captured_at) {
      rows.push({
        id: p.id,
        date: p.captured_at as string,
        amount: Number(p.amount ?? 0),
        type: "payment",
        provider: formatProvider(p.provider_id ?? ""),
      })
    }
    for (const r of (p.refunds as any[] | undefined) ?? []) {
      rows.push({
        id: r.id,
        date: r.created_at,
        amount: Number(r.amount ?? 0),
        type: "refund",
        provider: formatProvider(p.provider_id ?? ""),
      })
    }
  }

  const isCanceled = (order as any).status === "canceled"

  for (const cl of creditLines.filter(() => !isCanceled)) {
    const amt = Number(cl.amount ?? 0)
    rows.push({
      id: cl.id,
      date: cl.created_at,
      amount: Math.abs(amt),
      // negative credit_line amount = store is giving credit back to customer
      type: amt < 0 ? "credit_issued" : "credit_applied",
      provider: "Store Credit",
    })
  }

  // Sort chronologically
  rows.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  if (!rows.length) return null

  return (
    <div>
      <h2 className="text-sm font-semibold text-white mb-3">Payment history</h2>
      <div className="rounded-2xl overflow-hidden border border-white/[0.06] divide-y divide-white/[0.04]">
        {rows.map((row) => (
          <div key={row.id} className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${DOT_COLOR[row.type]}`} />
              <div className="flex flex-col">
                <span className="text-sm text-white font-medium">
                  {LABEL[row.type]}
                  {" · "}
                  <span className="text-gray-400 font-normal">{row.provider}</span>
                </span>
                <span className="text-xs text-gray-500">
                  {new Date(row.date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>
            <span className={`text-sm font-semibold ${AMOUNT_COLOR[row.type]}`}>
              {AMOUNT_PREFIX[row.type]}
              {convertToLocale({ amount: row.amount, currency_code: order.currency_code })}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default PaymentHistory
