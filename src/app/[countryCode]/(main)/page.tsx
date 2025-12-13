import { Metadata } from "next"

import FeaturedProducts from "@modules/home/components/featured-products"
import Hero from "@modules/home/components/hero"
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

  const allRegions = await listRegions()

  const region = await getRegion(countryCode)

  const { collections } = await listCollections({
    fields: "id, handle, title",
  })

  return (
    <>
      {(!collections || !region) && (
        <div className="p-10 bg-red-100 text-red-800 font-bold text-center border-b border-red-500">
          ERROR: {!region ? "Region not found!" : "Collections not found!"}{" "}
          <br />
          Check the terminal VS Code.
        </div>
      )}

      <Hero />
      <LabResults />
      <div className="py-12">
        <ul className="flex flex-col gap-x-6">
          {collections && region ? (
            <FeaturedProducts collections={collections} region={region} />
          ) : (
            <p className="text-center">
              There should be products here, but there are no data.
            </p>
          )}
        </ul>
      </div>
    </>
  )
}
