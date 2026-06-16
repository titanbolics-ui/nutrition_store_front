import { parsePhoneNumberFromString, CountryCode } from "libphonenumber-js"

export type PhoneCheck = { valid: boolean; e164?: string }

// Soft client-side phone check, mirroring the backend src/utils/phone.ts rules:
// strip junk; leading "+" or "00" → international parse; otherwise parse with
// countryCode. Used for non-blocking inline warnings — submission is never
// blocked, the backend is the source of truth for what gets stored.
export function checkPhone(raw: string, countryCode?: string): PhoneCheck {
  const stripped = raw.replace(/[^\d+]/g, "")
  if (!stripped) return { valid: false }

  const candidate = stripped.startsWith("00") ? "+" + stripped.slice(2) : stripped

  const parsed = candidate.startsWith("+")
    ? parsePhoneNumberFromString(candidate)
    : countryCode
      ? parsePhoneNumberFromString(candidate, countryCode.toUpperCase() as CountryCode)
      : undefined

  if (!parsed || !parsed.isPossible()) return { valid: false }
  return { valid: true, e164: parsed.format("E.164") }
}
