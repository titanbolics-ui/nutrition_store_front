import { Table } from "@medusajs/ui"

const SkeletonCartItem = () => {
  return (
    <Table.Row className="w-full border-gray-800">
      {/* Thumbnail */}
      <Table.Cell className="py-2 px-1 sm:px-2 w-16 sm:w-20">
        <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gray-800 rounded-lg animate-pulse" />
      </Table.Cell>
      
      {/* Product Info */}
      <Table.Cell className="text-left py-2">
        <div className="flex flex-col gap-y-1.5 min-w-0">
          <div className="w-24 sm:w-40 h-4 bg-gray-800 animate-pulse rounded" />
          <div className="w-16 sm:w-24 h-3 bg-gray-800 animate-pulse rounded" />
        </div>
      </Table.Cell>
      
      {/* Quantity */}
      <Table.Cell className="py-2 whitespace-nowrap">
        <div className="flex items-center gap-1 sm:gap-2">
          <div className="w-5 sm:w-6 h-5 sm:h-6 bg-gray-800 animate-pulse rounded" />
          <div className="w-12 sm:w-14 h-8 sm:h-10 bg-gray-800 animate-pulse rounded" />
        </div>
      </Table.Cell>
      
      {/* Unit Price - Hidden on mobile */}
      <Table.Cell className="hidden small:table-cell py-2">
        <div className="w-16 h-4 bg-gray-800 animate-pulse rounded" />
      </Table.Cell>
      
      {/* Total */}
      <Table.Cell className="text-right py-2">
        <div className="flex justify-end">
          <div className="w-16 h-4 bg-gray-800 animate-pulse rounded" />
        </div>
      </Table.Cell>
    </Table.Row>
  )
}

export default SkeletonCartItem
