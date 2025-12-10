import { Metadata } from "next"

import FeaturedProducts from "@modules/home/components/featured-products"
import Hero from "@modules/home/components/hero"
import { listCollections } from "@lib/data/collections"
import { getRegion, listRegions } from "@lib/data/regions"

export const metadata: Metadata = {
  title: "Onyx Genetics",
  description:
    "Premium genetics and breeding solutions.",
}

export default async function Home(props: {
  params: Promise<{ countryCode: string }>
}) {
  const params = await props.params

  const { countryCode } = params

  console.log("---- DEBUG HOME PAGE ----")
  console.log("1. Country Code з URL:", countryCode)

  const allRegions = await listRegions()

  if (!allRegions || allRegions.length === 0) {
    console.error(
      "!!! КРИТИЧНО: Не отримано жодного регіону від Бекенду."
    )
    console.error(
      "Перевірте, чи запущено бекенд на порту 9000 і чи правильний URL в .env"
    )
  } else {
    console.log(`Знайдено регіонів: ${allRegions.length}`)
    // Виведемо список країн, які система знає
    allRegions.forEach((r) => {
      console.log(`Регіон: ${r.name} (ID: ${r.id})`)
      console.log(
        `Країни в цьому регіоні:`,
        r.countries?.map((c) => c.iso_2).join(", ")
      )
    })
  }

  const region = await getRegion(countryCode)
  console.log(
    "2. Region знайдено:",
    region ? "ТАК (" + region.id + ")" : "НІ (region is null)"
  )

  const { collections } = await listCollections({
    fields: "id, handle, title",
  })
  console.log(
    "3. Collections знайдено:",
    collections ? collections.length : "НІ (null)"
  )

  // if (!collections || !region) {
  //   return null
  // }

  return (
    <>
      {/* Додамо червоний текст на екран, щоб ви бачили помилку одразу */}
      {(!collections || !region) && (
        <div className="p-10 bg-red-100 text-red-800 font-bold text-center border-b border-red-500">
          ПОМИЛКА: {!region ? "Не знайдено Регіон!" : "Не знайдено Колекції!"}{" "}
          <br />
          Перевірте термінал VS Code.
        </div>
      )}

      <Hero />
      <div className="py-12">
        <ul className="flex flex-col gap-x-6">
          {collections && region ? (
            <FeaturedProducts collections={collections} region={region} />
          ) : (
            <p className="text-center">
              Тут мали бути товари, але немає даних.
            </p>
          )}
        </ul>
      </div>
    </>
  )
}
