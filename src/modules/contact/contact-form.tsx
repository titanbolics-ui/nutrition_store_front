"use client"

import { useState } from "react"
import { sendContactEmail } from "@lib/actions/contact"

const ContactForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    orderId: "",
    message: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    const result = await sendContactEmail(formData)

    if (result.success) {
      setIsSubmitted(true)
    } else {
      setError(result.error || "Something went wrong. Please try again.")
    }

    setIsSubmitting(false)
  }

  if (isSubmitted) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 rounded-full bg-[#ccff00]/20 flex items-center justify-center mx-auto mb-6">
          <svg
            className="w-8 h-8 text-[#ccff00]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h3 className="text-2xl font-bold text-white mb-2">Message Sent!</h3>
        <p className="text-gray-400 mb-6">
          We&apos;ll get back to you within 24 hours.
        </p>
        <button
          onClick={() => {
            setIsSubmitted(false)
            setFormData({ name: "", email: "", orderId: "", message: "" })
          }}
          className="text-[#ccff00] hover:underline"
        >
          Send another message
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        {/* Name */}
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-300 mb-2"
          >
            Your Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 bg-black/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#ccff00] focus:ring-1 focus:ring-[#ccff00] transition-colors"
            placeholder="John Doe"
          />
        </div>

        {/* Email */}
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-300 mb-2"
          >
            Email Address <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 bg-black/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#ccff00] focus:ring-1 focus:ring-[#ccff00] transition-colors"
            placeholder="john@example.com"
          />
        </div>
      </div>

      {/* Order ID */}
      <div>
        <label
          htmlFor="orderId"
          className="block text-sm font-medium text-gray-300 mb-2"
        >
          Order ID{" "}
          <span className="text-gray-500 font-normal">(if applicable)</span>
        </label>
        <input
          type="text"
          id="orderId"
          name="orderId"
          value={formData.orderId}
          onChange={handleChange}
          className="w-full px-4 py-3 bg-black/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#ccff00] focus:ring-1 focus:ring-[#ccff00] transition-colors"
          placeholder="#ONX-1253"
        />
      </div>

      {/* Message */}
      <div>
        <label
          htmlFor="message"
          className="block text-sm font-medium text-gray-300 mb-2"
        >
          Message <span className="text-red-500">*</span>
        </label>
        <textarea
          id="message"
          name="message"
          value={formData.message}
          onChange={handleChange}
          required
          rows={5}
          className="w-full px-4 py-3 bg-black/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#ccff00] focus:ring-1 focus:ring-[#ccff00] transition-colors resize-none"
          placeholder="How can we help you?"
        />
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-4 bg-[#ccff00] text-black font-bold rounded-lg hover:bg-[#b8e600] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isSubmitting ? (
          <>
            <svg
              className="animate-spin w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Sending...
          </>
        ) : (
          <>
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
            Send Message
          </>
        )}
      </button>
    </form>
  )
}

export default ContactForm
