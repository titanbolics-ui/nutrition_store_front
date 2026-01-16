import { Metadata } from "next"

import FeaturedProducts from "@modules/home/components/featured-products"
import Hero from "@modules/home/components/hero"
import HorizontalScrollSection from "@modules/home/components/horizontal-scroll-section"
import { listCollections } from "@lib/data/collections"
import { getRegion, listRegions } from "@lib/data/regions"
import LabResults from "@modules/home/components/lab-tested-section"

export const metadata: Metadata = {
  title: "Onyx Genetics",
  description: "Premium genetics and breeding solutions.",
}

export default async function Home(props: {
  params: Promise<{ countryCode: string }>
}) {
  const params = await props.params

  const { countryCode } = params

  const region = await getRegion(countryCode)

  const { collections } = await listCollections({
    fields: "id, handle, title",
  })

  return (
    <>
      <Hero />
      <HorizontalScrollSection />
      <LabResults />

      {/* FEATURED PRODUCTS SECTION - DARK MODE */}
      <div className="relative py-24 bg-[#0a0a0a] min-h-screen">
        {/* Grid Texture Background */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)`,
            backgroundSize: "4rem 4rem",
          }}
        />

        {/* Content */}
        <div className="relative z-10">
          <ul className="flex flex-col gap-y-12">
            {collections && region && (
              <FeaturedProducts collections={collections} region={region} />
            )}
          </ul>
        </div>
      </div>
    </>
  )
}
