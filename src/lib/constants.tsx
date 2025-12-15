import React from "react"
import { CreditCard } from "@medusajs/icons"

import Ideal from "@modules/common/icons/ideal"
import Bancontact from "@modules/common/icons/bancontact"
import PayPal from "@modules/common/icons/paypal"
import CryptoStackIcon from "@modules/common/icons/crypto"
import CashApp from "@modules/common/icons/cash-app"

/* Map of payment provider_id to their title and icon. Add in any payment providers you want to use. */
export const paymentInfoMap: Record<
  string,
  { title: string; icon: React.JSX.Element }
> = {
  pp_stripe_stripe: {
    title: "Credit card",
    icon: <CreditCard />,
  },
  "pp_medusa-payments_default": {
    title: "Credit card",
    icon: <CreditCard />,
  },
  "pp_stripe-ideal_stripe": {
    title: "iDeal",
    icon: <Ideal />,
  },
  "pp_stripe-bancontact_stripe": {
    title: "Bancontact",
    icon: <Bancontact />,
  },
  pp_paypal_paypal: {
    title: "PayPal",
    icon: <PayPal />,
  },
  pp_system_default: {
    title: "Default Test Payment",
    icon: <CreditCard />,
  },
  "pp_crypto-manual_crypto-manual": {
    title: "Bitcoin",
    icon: <CryptoStackIcon />,
  },
  "pp_paypal-manual_paypal-manual": {
    title: "PayPal (friends & family)",
    icon: <PayPal />,
  },
  "pp_cash-app_cash-app": {
    title: "Cash App",
    icon: <CashApp />,
  },

  // Add more payment providers here
}

// This only checks if it is native stripe or medusa payments for card payments, it ignores the other stripe-based providers
export const isStripeLike = (providerId?: string) => {
  return (
    providerId?.startsWith("pp_stripe_") || providerId?.startsWith("pp_medusa-")
  )
}

export const isPaypal = (providerId?: string) => {
  return providerId?.startsWith("pp_paypal")
}

export const isPaypalManual = (providerId?: string) => {
  return providerId?.startsWith("pp_paypal-manual_paypal-manual")
}

export const isCryptoManual = (providerId?: string) => {
  return providerId?.startsWith("pp_crypto-manual_crypto-manual")
}

export const isCashApp = (providerId?: string) => {
  return providerId?.startsWith("pp_cash-app_cash-app")
}

export const isManual = (providerId?: string) => {
  return isPaypalManual(providerId) || isCryptoManual(providerId)
}

// Add currencies that don't need to be divided by 100
export const noDivisionCurrencies = [
  "krw",
  "jpy",
  "vnd",
  "clp",
  "pyg",
  "xaf",
  "xof",
  "bif",
  "djf",
  "gnf",
  "kmf",
  "mga",
  "rwf",
  "xpf",
  "htg",
  "vuv",
  "xag",
  "xdr",
  "xau",
]
