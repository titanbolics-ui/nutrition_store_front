"use client"

import { Table, Text, clx } from "@medusajs/ui"
import { updateLineItem } from "@lib/data/cart"
import { HttpTypes } from "@medusajs/types"
import CartItemSelect from "@modules/cart/components/cart-item-select"
import ErrorMessage from "@modules/checkout/components/error-message"
import DeleteButton from "@modules/common/components/delete-button"
import LineItemOptions from "@modules/common/components/line-item-options"
import LineItemPrice from "@modules/common/components/line-item-price"
import LineItemUnitPrice from "@modules/common/components/line-item-unit-price"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Spinner from "@modules/common/icons/spinner"
import Thumbnail from "@modules/products/components/thumbnail"
import { useState } from "react"

type ItemProps = {
  item: HttpTypes.StoreCartLineItem
  type?: "full" | "preview"
  currencyCode: string
}

const Item = ({ item, type = "full", currencyCode }: ItemProps) => {
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const changeQuantity = async (quantity: number) => {
    setError(null)
    setUpdating(true)

    await updateLineItem({
      lineId: item.id,
      quantity,
    })
      .catch((err) => {
        setError(err.message)
      })
      .finally(() => {
        setUpdating(false)
      })
  }

  // TODO: Update this to grab the actual max inventory
  const maxQtyFromInventory = 10
  const maxQuantity = item.variant?.manage_inventory ? 10 : maxQtyFromInventory

  return (
    <Table.Row
      className={clx("w-full", {
        "border-b border-gray-700/30 last:border-0": type === "preview",
      })}
      data-testid="product-row"
    >
      <Table.Cell
        className={clx({
          "!p-2 w-auto align-middle": type === "preview",
          "py-2 px-1 sm:px-2 w-16 sm:w-20": type === "full",
        })}
      >
        <LocalizedClientLink
          href={`/products/${item.product_handle}`}
          className={clx("flex flex-shrink-0", {
            "w-16 h-16 rounded-lg overflow-hidden bg-zinc-900 ring-1 ring-white/5":
              type === "preview",
            "w-14 h-14 sm:w-16 sm:h-16 rounded-md overflow-hidden bg-gray-800":
              type === "full",
          })}
        >
          <Thumbnail
            thumbnail={item.thumbnail}
            images={item.variant?.product?.images}
            size="square"
          />
        </LocalizedClientLink>
      </Table.Cell>

      <Table.Cell
        className={clx("text-left", {
          "!py-2 !px-2 align-middle": type === "preview",
        })}
      >
        <div className="flex flex-col gap-y-0.5 min-w-0">
          <Text
            className={clx("txt-medium-plus text-white break-words", {
              "font-medium text-sm leading-snug":
                type === "preview",
              "text-sm sm:text-base": type === "full",
            })}
            data-testid="product-title"
          >
            {item.product_title}
          </Text>
          <LineItemOptions
            variant={item.variant}
            data-testid="product-variant"
          />
        </div>
      </Table.Cell>

      {type === "full" && (
        <Table.Cell className="whitespace-nowrap">
          <div className="flex gap-1 sm:gap-2 items-center">
            <DeleteButton id={item.id} data-testid="product-delete-button" />
            <CartItemSelect
              value={item.quantity}
              onChange={(value) => changeQuantity(parseInt(value.target.value))}
              className="w-12 sm:w-14 h-8 sm:h-10 p-2 sm:p-4"
              data-testid="product-select-button"
            >
              {/* TODO: Update this with the v2 way of managing inventory */}
              {Array.from(
                {
                  length: Math.min(maxQuantity, 10),
                },
                (_, i) => (
                  <option
                    value={i + 1}
                    key={i}
                    className="bg-gray-800 text-white"
                  >
                    {i + 1}
                  </option>
                )
              )}
            </CartItemSelect>
            {updating && <Spinner />}
          </div>
          <ErrorMessage error={error} data-testid="product-error-message" />
        </Table.Cell>
      )}

      {type === "full" && (
        <Table.Cell className="hidden small:table-cell">
          <LineItemUnitPrice
            item={item}
            style="tight"
            currencyCode={currencyCode}
          />
        </Table.Cell>
      )}

      <Table.Cell
        className={clx("text-right", {
          "!p-2 w-auto align-middle": type === "preview",
        })}
      >
        <span
          className={clx({
            "flex flex-col items-end justify-center gap-y-0.5":
              type === "preview",
          })}
        >
          {type === "preview" && (
            <span className="flex gap-x-1 items-baseline text-gray-400 text-xs whitespace-nowrap">
              <span className="text-gray-500">{item.quantity}×</span>
              <LineItemUnitPrice
                item={item}
                style="tight"
                currencyCode={currencyCode}
              />
            </span>
          )}
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
