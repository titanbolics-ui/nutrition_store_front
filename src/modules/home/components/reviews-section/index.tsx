"use client"

import { motion, useReducedMotion } from "framer-motion"
import { Star } from "lucide-react"

import { fadeUp } from "@lib/util/motion"
import { reviews as defaultReviews, Review } from "./reviews-data"

const TRUSTPILOT_GREEN = "#00B67A"

/**
 * Social proof marquee with REAL customer reviews only (no names, no dates —
 * country + rating + words, per operator decision). The Trustpilot mark is an
 * attribution, deliberately NOT a link ("нехай самі шукають"). Renders nothing
 * while the data file is empty — an absent section is honest, an invented
 * review is not.
 */
const ReviewsSection = ({
  reviews = defaultReviews,
}: {
  reviews?: Review[]
}) => {
  const reducedMotion = useReducedMotion()

  if (reviews.length === 0) {
    return null
  }

  return (
    <section
      className="relative bg-[#0a0a0a] py-16 md:py-24 overflow-hidden"
      data-testid="reviews-section"
    >
      <div className="content-container relative z-10 mb-10 md:mb-12">
        <motion.div
          {...fadeUp}
          className="flex flex-col md:flex-row md:items-end md:justify-between gap-6"
        >
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="h-px w-10 bg-[#ccff00]/60" aria-hidden="true" />
              <span className="text-[#ccff00] font-mono text-xs uppercase tracking-[0.3em]">
                From real orders
              </span>
            </div>
            <h2 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tight">
              Word of <span className="text-[#ccff00]">mouth.</span>
            </h2>
          </div>

          {/* Trustpilot attribution — intentionally not a link.
              "Great" rating: 5 star tiles as the score; the wordmark's logo
              star is small and inline so it never reads as a 6th star. */}
          <div className="md:text-right" data-testid="trustpilot-mark">
            <div className="text-white font-bold text-sm mb-1.5">Great</div>
            <div className="flex items-center gap-1 mb-2 md:justify-end">
              {Array.from({ length: 5 }).map((_, i) => (
                <span
                  key={i}
                  className="flex h-6 w-6 items-center justify-center rounded-[3px]"
                  style={{ backgroundColor: TRUSTPILOT_GREEN }}
                >
                  <Star
                    className="h-4 w-4 text-white fill-white"
                    aria-hidden="true"
                  />
                </span>
              ))}
            </div>
            <div className="flex items-center gap-1.5 md:justify-end text-[11px] font-medium text-gray-400">
              <Star
                className="h-3 w-3 fill-current"
                style={{ color: TRUSTPILOT_GREEN }}
                aria-hidden="true"
              />
              <span>Reviews from Trustpilot</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Review ribbon: seamless marquee (two copies); static scroll row under
          reduced motion */}
      {reducedMotion ? (
        <div className="flex gap-4 overflow-x-auto no-scrollbar px-4">
          <ReviewSequence reviews={reviews} />
        </div>
      ) : (
        <div className="flex w-max animate-marquee-slow hover:[animation-play-state:paused]">
          <ReviewSequence reviews={reviews} />
          <ReviewSequence reviews={reviews} ariaHidden />
        </div>
      )}
    </section>
  )
}

const ReviewSequence = ({
  reviews,
  ariaHidden = false,
}: {
  reviews: Review[]
  ariaHidden?: boolean
}) => (
  <div aria-hidden={ariaHidden} className="flex gap-4 pr-4 shrink-0">
    {reviews.map((review) => (
      <ReviewCard key={review.id} review={review} muted={ariaHidden} />
    ))}
  </div>
)

const ReviewCard = ({
  review,
  muted,
}: {
  review: Review
  muted: boolean
}) => (
  <div
    className="w-[300px] md:w-[340px] shrink-0 p-6 bg-[#14171C] border border-[#252A31] rounded-xl hover:border-[#ccff00]/30 transition-colors duration-300"
    data-testid={muted ? undefined : "review-card"}
  >
    <div
      className="flex items-center gap-1 mb-3"
      aria-label={`Rated ${review.rating} out of 5 stars`}
    >
      {Array.from({ length: 5 }).map((_, star) => (
        <Star
          key={star}
          aria-hidden="true"
          className={
            star < review.rating
              ? "h-3.5 w-3.5 text-[#ccff00] fill-[#ccff00]"
              : "h-3.5 w-3.5 text-gray-700"
          }
        />
      ))}
    </div>
    {review.title && (
      <div className="text-white font-bold text-sm mb-1.5">{review.title}</div>
    )}
    <p className="text-gray-400 text-sm leading-relaxed line-clamp-4 mb-4">
      {review.text}
    </p>
    <div className="pt-3 border-t border-white/5 font-mono text-[10px] text-gray-500 uppercase tracking-widest">
      Verified customer · {review.country}
    </div>
  </div>
)

export default ReviewsSection
