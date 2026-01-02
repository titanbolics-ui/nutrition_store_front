"use client"

import { useEffect, useRef } from "react"
import posthog from "posthog-js"
import { getCustomerForIdentification } from "@lib/posthog/identify-user"

export function PostHogIdentifier() {
  const hasIdentified = useRef(false)

  useEffect(() => {
    // Уникаємо повторної ідентифікації
    if (hasIdentified.current) {
      return
    }

    const identifyUser = async () => {
      try {
        const customer = await getCustomerForIdentification()

        if (customer && posthog) {
          // Ідентифікуємо користувача в PostHog
          posthog.identify(customer.id, {
            email: customer.email,
            first_name: customer.firstName,
            last_name: customer.lastName,
            phone: customer.phone,
            has_account: customer.hasAccount,
            created_at: customer.createdAt,
          })

          hasIdentified.current = true
          console.log("PostHog: User identified", customer.id)
        } else if (!customer && hasIdentified.current) {
          // Користувач вийшов - скидаємо ідентифікацію
          posthog.reset()
          hasIdentified.current = false
          console.log("PostHog: User logged out, reset identification")
        }
      } catch (error) {
        console.error("PostHog identification error:", error)
      }
    }

    identifyUser()
  }, [])

  return null
}

