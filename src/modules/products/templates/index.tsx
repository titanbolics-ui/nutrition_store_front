import React, { Suspense } from "react"

import ImageGallery from "@modules/products/components/image-gallery"
import ProductActions from "@modules/products/components/product-actions"
import ProductBreadcrumb from "@modules/products/components/product-breadcrumb"
import ProductInfoAccordions from "@modules/products/components/product-info-accordions"
import ProductOnboardingCta from "@modules/products/components/product-onboarding-cta"
import ProductSideEffects from "@modules/products/components/product-side-effects"
import ProductContent from "@modules/products/components/product-content"
import RelatedProducts from "@modules/products/components/related-products"
import ProductInfo from "@modules/products/templates/product-info"
import SkeletonRelatedProducts from "@modules/skeletons/templates/skeleton-related-products"
import { notFound } from "next/navigation"
import { HttpTypes } from "@medusajs/types"
import FadeInSection from "@modules/products/components/fade-in-section"

import ProductActionsWrapper from "./product-actions-wrapper"

type ProductTemplateProps = {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
  countryCode: string
  images: HttpTypes.StoreProductImage[]
}

/**
 * Above the fold: breadcrumb, then gallery (left) + info column (right) in
 * the order title → subtitle → description → price → variant chips →
 * stock/CTA → shipping & specs accordions. Details (tabs, FAQ, blocks,
 * related) stay below.
 */
const ProductTemplate: React.FC<ProductTemplateProps> = ({
  product,
  region,
  countryCode,
  images,
}) => {
  if (!product || !product.id) {
    return notFound()
  }

  return (
    <>
      <div
        className="content-container flex flex-col pt-4 pb-6 relative"
        data-testid="product-container"
      >
        <ProductBreadcrumb product={product} />

        <div className="flex flex-col small:flex-row small:items-start gap-8 mt-4">
          <div className="w-full small:flex-1 min-w-0">
            <ImageGallery images={images} />
          </div>

          <div className="flex w-full flex-col gap-y-6 small:sticky small:top-48 small:max-w-[440px]">
            <ProductInfo product={product} />
            <ProductOnboardingCta />
            <Suspense
              fallback={
                <ProductActions
                  disabled={true}
                  product={product}
                  region={region}
                />
              }
            >
              <ProductActionsWrapper id={product.id} region={region} />
            </Suspense>
            <ProductInfoAccordions product={product} />
          </div>
        </div>
      </div>
      <FadeInSection>
        <ProductSideEffects product={product} />
      </FadeInSection>
      <FadeInSection>
        <ProductContent product={product} />
      </FadeInSection>
      <div
        className="content-container my-16 small:my-32"
        data-testid="related-products-container"
      >
        <Suspense fallback={<SkeletonRelatedProducts />}>
          <RelatedProducts product={product} countryCode={countryCode} />
        </Suspense>
      </div>
      <div
        className="lg:hidden h-[calc(200px+env(safe-area-inset-bottom))]"
        aria-hidden="true"
        data-testid="mobile-actions-spacer"
      />
    </>
  )
}

export default ProductTemplate
