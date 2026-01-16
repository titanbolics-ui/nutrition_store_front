import { Metadata } from "next"

import Hero from "@modules/home/components/hero"
import HorizontalScrollSection from "@modules/home/components/horizontal-scroll-section"
import BestSellers from "@modules/home/components/best-sellers"
import { getRegion } from "@lib/data/regions"
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

  return (
    <>
      <Hero />
      <HorizontalScrollSection />
      <LabResults />

      {/* BEST SELLERS SECTION - DARK MODE */}
      <div className="relative py-24 bg-[#0a0a0a]">
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
          {region && <BestSellers region={region} />}
        </div>
      </div>
    </>
  )
}
