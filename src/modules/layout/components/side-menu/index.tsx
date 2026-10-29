"use client"

import { Dialog, Transition } from "@headlessui/react"
import { XMark } from "@medusajs/icons"
import { Text, useToggleState } from "@medusajs/ui"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Fragment, useState } from "react"

import LocalizedClientLink from "@modules/common/components/localized-client-link"
import CountrySelect from "../country-select"
import { HttpTypes } from "@medusajs/types"

// Service links
const ServiceLinks = [
  { name: "Track My Order", href: "/orders/track" },
  { name: "Lab Results", href: "/lab-results" },
  { name: "Shipping Info", href: "/shipping" },
  { name: "Returns", href: "/returns" },
  { name: "Contact", href: "/contact" },
]

const SideMenu = ({
  regions,
  categories,
}: {
  regions: HttpTypes.StoreRegion[] | null
  categories: HttpTypes.StoreProductCategory[]
}) => {
  const [isOpen, setIsOpen] = useState(false)
  // Drill-down path through the category tree; empty = root level.
  const [stack, setStack] = useState<HttpTypes.StoreProductCategory[]>([])
  const toggleState = useToggleState()

  const rootCategories = categories.filter((c) => !c.parent_category)

  // The flat list carries every category with its own expanded children;
  // nested `category_children` objects don't. Resolve through the flat list
  // so drilling works at any depth.
  const childrenOf = (category: HttpTypes.StoreProductCategory) => {
    const full = categories.find((c) => c.id === category.id)
    return full?.category_children ?? category.category_children ?? []
  }

  const currentCategory = stack[stack.length - 1]
  const currentLevel = currentCategory
    ? childrenOf(currentCategory)
    : rootCategories

  const openMenu = () => {
    setStack([])
    setIsOpen(true)
  }
  const closeMenu = () => setIsOpen(false)
  const drillInto = (category: HttpTypes.StoreProductCategory) =>
    setStack((prev) => [...prev, category])
  const goBack = () => setStack((prev) => prev.slice(0, -1))

  return (
    <div className="h-full">
      <div className="flex items-center h-full">
        {/* Menu Button */}
        <button
          data-testid="nav-menu-button"
          onClick={openMenu}
          className="h-full flex items-center gap-2 transition-all ease-out duration-200 focus:outline-none hover:text-[#ccff00] group"
        >
          {/* Hamburger Icon */}
          <div className="flex flex-col gap-1.5 w-5">
            <span className="w-full h-[2px] bg-current rounded-full transition-transform group-hover:translate-x-0.5" />
            <span className="w-3/4 h-[2px] bg-current rounded-full transition-transform group-hover:w-full" />
            <span className="w-full h-[2px] bg-current rounded-full transition-transform group-hover:-translate-x-0.5" />
          </div>
        </button>

        {/* Full Screen Menu Dialog */}
        <Transition show={isOpen} as={Fragment}>
          <Dialog as="div" className="relative z-[9999]" onClose={closeMenu}>
            {/* Backdrop */}
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300 motion-reduce:duration-0"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200 motion-reduce:duration-0"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-black/90" />
            </Transition.Child>

            {/* Menu Panel */}
            <div className="fixed inset-0 overflow-y-auto">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300 motion-reduce:duration-0"
                enterFrom="-translate-x-full"
                enterTo="translate-x-0"
                leave="ease-in duration-200 motion-reduce:duration-0"
                leaveFrom="translate-x-0"
                leaveTo="-translate-x-full"
              >
                <Dialog.Panel
                  data-testid="nav-menu-popup"
                  className="fixed left-0 top-0 h-full w-full max-w-xs bg-black flex flex-col"
                >
                  {/* Header */}
                  <div className="flex items-center justify-between p-5 border-b border-gray-800">
                    {currentCategory ? (
                      <button
                        data-testid="menu-back-button"
                        onClick={goBack}
                        className="flex items-center gap-2 min-h-[44px] text-white font-bold text-lg uppercase hover:text-[#ccff00] transition-colors"
                      >
                        <ChevronLeft className="w-5 h-5" aria-hidden="true" />
                        {currentCategory.name}
                      </button>
                    ) : (
                      <span className="text-[#ccff00] font-bold text-xl">
                        MENU
                      </span>
                    )}
                    <button
                      data-testid="close-menu-button"
                      onClick={closeMenu}
                      className="p-2 text-gray-400 hover:text-white transition-colors"
                    >
                      <XMark className="w-6 h-6" />
                    </button>
                  </div>

                  {/* Main Content */}
                  <div className="flex-1 overflow-y-auto py-4">
                    {/* Categories (drill-down) */}
                    <div className="px-5 mb-6">
                      {!currentCategory && (
                        <h3 className="text-gray-500 text-xs font-semibold tracking-widest mb-4 uppercase">
                          Shop
                        </h3>
                      )}
                      <ul className="space-y-1">
                        {/* Inside a category: link to the category itself */}
                        {currentCategory && (
                          <li>
                            <LocalizedClientLink
                              href={`/categories/${currentCategory.handle}`}
                              onClick={closeMenu}
                              className="flex items-center min-h-[44px] py-2 text-lg font-bold text-[#ccff00] hover:text-white transition-colors uppercase"
                            >
                              View all {currentCategory.name}
                            </LocalizedClientLink>
                          </li>
                        )}

                        {currentLevel.map((category) => {
                          const hasChildren = childrenOf(category).length > 0
                          return (
                            <li key={category.id}>
                              {hasChildren ? (
                                <button
                                  data-testid="menu-category-drill"
                                  onClick={() => drillInto(category)}
                                  className="flex items-center justify-between w-full min-h-[44px] py-2 text-xl font-bold text-white hover:text-[#ccff00] transition-colors uppercase text-left"
                                >
                                  {category.name}
                                  <ChevronRight
                                    className="w-5 h-5 text-gray-500"
                                    aria-hidden="true"
                                  />
                                </button>
                              ) : (
                                <LocalizedClientLink
                                  href={`/categories/${category.handle}`}
                                  onClick={closeMenu}
                                  className="flex items-center min-h-[44px] py-2 text-xl font-bold text-white hover:text-[#ccff00] transition-colors uppercase"
                                >
                                  {category.name}
                                </LocalizedClientLink>
                              )}
                            </li>
                          )
                        })}

                        {/* Root level: all-products entry */}
                        {!currentCategory && (
                          <li>
                            <LocalizedClientLink
                              href="/store"
                              onClick={closeMenu}
                              className="flex items-center min-h-[44px] py-2 text-xl font-bold text-white hover:text-[#ccff00] transition-colors uppercase"
                            >
                              All Products
                            </LocalizedClientLink>
                          </li>
                        )}
                      </ul>
                    </div>

                    {/* Service links only at root level — drilled views stay focused */}
                    {!currentCategory && (
                      <>
                        {/* Divider */}
                        <div className="mx-5 border-t border-gray-800 my-4" />

                        <div className="px-5">
                          <h3 className="text-gray-500 text-xs font-semibold tracking-widest mb-4 uppercase">
                            Help & Info
                          </h3>
                          <ul className="space-y-2">
                            {ServiceLinks.map((item) => (
                              <li key={item.name}>
                                <LocalizedClientLink
                                  href={item.href}
                                  onClick={closeMenu}
                                  className="block py-1 text-sm text-gray-400 hover:text-white transition-colors"
                                >
                                  {item.name}
                                </LocalizedClientLink>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="border-t border-gray-800 p-5 space-y-3">
                    {/* Account */}
                    <LocalizedClientLink
                      href="/account"
                      onClick={closeMenu}
                      className="flex items-center justify-center w-full py-3 bg-[#ccff00] hover:bg-[#b8ff2b] text-black font-bold rounded-lg transition-all"
                    >
                      My Account
                    </LocalizedClientLink>

                    {/* Region */}
                    <div
                      className="flex items-center justify-between px-4 py-3 bg-gray-900 rounded-lg"
                      onMouseEnter={toggleState.open}
                      onMouseLeave={toggleState.close}
                    >
                      {regions && (
                        <CountrySelect
                          toggleState={toggleState}
                          regions={regions}
                        />
                      )}
                    </div>

                    {/* Copyright */}
                    <Text className="text-center text-gray-600 text-xs pt-2">
                      © {new Date().getFullYear()} Onyx Genetics
                    </Text>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </Dialog>
        </Transition>
      </div>
    </div>
  )
}

export default SideMenu
