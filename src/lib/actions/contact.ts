"use server"

import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

type ContactFormData = {
  name: string
  email: string
  orderId?: string
  message: string
}

export async function sendContactEmail(data: ContactFormData) {
  const { name, email, orderId, message } = data

  if (!name || !email || !message) {
    return { success: false, error: "Missing required fields" }
  }

  try {
    await resend.emails.send({
      from: "Onyx Genetics <noreply@onyxgenetics.com>",
      to: "sales@onyxgenetics.com",
      replyTo: email,
      subject: orderId 
        ? `Contact Form: ${name} - Order ${orderId}`
        : `Contact Form: ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #ccff00; background: #0a0a0a; padding: 20px; margin: 0;">
            New Contact Form Submission
          </h2>
          <div style="padding: 20px; background: #1a1a1a; color: #fff;">
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> <a href="mailto:${email}" style="color: #ccff00;">${email}</a></p>
            ${orderId ? `<p><strong>Order ID:</strong> ${orderId}</p>` : ""}
            <hr style="border: 1px solid #333; margin: 20px 0;" />
            <p><strong>Message:</strong></p>
            <p style="white-space: pre-wrap; background: #0a0a0a; padding: 15px; border-radius: 8px;">${message}</p>
          </div>
        </div>
      `,
    })

    return { success: true }
  } catch (error) {
    console.error("Failed to send email:", error)
    return { success: false, error: "Failed to send email" }
  }
}

