import { HttpTypes } from "@medusajs/types"
import { Table, Text } from "@medusajs/ui"

import LineItemOptions from "@modules/common/components/line-item-options"
import LineItemPrice from "@modules/common/components/line-item-price"
import LineItemUnitPrice from "@modules/common/components/line-item-unit-price"
import Thumbnail from "@modules/products/components/thumbnail"

type ItemProps = {
  item: HttpTypes.StoreCartLineItem | HttpTypes.StoreOrderLineItem
  currencyCode: string
}

const Item = ({ item, currencyCode }: ItemProps) => {
  return (
    <Table.Row className="w-full" data-testid="product-row">
      <Table.Cell className="!p-2 w-auto align-middle">
        <div className="w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-zinc-900 ring-1 ring-white/5">
          <Thumbnail thumbnail={item.thumbnail} size="square" />
        </div>
      </Table.Cell>

      <Table.Cell className="text-left !py-2 !px-2 align-middle">
        <div className="flex flex-col gap-y-0.5 min-w-0">
          <Text
            className="text-sm font-medium text-white leading-snug break-words"
            data-testid="product-name"
          >
            {item.product_title}
          </Text>
          <LineItemOptions variant={item.variant} data-testid="product-variant" />
        </div>
      </Table.Cell>

      <Table.Cell className="!p-2 w-auto align-middle text-right">
        <span className="flex flex-col items-end justify-center gap-y-0.5">
          <span className="flex gap-x-1 items-baseline text-gray-400 text-xs whitespace-nowrap">
            <Text className="text-gray-500">
              <span data-testid="product-quantity">{item.quantity}</span>×
            </Text>
            <LineItemUnitPrice
              item={item}
              style="tight"
              currencyCode={currencyCode}
            />
          </span>
          <LineItemPrice
            item={item}
            style="tight"
            currencyCode={currencyCode}
          />
        </span>
      </Table.Cell>
    </Table.Row>
  )
}

export default Item
