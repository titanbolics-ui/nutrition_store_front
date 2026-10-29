import { getOrderMinimum, retrieveCart } from "@lib/data/cart"
import { retrieveCustomer } from "@lib/data/customer"
import CartTemplate from "@modules/cart/templates"
import { Metadata } from "next"
import { notFound } from "next/navigation"

export const metadata: Metadata = {
  title: "Cart",
  description: "View your cart",
}

export default async function Cart() {
  const cart = await retrieveCart().catch((error) => {
    console.error(error)
    return notFound()
  })

  const customer = await retrieveCustomer()
  const orderMinimum = cart ? await getOrderMinimum(cart.id) : null

  return (
    <CartTemplate cart={cart} customer={customer} orderMinimum={orderMinimum} />
  )
}
