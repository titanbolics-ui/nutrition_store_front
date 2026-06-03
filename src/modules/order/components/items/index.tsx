import React from "react"
import repeat from "@lib/util/repeat"
import { HttpTypes } from "@medusajs/types"
import { Table } from "@medusajs/ui"

import Item from "@modules/order/components/item"
import SkeletonLineItem from "@modules/skeletons/components/skeleton-line-item"

type WarehouseGroup = {
  locationName: string
  items: { title: string; quantity: number }[]
}

type ItemsProps = {
  order: HttpTypes.StoreOrder
  warehouseItems?: Record<string, WarehouseGroup>
}

const WarehouseLabel = ({ name }: { name: string }) => (
  <tr className="border-0 bg-transparent">
    <td colSpan={3} className="pt-3 pb-1.5 px-2">
      <div className="flex items-center gap-2">
        <span className="w-[3px] h-3 bg-[#b8ff2b] rounded-full flex-shrink-0" />
        <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">
          {name}
        </span>
      </div>
    </td>
  </tr>
)

const Items = ({ order, warehouseItems = {} }: ItemsProps) => {
  const items = order.items
  const sorted = items
    ? [...items].sort((a, b) =>
        (a.created_at ?? "") > (b.created_at ?? "") ? -1 : 1
      )
    : null

  const hasWarehouseGroups = Object.keys(warehouseItems).length > 1

  const titleToWarehouse: Record<string, string> = {}
  for (const loc of Object.values(warehouseItems)) {
    for (const item of loc.items) {
      titleToWarehouse[item.title] = loc.locationName
    }
  }

  type OrderItem = NonNullable<typeof sorted>[0]
  const groups: { locationName: string; items: OrderItem[] }[] = []
  const ungrouped: OrderItem[] = []

  if (sorted && hasWarehouseGroups) {
    for (const item of sorted) {
      const loc = titleToWarehouse[item.product_title ?? ""]
      if (loc) {
        const existing = groups.find((g) => g.locationName === loc)
        if (existing) existing.items.push(item)
        else groups.push({ locationName: loc, items: [item] })
      } else {
        ungrouped.push(item)
      }
    }
  }

  return (
    <div className="rounded-2xl overflow-hidden border border-white/[0.06]">
      <Table className="w-full border-collapse">
        <Table.Body
          data-testid="products-table"
          className="[&_tr:last-child_td]:border-b-0 [&_tr]:border-b [&_tr]:border-white/5"
        >
          {!sorted ? (
            repeat(5).map((i) => <SkeletonLineItem key={i} />)
          ) : !hasWarehouseGroups ? (
            sorted.map((item) => (
              <Item key={item.id} item={item} currencyCode={order.currency_code} />
            ))
          ) : (
            <>
              {groups.map((group) => (
                <React.Fragment key={group.locationName}>
                  <WarehouseLabel name={group.locationName} />
                  {group.items.map((item) => (
                    <Item key={item.id} item={item} currencyCode={order.currency_code} />
                  ))}
                </React.Fragment>
              ))}
              {ungrouped.length > 0 && (
                <React.Fragment key="ungrouped">
                  {groups.length > 0 && <WarehouseLabel name="Other" />}
                  {ungrouped.map((item) => (
                    <Item key={item.id} item={item} currencyCode={order.currency_code} />
                  ))}
                </React.Fragment>
              )}
            </>
          )}
        </Table.Body>
      </Table>
    </div>
  )
}

export default Items
