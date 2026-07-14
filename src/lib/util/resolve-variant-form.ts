export type VariantForm = "tablets" | "ampoule" | "vial"

/**
 * Classifies a variant option value ("10ml Vial", "100 tabs", "1ml amp") into
 * a physical form so the selector can show a form icon + header. Option
 * values are admin-entered free text and intentionally NOT normalized here —
 * the value keyword wins over metadata.form because a single product can mix
 * forms (ampoules and vials); metadata.form is only the fallback when the
 * value itself says nothing.
 */
export function classifyOptionValue(
  value: string,
  productForm?: unknown
): VariantForm | null {
  if (/amp/i.test(value)) return "ampoule"
  if (/tab|caps|pill/i.test(value)) return "tablets"
  if (/vial|kit|pen|cartridge/i.test(value)) return "vial"

  const form = typeof productForm === "string" ? productForm : ""
  if (/oral/i.test(form)) return "tablets"
  if (/inject/i.test(form)) return "vial"

  return null
}

export const FORM_LABELS: Record<VariantForm, string> = {
  tablets: "Tablets",
  ampoule: "Ampoules",
  vial: "Vials",
}
