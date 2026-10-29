export type Review = {
  id: string
  country: string // shown instead of names — user decision 2026-07-23
  rating: 1 | 2 | 3 | 4 | 5
  title?: string
  text: string
}

// REAL reviews supplied by the operator (Trustpilot-style), lightly cleaned
// for typos only. No names, no dates — country + rating + words.
// Never seed invented entries; the section hides itself when this is empty.
export const reviews: Review[] = [
  {
    id: "r1",
    country: "US",
    rating: 4,
    title: "The customer service was spot on",
    text: "To a tee. My order was out of stock — they notified me of it right away and made it right by sending me more than I ordered for the inconvenience. Customer for life.",
  },
  {
    id: "r2",
    country: "US",
    rating: 5,
    title: "Great customer service",
    text: "Takes about 3 weeks from the time I purchased til it was delivered. Comes with authenticity code on the box. Seems like a quality product so far, just started. Will be ordering again.",
  },
  {
    id: "r3",
    country: "US",
    rating: 5,
    title: "Communication was excellent",
    text: "Communication was consistent and speedy throughout the entire transaction. Very professional. Product was exactly as described, professionally sealed and labeled. Shipping was a little shaky at one point but came through in the end.",
  },
  {
    id: "r4",
    country: "US",
    rating: 5,
    title: "They came through with great products",
    text: "I have never seen or heard of them before and trusted them — and was completely impressed with the results. I will definitely do business with them again.",
  },
  {
    id: "r5",
    country: "US",
    rating: 5,
    title: "Arrived in a timely manner",
    text: "Communication was great and the product arrived in a timely manner.",
  },
  {
    id: "r6",
    country: "US",
    rating: 5,
    title: "110% legit",
    text: "This place is 110% legit, product outstanding, very professional. Kept me up to date with everything and put my mind at ease. The product is beautiful, comes packaged nice. 100% legit.",
  },
  {
    id: "r7",
    country: "US",
    rating: 5,
    title: "The price was excellent",
    text: "The price was excellent, the product is great, and they answered any questions I had. Great service. Will be using them again.",
  },
]
