"use server"

import { retrieveCustomer } from "@lib/data/customer"

export async function getCustomerForIdentification() {
  try {
    const customer = await retrieveCustomer()
    
    if (!customer) {
      return null
    }

    return {
      id: customer.id,
      email: customer.email,
      firstName: customer.first_name,
      lastName: customer.last_name,
      phone: customer.phone,
      hasAccount: customer.has_account,
      createdAt: customer.created_at,
    }
  } catch (error) {
    console.error("Error getting customer for identification:", error)
    return null
  }
}

