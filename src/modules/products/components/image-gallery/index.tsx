"use client"

import { HttpTypes } from "@medusajs/types"
import { Container } from "@medusajs/ui"
import Image from "next/image"
import { useState } from "react"
import Lightbox from "yet-another-react-lightbox"
import Zoom from "yet-another-react-lightbox/plugins/zoom"
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails"
import "yet-another-react-lightbox/styles.css"
import "yet-another-react-lightbox/plugins/thumbnails.css"

type ImageGalleryProps = {
  images: HttpTypes.StoreProductImage[]
}

const ImageGallery = ({ images }: ImageGalleryProps) => {
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)

  // Prepare slides for lightbox
  const slides = images
    .filter((img) => !!img.url)
    .map((img) => ({
      src: img.url!,
      alt: `Product image`,
    }))

  const openLightbox = (index: number) => {
    setLightboxIndex(index)
    setLightboxOpen(true)
  }

  return (
    <>
      <div className="flex items-start relative">
        <div className="flex flex-col flex-1 small:mx-16 gap-y-4">
          {images.map((image, index) => {
            return (
              <Container
                key={image.id}
                className="relative aspect-square w-full overflow-hidden bg-gray-900 rounded-xl border border-gray-800 p-4 cursor-zoom-in group"
                id={image.id}
                onClick={() => openLightbox(index)}
              >
                {!!image.url && (
                  <div className="relative w-full h-full bg-white/95 rounded-lg overflow-hidden shadow-inner">
                    <Image
                      src={image.url}
                      priority={index <= 2 ? true : false}
                      className="absolute inset-0 rounded-lg transition-transform duration-300 group-hover:scale-105"
                      alt={`Product image ${index + 1}`}
                      fill
                      sizes="(max-width: 576px) 280px, (max-width: 768px) 360px, (max-width: 992px) 480px, 800px"
                      style={{
                        objectFit: "contain",
                        padding: "1rem",
                      }}
                    />
                    {/* Zoom icon overlay */}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/20 transition-all duration-300">
                      <div className="opacity-0 group-hover:opacity-100 transform scale-75 group-hover:scale-100 transition-all duration-300">
                        <div className="bg-black/70 backdrop-blur-sm rounded-full p-3">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-6 h-6 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
                            />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Mobile tap hint - only shows on first image */}
                {index === 0 && (
                  <div className="absolute bottom-6 right-6 small:hidden">
                    <div className="bg-[#ccff00] text-black text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 animate-pulse">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-3 h-3"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
                        />
                      </svg>
                      Tap to zoom
                    </div>
                  </div>
                )}
              </Container>
            )
          })}
        </div>
      </div>

      {/* Lightbox */}
      <Lightbox
        open={lightboxOpen}
        close={() => setLightboxOpen(false)}
        index={lightboxIndex}
        slides={slides}
        plugins={[Zoom, Thumbnails]}
        zoom={{
          maxZoomPixelRatio: 3,
          zoomInMultiplier: 2,
          doubleTapDelay: 300,
          doubleClickDelay: 300,
          doubleClickMaxStops: 2,
          keyboardMoveDistance: 50,
          wheelZoomDistanceFactor: 100,
          pinchZoomDistanceFactor: 100,
          scrollToZoom: true,
        }}
        thumbnails={{
          position: "bottom",
          width: 80,
          height: 80,
          gap: 8,
          borderRadius: 4,
          padding: 4,
          showToggle: true,
        }}
        carousel={{
          finite: images.length <= 3,
          preload: 2,
        }}
        animation={{
          fade: 300,
          swipe: 300,
          zoom: 300,
        }}
        controller={{
          closeOnBackdropClick: true,
          closeOnPullDown: true,
          closeOnPullUp: true,
        }}
        styles={{
          container: {
            backgroundColor: "rgba(0, 0, 0, 0.95)",
          },
          thumbnailsContainer: {
            backgroundColor: "rgba(0, 0, 0, 0.8)",
          },
        }}
        render={{
          iconClose: () => (
            <div className="p-2.5 bg-black/80 hover:bg-black/90 active:bg-black rounded-full transition-colors shadow-lg border border-white/20">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-6 h-6 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
          ),
          iconZoomIn: () => (
            <div className="p-2 bg-black/80 hover:bg-black/90 active:bg-black rounded-full transition-colors shadow-lg border border-white/20">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
                />
              </svg>
            </div>
          ),
          iconZoomOut: () => (
            <div className="p-2 bg-black/80 hover:bg-black/90 active:bg-black rounded-full transition-colors shadow-lg border border-white/20">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7"
                />
              </svg>
            </div>
          ),
        }}
      />
    </>
  )
}

export default ImageGallery
