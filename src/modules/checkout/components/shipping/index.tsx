"use client"

import { Radio, RadioGroup } from "@headlessui/react"
import { setShippingMethod } from "@lib/data/cart"
import { calculatePriceForShippingOption } from "@lib/data/fulfillment"
import {
  trackCheckoutStepCompleted,
  trackShippingMethodSelected,
} from "@lib/posthog/checkout-tracking"
import { convertToLocale } from "@lib/util/money"
import { CheckCircleSolid, Loader } from "@medusajs/icons"
import { HttpTypes } from "@medusajs/types"
import { Button, clx, Heading, Text } from "@medusajs/ui"
import ErrorMessage from "@modules/checkout/components/error-message"
import Divider from "@modules/common/components/divider"
import MedusaRadio from "@modules/common/components/radio"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"

type WarehouseItemsMetadata = Record<
  string,
  { locationName: string; items: { title: string; quantity: number }[] }
>

type ShippingOptionWithLocation = HttpTypes.StoreCartShippingOption & {
  service_zone?: {
    fulfillment_set?: {
      type?: string
      location?: { id: string; name: string }
    }
  }
}

type WarehouseGroup = {
  locationId: string
  locationName: string
  options: ShippingOptionWithLocation[]
}

function groupByWarehouse(
  options: ShippingOptionWithLocation[]
): WarehouseGroup[] {
  const map = new Map<string, WarehouseGroup>()
  for (const option of options) {
    const locationId =
      option.service_zone?.fulfillment_set?.location?.id ?? "default"
    const locationName =
      option.service_zone?.fulfillment_set?.location?.name ?? "Warehouse"
    if (!map.has(locationId)) {
      map.set(locationId, { locationId, locationName, options: [] })
    }
    map.get(locationId)!.options.push(option)
  }
  return Array.from(map.values())
}

function formatAddress(address: HttpTypes.StoreCartAddress) {
  if (!address) return ""
  let ret = ""
  if (address.address_1) ret += ` ${address.address_1}`
  if (address.address_2) ret += `, ${address.address_2}`
  if (address.postal_code) ret += `, ${address.postal_code} ${address.city}`
  if (address.country_code) ret += `, ${address.country_code.toUpperCase()}`
  return ret
}

type ShippingProps = {
  cart: HttpTypes.StoreCart
  availableShippingMethods: HttpTypes.StoreCartShippingOption[] | null
  warehouseItems?: WarehouseItemsMetadata
}

const COMBINED_KEY = "combined"
const COMBINED_OPTION_NAME = "Ships from 2 Locations"

const Shipping: React.FC<ShippingProps> = ({
  cart,
  availableShippingMethods,
  warehouseItems = {},
}) => {
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingPrices, setIsLoadingPrices] = useState(true)
  const [calculatedPricesMap, setCalculatedPricesMap] = useState<
    Record<string, number>
  >({})
  const [error, setError] = useState<string | null>(null)

  const [selectedByLocation, setSelectedByLocation] = useState<
    Record<string, string>
  >(() => {
    const initial: Record<string, string> = {}
    for (const method of cart.shipping_methods ?? []) {
      const option = availableShippingMethods?.find(
        (o) => o.id === method.shipping_option_id
      ) as ShippingOptionWithLocation | undefined
      if (option) {
        const isCombined = option.name === COMBINED_OPTION_NAME
        const locationId = isCombined
          ? COMBINED_KEY
          : (option.service_zone?.fulfillment_set?.location?.id ?? "default")
        initial[locationId] = method.shipping_option_id!
      }
    }
    return initial
  })

  const [showPickupOptions, setShowPickupOptions] = useState(false)

  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const isOpen = searchParams.get("step") === "delivery"

  const allOptions = availableShippingMethods as ShippingOptionWithLocation[] | null
  const pickupOptions = allOptions?.filter(
    (sm) => sm.service_zone?.fulfillment_set?.type === "pickup"
  )
  const shippingOptions = allOptions?.filter(
    (sm) => sm.service_zone?.fulfillment_set?.type !== "pickup"
  )

  const combinedOption = shippingOptions?.find(
    (o) => o.name === COMBINED_OPTION_NAME
  )
  const singleWarehouseOptions = shippingOptions?.filter(
    (o) => o.name !== COMBINED_OPTION_NAME
  )

  const activeLocationIds = Object.keys(warehouseItems)
  const hasMultipleActiveWarehouses = activeLocationIds.length > 1

  const allWarehouseGroups = groupByWarehouse(singleWarehouseOptions ?? [])
  const warehouseGroupsToShow: WarehouseGroup[] =
    activeLocationIds.length > 0
      ? allWarehouseGroups.filter((g) => activeLocationIds.includes(g.locationId))
      : allWarehouseGroups

  const hasPickupOptions = !!pickupOptions?.length

  const allSelected = showPickupOptions
    ? !!selectedByLocation["pickup"]
    : hasMultipleActiveWarehouses
    ? !!selectedByLocation[COMBINED_KEY]
    : warehouseGroupsToShow.length === 0 ||
      warehouseGroupsToShow.every((g) => !!selectedByLocation[g.locationId])

  // Auto-select when there is only one option (or combined option for multi-warehouse)
  useEffect(() => {
    if (!shippingOptions?.length) return
    if (hasMultipleActiveWarehouses) {
      if (combinedOption && !selectedByLocation[COMBINED_KEY]) {
        handleSetShippingMethod(combinedOption.id, COMBINED_KEY, "shipping")
      }
    } else {
      for (const group of warehouseGroupsToShow) {
        if (group.options.length === 1 && !selectedByLocation[group.locationId]) {
          handleSetShippingMethod(
            group.options[0].id,
            group.locationId,
            "shipping"
          )
          break
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasMultipleActiveWarehouses, shippingOptions?.length])

  useEffect(() => {
    setIsLoadingPrices(true)
    const calculatedOptions = shippingOptions?.filter(
      (sm) => sm.price_type === "calculated"
    )
    if (calculatedOptions?.length) {
      Promise.allSettled(
        calculatedOptions.map((sm) =>
          calculatePriceForShippingOption(sm.id, cart.id)
        )
      ).then((results) => {
        const pricesMap: Record<string, number> = {}
        results
          .filter((r) => r.status === "fulfilled")
          .forEach(
            (p) => (pricesMap[p.value?.id || ""] = p.value?.amount ?? 0)
          )
        setCalculatedPricesMap(pricesMap)
        setIsLoadingPrices(false)
      })
    } else {
      setIsLoadingPrices(false)
    }
  }, [availableShippingMethods])

  useEffect(() => {
    setError(null)
  }, [isOpen])

  const handleEdit = () => {
    router.push(pathname + "?step=delivery", { scroll: false })
  }

  const handleSubmit = () => {
    trackCheckoutStepCompleted("shipping", cart.id)
    router.push(pathname + "?step=payment", { scroll: false })
  }

  const handleSetShippingMethod = async (
    optionId: string,
    locationId: string,
    variant: "shipping" | "pickup"
  ) => {
    setError(null)
    if (variant === "pickup") setShowPickupOptions(true)
    else setShowPickupOptions(false)

    setIsLoading(true)
    setSelectedByLocation((prev) => ({ ...prev, [locationId]: optionId }))

    await setShippingMethod({ cartId: cart.id, shippingMethodId: optionId })
      .then(() => {
        const selectedMethod = availableShippingMethods?.find(
          (m) => m.id === optionId
        )
        if (selectedMethod) {
          const amount =
            selectedMethod.price_type === "flat"
              ? selectedMethod.amount!
              : calculatedPricesMap[optionId] || 0
          trackShippingMethodSelected(
            cart.id,
            optionId,
            selectedMethod.name,
            amount,
            cart.currency_code || "USD"
          )
        }
      })
      .catch((err) => {
        setSelectedByLocation((prev) => {
          const next = { ...prev }
          delete next[locationId]
          return next
        })
        setError(err.message)
      })
      .finally(() => setIsLoading(false))
  }

  const renderOptionPrice = (option: ShippingOptionWithLocation) => {
    if (option.price_type === "flat") {
      return convertToLocale({
        amount: option.amount!,
        currency_code: cart?.currency_code,
      })
    }
    if (calculatedPricesMap[option.id]) {
      return convertToLocale({
        amount: calculatedPricesMap[option.id],
        currency_code: cart?.currency_code,
      })
    }
    return isLoadingPrices ? <Loader className="text-white" /> : "-"
  }

  return (
    <div className="bg-black">
      <div className="flex flex-row items-center justify-between mb-6">
        <Heading
          level="h2"
          className={clx(
            "flex flex-row text-3xl-regular gap-x-2 items-baseline text-white",
            {
              "opacity-50 pointer-events-none select-none":
                !isOpen && (cart.shipping_methods?.length ?? 0) === 0,
            }
          )}
        >
          Delivery
          {!isOpen && (cart.shipping_methods?.length ?? 0) > 0 && (
            <CheckCircleSolid className="text-[#b8ff2b]" />
          )}
        </Heading>
        {!isOpen &&
          cart?.shipping_address &&
          cart?.billing_address &&
          cart?.email && (
            <Text>
              <button
                onClick={handleEdit}
                className="text-[#b8ff2b] hover:text-[#b8ff2b]/80 transition-colors"
                data-testid="edit-delivery-button"
              >
                Edit
              </button>
            </Text>
          )}
      </div>

      {isOpen ? (
        <>
          <div data-testid="delivery-options-container">
            {/* Pickup toggle */}
            {hasPickupOptions && (
              <div className="mb-6">
                <RadioGroup
                  value={showPickupOptions ? "pickup" : "shipping"}
                  onChange={(value) => {
                    if (value === "pickup") {
                      const id = pickupOptions?.find(
                        (o) => !o.insufficient_inventory
                      )?.id
                      if (id) handleSetShippingMethod(id, "pickup", "pickup")
                    }
                  }}
                >
                  <Radio
                    value="pickup"
                    data-testid="delivery-option-radio"
                    className={clx(
                      "flex items-center justify-between text-small-regular cursor-pointer py-4 border rounded-xl px-8 mb-2 transition-all duration-200",
                      {
                        "border-[#b8ff2b] bg-gray-800": showPickupOptions,
                        "border-gray-700 bg-gray-900 hover:border-gray-500":
                          !showPickupOptions,
                      }
                    )}
                  >
                    <div className="flex items-center gap-x-4">
                      <MedusaRadio checked={showPickupOptions} />
                      <span className="text-base-regular text-white">
                        Pick up your order
                      </span>
                    </div>
                    <span className="justify-self-end text-white">-</span>
                  </Radio>
                </RadioGroup>
              </div>
            )}

            {/* Multi-warehouse: combined option only */}
            {hasMultipleActiveWarehouses ? (
              <div>
                <div className="mb-4 p-4 border border-amber-800/40 rounded-xl bg-amber-950/20">
                  <p className="text-sm text-amber-300 font-medium mb-1">
                    Your order ships from 2 locations
                  </p>
                  <p className="text-sm text-gray-400 mb-3">
                    Items in your cart come from{" "}
                    <span className="text-white">
                      {Object.values(warehouseItems)
                        .map((w) => w.locationName)
                        .join(" and ")}
                    </span>
                    . The shipping cost covers both shipments.
                  </p>
                  <p className="text-xs text-gray-500">
                    Want to reduce shipping costs?{" "}
                    <a
                      href="/us/cart"
                      className="text-[#b8ff2b] hover:underline"
                    >
                      Edit your cart
                    </a>{" "}
                    to keep items from one location only.
                  </p>
                </div>

                {combinedOption ? (
                  <RadioGroup
                    value={selectedByLocation[COMBINED_KEY] ?? null}
                    onChange={(v) => {
                      if (v)
                        handleSetShippingMethod(v, COMBINED_KEY, "shipping")
                    }}
                  >
                    <Radio
                      value={combinedOption.id}
                      data-testid="delivery-option-radio"
                      className={clx(
                        "flex items-center justify-between text-small-regular cursor-pointer py-4 border rounded-xl px-8 mb-2 transition-all duration-200",
                        {
                          "border-[#b8ff2b] bg-gray-800":
                            selectedByLocation[COMBINED_KEY] ===
                            combinedOption.id,
                          "border-gray-700 bg-gray-900 hover:border-gray-500":
                            selectedByLocation[COMBINED_KEY] !==
                            combinedOption.id,
                        }
                      )}
                    >
                      <div className="flex items-center gap-x-4">
                        <MedusaRadio
                          checked={
                            selectedByLocation[COMBINED_KEY] ===
                            combinedOption.id
                          }
                        />
                        <div className="flex flex-col">
                          <span className="text-base-regular text-white">
                            {combinedOption.name}
                          </span>
                          <span className="text-xs text-gray-500 mt-0.5">
                            {Object.values(warehouseItems)
                              .map((w) => w.locationName)
                              .join(" + ")}
                          </span>
                        </div>
                      </div>
                      <span className="justify-self-end text-white font-semibold">
                        {renderOptionPrice(combinedOption)}
                      </span>
                    </Radio>
                  </RadioGroup>
                ) : (
                  <p className="text-sm text-gray-500 py-4">
                    No combined shipping option available. Please contact support.
                  </p>
                )}
              </div>
            ) : (
              /* Single-warehouse: show only the relevant warehouse options */
              warehouseGroupsToShow.map((group) => (
                <div key={group.locationId} className="mb-6">
                  <RadioGroup
                    value={selectedByLocation[group.locationId] ?? null}
                    onChange={(v) => {
                      if (v)
                        handleSetShippingMethod(
                          v,
                          group.locationId,
                          "shipping"
                        )
                    }}
                  >
                    {group.options.map((option) => {
                      const isDisabled =
                        option.price_type === "calculated" &&
                        !isLoadingPrices &&
                        typeof calculatedPricesMap[option.id] !== "number"

                      return (
                        <Radio
                          key={option.id}
                          value={option.id}
                          data-testid="delivery-option-radio"
                          disabled={isDisabled}
                          className={clx(
                            "flex items-center justify-between text-small-regular cursor-pointer py-4 border rounded-xl px-8 mb-2 transition-all duration-200",
                            {
                              "border-[#b8ff2b] bg-gray-800":
                                selectedByLocation[group.locationId] ===
                                option.id,
                              "border-gray-700 bg-gray-900 hover:border-gray-500":
                                selectedByLocation[group.locationId] !==
                                option.id,
                              "hover:shadow-none cursor-not-allowed opacity-50":
                                isDisabled,
                            }
                          )}
                        >
                          <div className="flex items-center gap-x-4">
                            <MedusaRadio
                              checked={
                                selectedByLocation[group.locationId] ===
                                option.id
                              }
                            />
                            <span className="text-base-regular text-white">
                              {option.name}
                            </span>
                          </div>
                          <span className="justify-self-end text-white font-semibold">
                            {renderOptionPrice(option)}
                          </span>
                        </Radio>
                      )
                    })}
                  </RadioGroup>
                </div>
              ))
            )}

            {/* Pickup location selector */}
            {showPickupOptions && (
              <div className="mt-4">
                <div className="flex flex-col mb-3">
                  <span className="font-medium txt-medium text-white">
                    Store
                  </span>
                  <span className="text-gray-400 txt-medium">
                    Choose a store near you
                  </span>
                </div>
                <RadioGroup
                  value={selectedByLocation["pickup"] ?? null}
                  onChange={(v) => {
                    if (v) handleSetShippingMethod(v, "pickup", "pickup")
                  }}
                >
                  {pickupOptions?.map((option) => (
                    <Radio
                      key={option.id}
                      value={option.id}
                      disabled={option.insufficient_inventory}
                      data-testid="delivery-option-radio"
                      className={clx(
                        "flex items-center justify-between text-small-regular cursor-pointer py-4 border rounded-xl px-8 mb-2 transition-all duration-200",
                        {
                          "border-[#b8ff2b] bg-gray-800":
                            selectedByLocation["pickup"] === option.id,
                          "border-gray-700 bg-gray-900 hover:border-gray-500":
                            selectedByLocation["pickup"] !== option.id,
                          "hover:shadow-none cursor-not-allowed opacity-50":
                            option.insufficient_inventory,
                        }
                      )}
                    >
                      <div className="flex items-start gap-x-4">
                        <MedusaRadio
                          checked={selectedByLocation["pickup"] === option.id}
                        />
                        <div className="flex flex-col">
                          <span className="text-base-regular text-white">
                            {option.name}
                          </span>
                          <span className="text-base-regular text-gray-400">
                            {formatAddress(
                              (option as any).service_zone?.fulfillment_set
                                ?.location?.address
                            )}
                          </span>
                        </div>
                      </div>
                      <span className="justify-self-end text-white">
                        {convertToLocale({
                          amount: option.amount!,
                          currency_code: cart?.currency_code,
                        })}
                      </span>
                    </Radio>
                  ))}
                </RadioGroup>
              </div>
            )}
          </div>

          <div className="mt-6">
            <ErrorMessage
              error={error}
              data-testid="delivery-option-error-message"
            />
            <Button
              size="large"
              className="mt bg-[#b8ff2b] text-black hover:bg-[#b8ff2b]/80"
              onClick={handleSubmit}
              isLoading={isLoading}
              disabled={!allSelected && !showPickupOptions}
              data-testid="submit-delivery-option-button"
            >
              Continue to payment
            </Button>
          </div>
        </>
      ) : (
        <div>
          <div className="text-small-regular">
            {cart && (cart.shipping_methods?.length ?? 0) > 0 && (
              <div className="flex flex-col gap-y-2 w-1/2">
                <Text className="txt-medium-plus text-white mb-1">Method</Text>
                {cart.shipping_methods!.map((method) => (
                  <Text key={method.id} className="txt-medium text-gray-400">
                    {method.name}{" "}
                    {convertToLocale({
                      amount: method.amount!,
                      currency_code: cart.currency_code,
                    })}
                  </Text>
                ))}
                {hasMultipleActiveWarehouses && (
                  <Text className="text-xs text-amber-400/80 mt-1">
                    Covers shipments from{" "}
                    {Object.values(warehouseItems)
                      .map((w) => w.locationName)
                      .join(" + ")}
                  </Text>
                )}
              </div>
            )}
          </div>
        </div>
      )}
      <Divider className="mt-8 border-gray-800" />
    </div>
  )
}

export default Shipping
