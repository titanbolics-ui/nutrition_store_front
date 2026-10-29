import { HttpTypes } from "@medusajs/types"

import CategoryMenu from "../category-menu"

type RefinementListProps = {
  categories?: HttpTypes.StoreProductCategory[]
  "data-testid"?: string
}

// Desktop-only sidebar. Navigation (categories) lives here; refinements
// (brand, stock, sort) live in CatalogToolbar above the product grid.
const RefinementList = ({
  categories,
  "data-testid": dataTestId,
}: RefinementListProps) => {
  return (
    <div
      className="hidden md:flex md:flex-col gap-12 py-4 mb-8 md:px-0 md:min-w-[250px] md:ml-[1.675rem]"
      data-testid={dataTestId}
    >
      {categories && categories.length > 0 && (
        <CategoryMenu categories={categories} />
      )}
    </div>
  )
}

export default RefinementList
