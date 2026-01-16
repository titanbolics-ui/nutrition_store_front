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
      <Accordion type="multiple" defaultValue={["Specifications"]}>
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
        {/* Терміни доставки - Dark Tech Style */}
        <div className="flex items-start gap-x-3 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
          <FastDelivery className="text-[#ccff00] flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-[#ccff00] text-base">
              Delivery Time
            </span>
            <p className="max-w-sm text-white font-medium mt-1">
              10-12 business days after dispatch
            </p>
            <p className="max-w-sm text-gray-400 text-xs mt-1">
              International shipping with reliable tracking
            </p>
          </div>
        </div>
        
        <div className="flex items-start gap-x-3">
          <FastDelivery className="text-gray-400 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-white">Discreet Shipping</span>
            <p className="max-w-sm text-gray-400">
              Your package will be packed discreetly with no indication of
              content. We ensure 100% privacy and secure delivery.
            </p>
          </div>
        </div>
        <div className="flex items-start gap-x-3">
          <Refresh className="text-gray-400 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-white">Refund Policy</span>
            <p className="max-w-sm text-gray-400">
              In the unlikely event of customs issues, we offer a full refund
              policy. Contact support for details.
            </p>
          </div>
        </div>
        <div className="flex items-start gap-x-3">
          <Back className="text-gray-400 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-white">Tracking Number</span>
            <p className="max-w-sm text-gray-400">
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
