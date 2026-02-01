"use client"

import { useEffect, useRef } from "react"
import posthog from "posthog-js"
import { getCustomerForIdentification } from "@lib/posthog/identify-user"
import { useSearchParams } from "next/navigation"

export function PostHogIdentifier() {
  const hasIdentified = useRef(false)
  const hasProcessedWhatsappUTM = useRef(false)
  const searchParams = useSearchParams()

  useEffect(() => {
    // Уникаємо повторної ідентифікації
    if (hasIdentified.current) {
      return
    }

    const utmContent = searchParams.get("utm_content")
    const utmSource = searchParams.get("utm_source")

    if (utmSource === "whatsapp" && utmContent && !hasProcessedWhatsappUTM.current) {
      // setPersonProperties НЕ змінює основний ID, 
      // але відразу створює профіль "Person" з цією властивістю
      posthog.setPersonProperties({
        whatsapp_id: utmContent, // твої 5314
        lead_source: "whatsapp",
        first_seen_whatsapp_id: utmContent
      })
      
      // Відправляємо подію, щоб ти міг бачити в стрічці, що лід прийшов
      posthog.capture("lead_entered_from_whatsapp", { 
        whatsapp_id: utmContent 
      })

      hasProcessedWhatsappUTM.current = true
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
            whatsapp_id: utmContent || undefined 
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

