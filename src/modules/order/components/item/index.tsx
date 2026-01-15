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
    <Table.Row className="w-full border-b border-gray-700/30 last:border-0" data-testid="product-row">
      <Table.Cell className="py-2 sm:py-4 pl-2 sm:pl-4 pr-2 w-14 sm:w-24 align-top sm:align-middle">
        <div className="flex w-10 h-10 sm:w-16 sm:h-16 aspect-square rounded-md overflow-hidden bg-gray-800">
          <Thumbnail thumbnail={item.thumbnail} size="square" />
        </div>
      </Table.Cell>

      <Table.Cell className="text-left py-2 sm:py-4 px-0 align-top sm:align-middle">
        <div className="flex flex-col gap-y-1 pr-2">
          <Text
            className="txt-medium-plus text-white font-semibold text-xs sm:text-base leading-tight"
            data-testid="product-name"
          >
            {item.product_title}
          </Text>
          <LineItemOptions variant={item.variant} data-testid="product-variant" />
        </div>
      </Table.Cell>

      <Table.Cell className="py-2 sm:py-4 pr-2 sm:pr-4 pl-0 text-right w-20 sm:w-auto align-top sm:align-middle">
        <span className="flex flex-col items-end justify-start sm:justify-center gap-y-0.5 sm:gap-y-1">
          <span className="flex gap-x-1 text-gray-400 text-[10px] sm:text-sm">
            <Text className="text-gray-500">
              <span data-testid="product-quantity">{item.quantity}</span>x{" "}
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
