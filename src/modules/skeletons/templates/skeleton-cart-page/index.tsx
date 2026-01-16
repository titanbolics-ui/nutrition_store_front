import { Table } from "@medusajs/ui"

import repeat from "@lib/util/repeat"
import SkeletonCartItem from "@modules/skeletons/components/skeleton-cart-item"
import SkeletonOrderSummary from "@modules/skeletons/components/skeleton-order-summary"

const SkeletonCartPage = () => {
  return (
    <div className="py-12">
      <div className="content-container">
        <div className="grid grid-cols-1 small:grid-cols-[1fr_360px] gap-x-40">
          {/* Left Column - Cart Items */}
          <div className="flex flex-col bg-black py-6 gap-y-6">
            {/* Sign In Prompt Skeleton */}
            <div className="bg-gray-900 rounded-lg p-6 flex items-center justify-between border border-gray-800">
              <div className="flex flex-col gap-y-2">
                <div className="w-48 h-5 bg-gray-800 animate-pulse rounded" />
                <div className="w-64 h-4 bg-gray-800 animate-pulse rounded" />
              </div>
              <div className="w-24 h-10 bg-gray-800 animate-pulse rounded" />
            </div>
            
            {/* Divider */}
            <div className="h-px w-full bg-gray-800" />
            
            {/* Cart Header */}
            <div className="pb-3 flex items-center">
              <div className="w-20 h-8 bg-gray-800 animate-pulse rounded" />
            </div>

            {/* Cart Table */}
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
                    <Table.HeaderCell className="text-right">
                      Total
                    </Table.HeaderCell>
                  </Table.Row>
                </Table.Header>
                <Table.Body className="[&_tr]:border-gray-800 [&_tr:last-child]:border-0">
                  {repeat(3).map((index) => (
                    <SkeletonCartItem key={index} />
                  ))}
                </Table.Body>
              </Table>
            </div>
          </div>

          {/* Right Column - Summary */}
          <div className="relative">
            <div className="flex flex-col gap-y-8 sticky top-12">
              <div className="bg-gray-900 border border-gray-800 rounded-xl py-6 px-6">
                <SkeletonOrderSummary />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SkeletonCartPage
