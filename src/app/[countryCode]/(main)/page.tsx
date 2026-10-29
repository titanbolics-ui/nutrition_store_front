import { Metadata } from "next"

import Hero from "@modules/home/components/hero"
import GuaranteeStrip from "@modules/home/components/guarantee-strip"
import GoalsShowcase from "@modules/home/components/goals-showcase"
import BestSellers from "@modules/home/components/best-sellers"
import OnyxStandard from "@modules/home/components/onyx-standard"
import ReviewsSection from "@modules/home/components/reviews-section"
import CategoryBento from "@modules/home/components/category-bento"
import { getRegion } from "@lib/data/regions"
import { listCategories } from "@lib/data/categories"
import LabResults from "@modules/home/components/lab-tested-section"
import HeroSnapContainer from "@modules/home/components/mobile-scroll-snap"

export const metadata: Metadata = {
  title: "Onyx Genetics",
  description:
    "Pharma-grade compounds from GMP-certified factories. Independently spot-checked, stealth shipping, reshipped free if seized.",
}

export default async function Home(props: {
  params: Promise<{ countryCode: string }>
}) {
  const params = await props.params

  const { countryCode } = params

  const region = await getRegion(countryCode)

  const allCategories = await listCategories().catch(() => [])
  const heroCategories = (allCategories ?? [])
    .filter((category) => !category.parent_category)
    .map((category) => ({ name: category.name, handle: category.handle }))

  return (
    <>
      <div className="-mt-20">
        <HeroSnapContainer>
          <Hero categories={heroCategories} />
        </HeroSnapContainer>
      </div>
      <GuaranteeStrip />
      {/* Proof before claims: lab reports come right after the guarantee */}
      <LabResults />
      {region && <GoalsShowcase region={region} />}
      {region && <BestSellers region={region} />}
      <OnyxStandard />
      <ReviewsSection />
      <CategoryBento />
    </>
  )
}
