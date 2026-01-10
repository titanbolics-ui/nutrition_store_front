"use client"

import { useEffect, useState, useRef, Fragment } from "react"
import { Dialog, DialogPanel, Transition, TransitionChild } from "@headlessui/react"
import Fuse from "fuse.js"
import { SearchableProduct } from "@lib/data/search"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Image from "next/image"

type SearchModalProps = {
  isOpen: boolean
  onClose: () => void
  products: SearchableProduct[]
}

export default function SearchModal({
  isOpen,
  onClose,
  products,
}: SearchModalProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<SearchableProduct[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  // Ініціалізація Fuse.js
  const fuse = useRef<Fuse<SearchableProduct>>(
    new Fuse(products, {
      keys: [
        { name: "title", weight: 5 },
        { name: "overviewHtml", weight: 3 },
        { name: "description", weight: 1 },
        { name: "handle", weight: 0.5 },
      ],
      threshold: 0.35,
      includeScore: true,
      minMatchCharLength: 2,
      ignoreLocation: true,
      distance: 300,
    })
  )

  // Оновлюємо Fuse при зміні продуктів
  useEffect(() => {
    fuse.current = new Fuse(products, {
      keys: [
        { name: "title", weight: 5 },
        { name: "overviewHtml", weight: 3 },
        { name: "description", weight: 1 },
        { name: "handle", weight: 0.5 },
      ],
      threshold: 0.35,
      includeScore: true,
      minMatchCharLength: 2,
      ignoreLocation: true,
      distance: 300,
    })
  }, [products])

  // Фокус на input при відкритті модалки
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus()
      }, 100)
    }
  }, [isOpen])

  // Пошук в реальному часі
  useEffect(() => {
    if (searchQuery.trim().length >= 2) {
      const results = fuse.current.search(searchQuery)
      setSearchResults(results.map((result) => result.item).slice(0, 10))
    } else {
      setSearchResults([])
    }
  }, [searchQuery])

  // ESC для закриття (Headless UI вже обробляє ESC, але додамо для зручності)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        e.preventDefault()
        onClose()
      }
    }

    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown)
      return () => window.removeEventListener("keydown", handleKeyDown)
    }
  }, [isOpen, onClose])

  const handleClose = () => {
    setSearchQuery("")
    setSearchResults([])
    onClose()
  }

  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/25 backdrop-blur-sm" />
        </TransitionChild>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-start justify-center p-4 pt-20">
            <TransitionChild
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <DialogPanel className="w-full max-w-3xl transform overflow-hidden rounded-2xl bg-white shadow-xl transition-all">
                {/* Search Input */}
                <div className="border-b p-4">
                  <div className="relative">
                    <input
                      ref={inputRef}
                      type="text"
                      placeholder="Search products..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full px-4 py-3 text-lg border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery("")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>

                {/* Search Results */}
                <div className="max-h-[60vh] overflow-y-auto py-4 px-4">
          {searchQuery.trim().length < 2 && (
            <div className="text-center text-gray-500 py-8">
              Type at least 2 characters to search
            </div>
          )}

          {searchQuery.trim().length >= 2 && searchResults.length === 0 && (
            <div className="text-center text-gray-500 py-8">
              No products found for &quot;{searchQuery}&quot;
            </div>
          )}

          {searchResults.length > 0 && (
            <div className="space-y-1">
              {searchResults.map((product) => (
                <LocalizedClientLink
                  key={product.id}
                  href={`/products/${product.handle}`}
                  onClick={handleClose}
                  className="flex items-center gap-3 p-2 hover:bg-gray-100 transition-colors group"
                >
                  {/* Thumbnail */}
                  <div className="relative w-14 h-14 flex-shrink-0 bg-gray-100 rounded overflow-hidden">
                    {product.thumbnail ? (
                      <Image
                        src={product.thumbnail}
                        alt={product.title}
                        fill
                        className="object-cover"
                        sizes="56px"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                        No image
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0 py-1">
                    <h3 className="text-sm text-gray-900 line-clamp-2 leading-tight">
                      {product.title}
                    </h3>
                  </div>

                  {/* Price */}
                  {product.cheapestPrice && (
                    <div className="flex-shrink-0 text-right">
                      <div className="text-base font-semibold text-gray-900">
                        {product.cheapestPrice}
                      </div>
                    </div>
                  )}
                </LocalizedClientLink>
              ))}
            </div>
          )}
                </div>

                {/* Results Count */}
                {searchResults.length > 0 && (
                  <div className="border-t p-3 text-center text-sm text-gray-500">
                    Showing {searchResults.length} result
                    {searchResults.length !== 1 ? "s" : ""}
                  </div>
                )}
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}

