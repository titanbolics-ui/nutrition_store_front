import { Metadata } from "next"

import Hero from "@modules/home/components/hero"
import HorizontalScrollSection from "@modules/home/components/horizontal-scroll-section"
import BestSellers from "@modules/home/components/best-sellers"
import OnyxStandard from "@modules/home/components/onyx-standard"
import { getRegion } from "@lib/data/regions"
import LabResults from "@modules/home/components/lab-tested-section"
import HeroSnapContainer from "@modules/home/components/mobile-scroll-snap"

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
      <div className="-mt-20">
        <HeroSnapContainer>
          <Hero />
          <HorizontalScrollSection />
        </HeroSnapContainer>
      </div>
      {region && <BestSellers region={region} />}
      <LabResults />
      <OnyxStandard />
    </>
  )
}
