"use client"

import { HttpTypes } from "@medusajs/types"
import { clx } from "@medusajs/ui"
import Image from "next/image"
import { useEffect, useRef, useState } from "react"

type GalleryViewProps = {
  images: HttpTypes.StoreProductImage[]
  onZoom: (index: number) => void
}

/**
 * Slider markup only — the lightbox (and its CSS imports, which the node
 * test runner can't parse) lives in index.tsx. Desktop (small:+): main image
 * with a clickable thumbnail strip. Mobile: native scroll-snap swipe
 * carousel with dot indicators. Every image stays mounted in the DOM (SEO) —
 * inactive slides are hidden with CSS, not unmounted.
 */
const GalleryView = ({ images, onZoom }: GalleryViewProps) => {
  const [activeIndex, setActiveIndex] = useState(0)
  const trackRef = useRef<HTMLDivElement>(null)

  // Variant switch re-filters the images server-side (v_id param) — the
  // remembered index may point past the new, shorter set.
  useEffect(() => {
    setActiveIndex((prev) => (prev < images.length ? prev : 0))
  }, [images.length])

  // Mobile: derive the active dot from the scroll position of the snap track.
  const handleTrackScroll = () => {
    const track = trackRef.current
    if (!track || track.clientWidth === 0) return
    const index = Math.round(track.scrollLeft / track.clientWidth)
    setActiveIndex(Math.min(Math.max(index, 0), images.length - 1))
  }

  const selectImage = (index: number) => {
    setActiveIndex(index)
    // Keep the mobile track in sync in case of a mid-breakpoint resize.
    trackRef.current?.scrollTo({
      left: index * trackRef.current.clientWidth,
      behavior: "auto",
    })
  }

  if (images.length === 0) {
    return null
  }

  return (
    <div className="flex flex-col gap-y-4" data-testid="image-gallery">
      {/* Desktop: stacked slides, one visible */}
      <div className="hidden small:block relative aspect-square w-full overflow-hidden rounded-xl border border-gray-800 bg-gray-900 p-4">
        {images.map((image, index) => (
          <button
            key={image.id}
            type="button"
            onClick={() => onZoom(index)}
            aria-label={`Zoom product image ${index + 1}`}
            className={clx(
              "absolute inset-4 cursor-zoom-in rounded-lg bg-white/95 shadow-inner group",
              index !== activeIndex && "hidden"
            )}
          >
            <Image
              src={image.url!}
              priority={index === 0}
              className="rounded-lg object-contain p-4 transition-transform duration-300 group-hover:scale-105"
              alt={`Product image ${index + 1}`}
              fill
              sizes="(max-width: 992px) 480px, 800px"
            />
          </button>
        ))}
      </div>

      {/* Desktop: thumbnail strip */}
      {images.length > 1 && (
        <div
          className="hidden small:flex flex-wrap gap-2"
          data-testid="gallery-thumbnails"
        >
          {images.map((image, index) => (
            <button
              key={image.id}
              type="button"
              onClick={() => selectImage(index)}
              aria-label={`Show product image ${index + 1}`}
              aria-current={index === activeIndex || undefined}
              className={clx(
                "relative h-20 w-20 overflow-hidden rounded-lg border bg-white/95 transition-colors duration-150",
                index === activeIndex
                  ? "border-[#ccff00]"
                  : "border-gray-800 hover:border-gray-600"
              )}
            >
              <Image
                src={image.url!}
                alt={`Product thumbnail ${index + 1}`}
                fill
                sizes="80px"
                className="object-contain p-1.5"
              />
            </button>
          ))}
        </div>
      )}

      {/* Mobile: swipeable snap carousel */}
      <div className="small:hidden">
        <div
          ref={trackRef}
          onScroll={handleTrackScroll}
          className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto rounded-xl"
          data-testid="gallery-track"
        >
          {images.map((image, index) => (
            <div
              key={image.id}
              className="relative aspect-square w-full shrink-0 snap-center overflow-hidden rounded-xl border border-gray-800 bg-gray-900 p-3"
              onClick={() => onZoom(index)}
            >
              <div className="relative h-full w-full rounded-lg bg-white/95 shadow-inner">
                <Image
                  src={image.url!}
                  priority={index === 0}
                  alt={`Product image ${index + 1}`}
                  fill
                  sizes="(max-width: 576px) 320px, 480px"
                  className="rounded-lg object-contain p-3"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Dot indicators */}
        {images.length > 1 && (
          <div
            className="mt-3 flex justify-center gap-2"
            data-testid="gallery-dots"
          >
            {images.map((image, index) => (
              <button
                key={image.id}
                type="button"
                onClick={() => selectImage(index)}
                aria-label={`Go to image ${index + 1}`}
                aria-current={index === activeIndex || undefined}
                className={clx(
                  "h-2 w-2 rounded-full transition-colors duration-150",
                  index === activeIndex ? "bg-[#ccff00]" : "bg-gray-700"
                )}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default GalleryView
