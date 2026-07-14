import type { HttpTypes } from "@medusajs/types"

type ReconstitutionMeta = { vialAmount: unknown; unit: unknown }

/**
 * Reconstitution config lives on variant metadata (same convention as
 * restock_eta, see resolve-stock-state.ts), not in metadata.content — vial
 * amount genuinely varies per variant (e.g. 5mg vs 10mg vials of the same
 * product). Never throws on a malformed shape; treated as disabled instead.
 */
function readReconstitution(
  variant: HttpTypes.StoreProductVariant
): ReconstitutionMeta | null {
  const raw = variant.metadata?.reconstitution
  if (!raw || typeof raw !== "object") return null

  const r = raw as Record<string, unknown>
  if (r.enabled !== true) return null

  return { vialAmount: r.vialAmount, unit: r.unit }
}

export function hasReconstitutionEnabled(
  product: HttpTypes.StoreProduct
): boolean {
  return (product.variants ?? []).some(
    (variant) => readReconstitution(variant) !== null
  )
}

const CalculatorPlaceholder = ({
  product,
}: {
  product: HttpTypes.StoreProduct
}) => {
  const rows = (product.variants ?? [])
    .map((variant) => ({ variant, reconstitution: readReconstitution(variant) }))
    .filter(
      (
        row
      ): row is { variant: HttpTypes.StoreProductVariant; reconstitution: ReconstitutionMeta } =>
        row.reconstitution !== null
    )

  if (!rows.length) return null

  return (
    <div className="flex flex-col gap-4" data-testid="calculator-placeholder">
      <p className="text-sm text-gray-400">
        Full interactive calculator coming soon. Raw reconstitution values for
        this product:
      </p>
      <div className="flex flex-col gap-2">
        {rows.map(({ variant, reconstitution }) => (
          <div
            key={variant.id}
            className="flex items-center justify-between rounded-lg border border-gray-800 bg-gray-900/50 px-4 py-3 text-sm"
          >
            <span className="text-white">{variant.title}</span>
            <span className="text-gray-400">
              {String(reconstitution.vialAmount ?? "—")}{" "}
              {String(reconstitution.unit ?? "")}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default CalculatorPlaceholder
