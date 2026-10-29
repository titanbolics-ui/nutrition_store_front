import { test, afterEach } from "node:test"
import assert from "node:assert/strict"
import * as React from "react"
import { cleanup, render, screen } from "@testing-library/react"

// jsdom has no IntersectionObserver; framer-motion's whileInView needs one.
class IntersectionObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return []
  }
}
;(globalThis as any).IntersectionObserver =
  (globalThis as any).IntersectionObserver ?? IntersectionObserverStub

import ReviewsSection from "./index.tsx"
import { reviews as liveReviews } from "./reviews-data.ts"

afterEach(() => cleanup())

test("renders NOTHING when there are no reviews — no fakes, no empty shell", () => {
  const { container } = render(<ReviewsSection reviews={[]} />)
  assert.equal(container.innerHTML, "")
})

test("renders a card per review: stars, country, no names/dates", () => {
  render(
    <ReviewsSection
      reviews={[
        {
          id: "r1",
          country: "US",
          rating: 4,
          title: "Spot on",
          text: "Great service.",
        },
        { id: "r2", country: "DE", rating: 5, text: "Fast shipping." },
      ]}
    />
  )
  const cards = screen.getAllByTestId("review-card")
  assert.equal(cards.length, 2)
  assert.match(cards[0].textContent!, /Verified customer · US/)
  assert.match(cards[1].textContent!, /Verified customer · DE/)
  assert.ok(cards[0].querySelector('[aria-label="Rated 4 out of 5 stars"]'))
})

test("live data entries are complete: country, valid rating, real text", () => {
  assert.ok(liveReviews.length > 0)
  for (const review of liveReviews) {
    assert.ok(review.country.length > 0)
    assert.ok(review.rating >= 1 && review.rating <= 5)
    assert.ok(review.text.length > 10)
    // No personal names/dates in the shown fields (operator decision)
    assert.ok(!("author" in review))
    assert.ok(!("date" in review))
  }
})
