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
      <Text className="txt-compact-small-plus text-ui-fg-muted uppercase tracking-wider font-bold">
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

  // ⚡ ГОЛОВНЕ ВИПРАВЛЕННЯ:
  // Ми додаємо else { setOpen(false) }.
  // Це забезпечує ефект "Акордеона": коли ви йдете на іншу категорію, ця автоматично закриється.
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
          "flex items-center justify-between py-1 pr-2 rounded-md transition-colors group",
          isActive ? "bg-ui-bg-base shadow-sm" : "hover:bg-ui-bg-subtle"
        )}
        style={{ paddingLeft: `${paddingLeft}px` }}
      >
        {/* 
             👇 ПРИБРАНО onClick={() => setOpen(true)} 
             Тепер відкриттям керує тільки URL (useEffect).
             Це усуває "блимання" при переході.
          */}
        <LocalizedClientLink
          href={`/categories/${category.handle}`}
          className={clx(
            "flex-1 py-1 text-sm font-medium transition-colors",
            isActive || isChildActive
              ? "text-ui-fg-base"
              : "text-ui-fg-subtle group-hover:text-ui-fg-base"
          )}
        >
          {category.name}
        </LocalizedClientLink>

        {hasChildren && (
          <button
            onClick={handleToggle}
            className="p-1 rounded-md text-ui-fg-muted hover:text-ui-fg-base hover:bg-ui-bg-base-pressed transition-colors"
          >
            <ChevronDownMini
              className={clx(
                "transition-transform duration-200",
                open ? "-rotate-180 text-ui-fg-base" : ""
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
          <ul className="flex flex-col mt-1 gap-y-1 border-l border-ui-border-base ml-2">
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
