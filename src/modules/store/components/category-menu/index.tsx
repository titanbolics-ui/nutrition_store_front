"use client"

import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { Text, clx } from "@medusajs/ui"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { ChevronDownMini } from "@medusajs/icons"

type CategoryMenuProps = {
  categories: HttpTypes.StoreProductCategory[]
}

const CategoryMenu = ({ categories }: CategoryMenuProps) => {
  if (!categories?.length) return null

  return (
    <div className="flex flex-col gap-y-4">
      <Text className="txt-compact-small-plus text-white uppercase tracking-wider font-bold">
        Categories
      </Text>
      <ul className="flex flex-col gap-y-1">
        {categories.map((category) => (
          <CategoryItem key={category.id} category={category} />
        ))}
      </ul>
    </div>
  )
}

const CategoryItem = ({
  category,
  depth = 0,
}: {
  category: HttpTypes.StoreProductCategory
  depth?: number
}) => {
  const pathname = usePathname()
  const hasChildren = category.category_children?.length > 0

  // Визначаємо, чи активна ця категорія або її діти
  const isActive = pathname === `/categories/${category.handle}`
  const isChildActive =
    hasChildren &&
    category.category_children.some((c) => pathname.includes(c.handle))

  // Стан відкриття
  const [open, setOpen] = useState(isActive || isChildActive)

  useEffect(() => {
    if (isActive || isChildActive) {
      setOpen(true)
    } else {
      setOpen(false)
    }
  }, [pathname, isActive, isChildActive])

  // Функція для ручного перемикання стрілкою
  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setOpen((prev) => !prev)
  }

  const paddingLeft = depth * 16

  return (
    <li className="select-none flex flex-col">
      <div
        className={clx(
          "flex items-center justify-between py-1 pr-2 rounded-sm transition-all group",
          // Активний стан: Neon Green border
          isActive
            ? "border-l-2 border-[#ccff00] pl-2 bg-white/5"
            : "hover:bg-white/5 hover:pl-1 border-l-2 border-transparent"
        )}
        style={{ paddingLeft: isActive ? undefined : `${paddingLeft}px` }}
      >
        <LocalizedClientLink
          href={`/categories/${category.handle}`}
          className={clx(
            "flex-1 py-1 text-sm font-medium transition-colors",
            isActive || isChildActive
              ? "text-[#ccff00]"
              : "text-gray-400 group-hover:text-white"
          )}
        >
          {category.name}
        </LocalizedClientLink>

        {hasChildren && (
          <button
            onClick={handleToggle}
            className="p-1 rounded-md text-gray-500 hover:text-white transition-colors"
          >
            <ChevronDownMini
              className={clx(
                "transition-transform duration-200",
                open ? "-rotate-180 text-white" : ""
              )}
            />
          </button>
        )}
      </div>

      {hasChildren && (
        <div
          className={clx(
            "overflow-hidden transition-all duration-300 ease-in-out",
            open ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"
          )}
        >
          <ul className="flex flex-col mt-1 gap-y-1 border-l border-white/10 ml-2">
            {category.category_children.map((child) => (
              <CategoryItem key={child.id} category={child} depth={depth + 1} />
            ))}
          </ul>
        </div>
      )}
    </li>
  )
}

export default CategoryMenu
