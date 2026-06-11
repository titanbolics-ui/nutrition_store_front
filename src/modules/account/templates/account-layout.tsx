import React from "react"

import UnderlineLink from "@modules/common/components/interactive-link"

import AccountNav from "../components/account-nav"
import { HttpTypes } from "@medusajs/types"

interface AccountLayoutProps {
  customer: HttpTypes.StoreCustomer | null
  children: React.ReactNode
}

const AccountLayout: React.FC<AccountLayoutProps> = ({
  customer,
  children,
}) => {
  return (
    <div className="flex-1 pb-8 small:pt-4 small:pb-12" data-testid="account-page">
      <div className="flex-1 content-container h-full max-w-5xl mx-auto bg-[#111111] small:border small:border-gray-800 small:rounded-xl shadow-2xl flex flex-col px-0 py-0 small:p-8">
        <div className="grid grid-cols-1 small:grid-cols-[240px_1fr] py-4 small:py-12">
          <div>{customer && <AccountNav customer={customer} />}</div>
          <div className="flex-1 px-4 small:px-0">{children}</div>
        </div>
        <div className="flex flex-col small:flex-row items-end justify-between small:border-t border-gray-800 py-8 px-4 small:px-0 gap-8">
          <div>
            <h3 className="text-xl-semi mb-4 text-white">Got questions?</h3>
            <span className="txt-medium text-gray-400">
              You can find frequently asked questions and answers on our
              customer service page.
            </span>
          </div>
          <div>
            <UnderlineLink href="/contact">Customer Service</UnderlineLink>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AccountLayout
