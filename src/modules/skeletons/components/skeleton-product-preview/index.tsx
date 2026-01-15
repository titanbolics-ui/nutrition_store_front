import { Container } from "@medusajs/ui"

const SkeletonProductPreview = () => {
  return (
    <div className="h-full bg-[#111111] border border-gray-800 rounded-lg md:rounded-xl overflow-hidden flex flex-col animate-pulse">
      {/* IMAGE CONTAINER */}
      <div className="relative p-2 sm:p-4 md:p-6 bg-white/5 border-b border-gray-800 aspect-square flex items-center justify-center">
        <div className="w-full h-full bg-gray-800/50 rounded-lg" />
      </div>

      {/* INFO CONTAINER */}
      <div className="p-3 sm:p-4 md:p-5 flex flex-col flex-grow justify-between gap-2 sm:gap-3 md:gap-4 bg-[#111111]">
        <div>
          {/* Collection Name */}
          <div className="h-2 sm:h-3 w-1/3 bg-gray-800 rounded mb-1 sm:mb-2" />
          {/* Product Title */}
          <div className="h-4 sm:h-5 md:h-6 w-3/4 bg-gray-700 rounded" />
        </div>

        <div className="flex items-center justify-between border-t border-gray-800 pt-2 sm:pt-3 md:pt-4 mt-auto">
          {/* Price */}
          <div className="h-4 sm:h-5 md:h-6 w-1/4 bg-gray-700 rounded" />
          {/* Button Circle */}
          <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-full bg-gray-800" />
        </div>
      </div>
    </div>
  )
}

export default SkeletonProductPreview
