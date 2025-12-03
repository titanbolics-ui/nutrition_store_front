"use client"

import Back from "@modules/common/icons/back"
import FastDelivery from "@modules/common/icons/fast-delivery"
import Refresh from "@modules/common/icons/refresh" // Можна замінити на іконку щита (Shield), якщо є

import Accordion from "./accordion"
import { HttpTypes } from "@medusajs/types"
import ProductSpecs from "../product-specs"

type ProductTabsProps = {
  product: HttpTypes.StoreProduct
}

const ProductTabs = ({ product }: ProductTabsProps) => {
  const tabs = [
    {
      label: "Specifications",
      component: <ProductInfoTab product={product} />,
    },
    {
      label: "Shipping & Delivery",
      component: <ShippingInfoTab />,
    },
  ]

  return (
    <div className="w-full">
      <Accordion type="multiple">
        {tabs.map((tab, i) => (
          <Accordion.Item
            key={i}
            title={tab.label}
            headingSize="medium"
            value={tab.label}
          >
            {tab.component}
          </Accordion.Item>
        ))}
      </Accordion>
    </div>
  )
}

const ProductInfoTab = ({ product }: ProductTabsProps) => {
  return (
    <div className="text-small-regular py-8">
      <ProductSpecs product={product} />
    </div>
  )
}

const ShippingInfoTab = () => {
  return (
    <div className="text-small-regular py-8">
      <div className="grid grid-cols-1 gap-y-8">
        <div className="flex items-start gap-x-2">
          <FastDelivery />
          <div>
            <span className="font-semibold">Discreet Shipping</span>
            <p className="max-w-sm text-ui-fg-subtle">
              Your package will be packed discreetly with no indication of
              content. We ensure 100% privacy and secure delivery.
            </p>
          </div>
        </div>
        <div className="flex items-start gap-x-2">
          <Refresh />
          <div>
            <span className="font-semibold">Refund Policy</span>
            <p className="max-w-sm text-ui-fg-subtle">
              In the unlikely event of customs issues, we offer a full refund
              policy. Contact support for details.
            </p>
          </div>
        </div>
        <div className="flex items-start gap-x-2">
          <Back />
          <div>
            <span className="font-semibold">Tracking Number</span>
            <p className="max-w-sm text-ui-fg-subtle">
              Tracking code provided within 24-48 hours after payment
              confirmation.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductTabs
