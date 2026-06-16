"use client"

import React, { useEffect, useActionState, useState } from "react";
import { useParams } from "next/navigation"

import Input from "@modules/common/components/input"

import AccountInfo from "../account-info"
import { HttpTypes } from "@medusajs/types"
import { updateCustomer } from "@lib/data/customer"
import { checkPhone } from "@lib/util/phone"

type MyInformationProps = {
  customer: HttpTypes.StoreCustomer
}

const ProfileEmail: React.FC<MyInformationProps> = ({ customer }) => {
  const { countryCode } = useParams() as { countryCode?: string }
  const [successState, setSuccessState] = React.useState(false)
  const [phone, setPhone] = useState(customer.phone ?? "")

  // Soft warning only — backend normalizes; clearing the field stays allowed
  const showPhoneWarning = phone.trim().length > 0 && !checkPhone(phone, countryCode).valid

  const updateCustomerPhone = async (
    _currentState: Record<string, unknown>,
    formData: FormData
  ) => {
    const customer = {
      phone: formData.get("phone") as string,
    }

    try {
      await updateCustomer(customer)
      return { success: true, error: null }
    } catch (error: any) {
      return { success: false, error: error.toString() }
    }
  }

  const [state, formAction] = useActionState(updateCustomerPhone, {
    error: false,
    success: false,
  })

  const clearState = () => {
    setSuccessState(false)
  }

  useEffect(() => {
    setSuccessState(state.success)
  }, [state])

  return (
    <form action={formAction} className="w-full">
      <AccountInfo
        label="Phone"
        currentInfo={customer.phone || "Add your phone"}
        isSuccess={successState}
        isError={!!state.error}
        errorMessage={state.error}
        clearState={clearState}
        data-testid="account-phone-editor"
      >
        <div className="grid grid-cols-1 gap-y-2">
          <Input
            label="Phone"
            name="phone"
            type="phone"
            autoComplete="phone"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            data-testid="phone-input"
          />
          {showPhoneWarning && (
            <p className="text-amber-400 text-xs px-1">
              Double-check this number — we couldn&apos;t recognize it. You can still save.
            </p>
          )}
        </div>
      </AccountInfo>
    </form>
  )
}

export default ProfileEmail
