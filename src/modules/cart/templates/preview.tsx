"use client"

import repeat from "@lib/util/repeat"
import { HttpTypes } from "@medusajs/types"
import { Table, clx } from "@medusajs/ui"

import Item from "@modules/cart/components/item"
import SkeletonLineItem from "@modules/skeletons/components/skeleton-line-item"

type WarehouseGroup = {
  locationName: string
  items: { title: string; quantity: number }[]
}

type ItemsTemplateProps = {
  cart: HttpTypes.StoreCart
  warehouseItems?: Record<string, WarehouseGroup>
}

const WarehouseLabel = ({ name }: { name: string }) => (
  <div className="flex items-center gap-2 px-1 pt-3 pb-1.5">
    <span className="w-[3px] h-3 bg-[#b8ff2b] rounded-full flex-shrink-0" />
    <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">
      {name}
    </span>
  </div>
)

const ItemsPreviewTemplate = ({
  cart,
  warehouseItems = {},
}: ItemsTemplateProps) => {
  const items = cart.items
  const hasOverflow = items && items.length > 4

  const titleToWarehouse: Record<string, string> = {}
  for (const loc of Object.values(warehouseItems)) {
    for (const item of loc.items) {
      titleToWarehouse[item.title] = loc.locationName
    }
  }

  const hasWarehouseGroups = Object.keys(warehouseItems).length > 1

  if (!items) {
    return (
      <div className="rounded-xl overflow-hidden">
        <Table className="w-full border-collapse">
          <Table.Body className="[&_tr:last-child_td]:border-b-0">
            {repeat(5).map((i) => (
              <SkeletonLineItem key={i} />
            ))}
          </Table.Body>
        </Table>
      </div>
    )
  }

  const sortedItems = [...items].sort((a, b) =>
    (a.created_at ?? "") > (b.created_at ?? "") ? -1 : 1
  )

  if (!hasWarehouseGroups) {
    return (
      <div
        className={clx("rounded-xl overflow-hidden border border-white/[0.06]", {
          "overflow-y-scroll overflow-x-hidden no-scrollbar max-h-[420px]":
            hasOverflow,
        })}
      >
        <Table className="w-full border-collapse">
          <Table.Body
            data-testid="items-table"
            className="[&_tr:last-child_td]:border-b-0 [&_tr]:border-b [&_tr]:border-white/5"
          >
            {sortedItems.map((item) => (
              <Item
                key={item.id}
                item={item}
                type="preview"
                currencyCode={cart.currency_code}
              />
            ))}
          </Table.Body>
        </Table>
      </div>
    )
  }

  // Group cart items by warehouse
  const groups: Array<{ locationName: string; items: typeof sortedItems }> = []
  const ungrouped: typeof sortedItems = []

  for (const item of sortedItems) {
    const loc = titleToWarehouse[item.title ?? ""]
    if (loc) {
      const existing = groups.find((g) => g.locationName === loc)
      if (existing) {
        existing.items.push(item)
      } else {
        groups.push({ locationName: loc, items: [item] })
      }
    } else {
      ungrouped.push(item)
    }
  }

  return (
    <div
      className={clx("rounded-xl overflow-hidden border border-white/[0.06]", {
        "overflow-y-scroll overflow-x-hidden no-scrollbar max-h-[420px]":
          hasOverflow,
      })}
    >
      {groups.map((group, gi) => (
        <div key={group.locationName}>
          <WarehouseLabel name={group.locationName} />
          <Table className="w-full border-collapse">
            <Table.Body
              data-testid="items-table"
              className="[&_tr:last-child_td]:border-b-0 [&_tr]:border-b [&_tr]:border-white/5"
            >
              {group.items.map((item) => (
                <Item
                  key={item.id}
                  item={item}
                  type="preview"
                  currencyCode={cart.currency_code}
                />
              ))}
            </Table.Body>
          </Table>
          {(gi < groups.length - 1 || ungrouped.length > 0) && (
            <div className="border-t border-white/[0.06] mx-3" />
          )}
        </div>
      ))}

      {ungrouped.length > 0 && (
        <div>
          {groups.length > 0 && <WarehouseLabel name="Other" />}
          <Table className="w-full border-collapse">
            <Table.Body className="[&_tr:last-child_td]:border-b-0 [&_tr]:border-b [&_tr]:border-white/5">
              {ungrouped.map((item) => (
                <Item
                  key={item.id}
                  item={item}
                  type="preview"
                  currencyCode={cart.currency_code}
                />
              ))}
            </Table.Body>
          </Table>
        </div>
      )}
    </div>
  )
}

export default ItemsPreviewTemplate
