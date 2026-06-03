import React from "react"
import repeat from "@lib/util/repeat"
import { HttpTypes } from "@medusajs/types"
import { Heading, Table } from "@medusajs/ui"

import Item from "@modules/cart/components/item"
import SkeletonLineItem from "@modules/skeletons/components/skeleton-line-item"

type WarehouseItem = {
  locationName: string
  items: { title: string; quantity: number }[]
}

type ItemsTemplateProps = {
  cart?: HttpTypes.StoreCart
  warehouseItems?: Record<string, WarehouseItem>
}

type CartItem = NonNullable<HttpTypes.StoreCart["items"]>[0]

const ItemsTemplate = ({ cart, warehouseItems = {} }: ItemsTemplateProps) => {
  const items = cart?.items

  const sortedItems: CartItem[] | undefined = items
    ? [...items].sort((a, b) =>
        (a.created_at ?? "") > (b.created_at ?? "") ? -1 : 1
      )
    : undefined

  const hasWarehouseGroups = Object.keys(warehouseItems).length > 1

  // Build title → locationName map
  const titleToWarehouse: Record<string, string> = {}
  for (const loc of Object.values(warehouseItems)) {
    for (const item of loc.items) {
      titleToWarehouse[item.title] = loc.locationName
    }
  }

  // Group cart items by warehouse
  const groupedItems: Array<{ locationName: string; items: CartItem[] }> = []
  const ungrouped: CartItem[] = []

  if (sortedItems && hasWarehouseGroups) {
    for (const item of sortedItems) {
      const loc = titleToWarehouse[item.title ?? ""]
      if (loc) {
        const existing = groupedItems.find((g) => g.locationName === loc)
        if (existing) {
          existing.items.push(item)
        } else {
          groupedItems.push({ locationName: loc, items: [item] })
        }
      } else {
        ungrouped.push(item)
      }
    }
  }

  return (
    <div>
      <div className="pb-3 flex items-center">
        <Heading className="text-[2rem] leading-[2.75rem] text-white">
          Cart
        </Heading>
      </div>
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-1 sm:p-2 overflow-x-auto">
        <Table className="text-white min-w-full">
          <Table.Header className="border-t-0 border-b border-gray-800">
            <Table.Row className="text-gray-400 txt-medium-plus">
              <Table.HeaderCell>Item</Table.HeaderCell>
              <Table.HeaderCell></Table.HeaderCell>
              <Table.HeaderCell>Quantity</Table.HeaderCell>
              <Table.HeaderCell className="hidden small:table-cell">
                Price
              </Table.HeaderCell>
              <Table.HeaderCell className="text-right">Total</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body className="[&_tr]:border-gray-800 [&_tr:last-child]:border-0">
            {!sortedItems ? (
              repeat(5).map((i) => <SkeletonLineItem key={i} />)
            ) : !hasWarehouseGroups ? (
              sortedItems.map((item) => (
                <Item
                  key={item.id}
                  item={item}
                  currencyCode={cart?.currency_code ?? ""}
                />
              ))
            ) : (
              <>
                {groupedItems.map((group) => (
                  <React.Fragment key={group.locationName}>
                    <tr className="border-0 bg-transparent">
                      <td colSpan={5} className="pt-4 pb-1.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className="w-[3px] h-3 bg-[#b8ff2b] rounded-full flex-shrink-0" />
                          <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">
                            {group.locationName}
                          </span>
                        </div>
                      </td>
                    </tr>
                    {group.items.map((item) => (
                      <Item
                        key={item.id}
                        item={item}
                        currencyCode={cart?.currency_code ?? ""}
                      />
                    ))}
                  </React.Fragment>
                ))}
                {ungrouped.length > 0 && (
                  <React.Fragment key="ungrouped">
                    {groupedItems.length > 0 && (
                      <tr className="border-0 bg-transparent">
                        <td colSpan={5} className="pt-4 pb-1.5 px-4">
                          <div className="flex items-center gap-2">
                            <span className="w-[3px] h-3 bg-[#b8ff2b] rounded-full flex-shrink-0" />
                            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">
                              Other
                            </span>
                          </div>
                        </td>
                      </tr>
                    )}
                    {ungrouped.map((item) => (
                      <Item
                        key={item.id}
                        item={item}
                        currencyCode={cart?.currency_code ?? ""}
                      />
                    ))}
                  </React.Fragment>
                )}
              </>
            )}
          </Table.Body>
        </Table>
      </div>
    </div>
  )
}

export default ItemsTemplate
