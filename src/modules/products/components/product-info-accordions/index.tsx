"use client"

import Back from "@modules/common/icons/back"
import FastDelivery from "@modules/common/icons/fast-delivery"
import Refresh from "@modules/common/icons/refresh"

import Accordion from "../product-tabs/accordion"
import { HttpTypes } from "@medusajs/types"
import ProductSpecs, { hasAvailableSpecs } from "../product-specs"

type ProductInfoAccordionsProps = {
  product: HttpTypes.StoreProduct
}

/**
 * The quiet accordions that live in the info column right under the buy
 * block: Shipping & Delivery always, Specifications when the product has
 * spec metadata. Content is force-mounted so it lands in the initial HTML
 * (search/AI readable) even while collapsed.
 */
const ProductInfoAccordions = ({ product }: ProductInfoAccordionsProps) => {
  const sections = [
    {
      label: "Shipping & Delivery",
      component: <ShippingInfo />,
    },
  ]

  if (hasAvailableSpecs(product)) {
    sections.push({
      label: "Specifications",
      component: (
        <div className="text-small-regular py-4">
          <ProductSpecs product={product} />
        </div>
      ),
    })
  }

  return (
    <div className="w-full" data-testid="product-info-accordions">
      <Accordion type="multiple">
        {sections.map((section) => (
          <Accordion.Item
            key={section.label}
            title={section.label}
            headingSize="medium"
            value={section.label}
            forceMountContent
          >
            {section.component}
          </Accordion.Item>
        ))}
      </Accordion>
    </div>
  )
}

const ShippingInfo = () => {
  return (
    <div className="text-small-regular py-4">
      <div className="grid grid-cols-1 gap-y-6">
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

export default ProductInfoAccordions
