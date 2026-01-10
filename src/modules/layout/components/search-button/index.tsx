"use client"

import { useState, useEffect } from "react"
import SearchModal from "../search-modal"
import { SearchableProduct } from "@lib/data/search"

type SearchButtonProps = {
  products: SearchableProduct[]
}

export default function SearchButton({ products }: SearchButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Keyboard shortcut: Ctrl+K or Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setIsModalOpen(true)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="hover:text-ui-fg-base flex items-center gap-2 group"
        aria-label="Search products"
        title="Search (Ctrl+K)"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-5 h-5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
          />
        </svg>
        <span className="hidden small:inline">Search</span>
        <kbd className="hidden lg:inline-flex items-center gap-1 px-2 py-0.5 text-xs font-mono bg-gray-100 border border-gray-200 rounded">
          ⌘K
        </kbd>
      </button>

      <SearchModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        products={products}
      />
    </>
  )
}

