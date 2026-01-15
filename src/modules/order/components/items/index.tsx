import repeat from "@lib/util/repeat"
import { HttpTypes } from "@medusajs/types"
import { Table } from "@medusajs/ui"

import Divider from "@modules/common/components/divider"
import Item from "@modules/order/components/item"
import SkeletonLineItem from "@modules/skeletons/components/skeleton-line-item"

type ItemsProps = {
  order: HttpTypes.StoreOrder
}

const Items = ({ order }: ItemsProps) => {
  const items = order.items

  return (
    <div className="flex flex-col mt-4">
      <Divider className="!mb-4" />
      <div className="bg-gray-800/30 border border-gray-700/50 rounded-lg p-0 sm:p-4 -mx-4 sm:mx-0 overflow-hidden">
        <Table className="[&_tr]:border-gray-700/30 [&_td]:align-middle [&_tr:last-child]:border-0 w-full">
          <Table.Body data-testid="products-table" className="text-white">
            {items?.length
              ? items
                  .sort((a, b) => {
                    return (a.created_at ?? "") > (b.created_at ?? "") ? -1 : 1
                  })
                  .map((item) => {
                    return (
                      <Item
                        key={item.id}
                        item={item}
                        currencyCode={order.currency_code}
                      />
                    )
                  })
              : repeat(5).map((i) => {
                  return <SkeletonLineItem key={i} />
                })}
          </Table.Body>
        </Table>
      </div>
    </div>
  )
}

export default Items
