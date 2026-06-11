import { Container } from "@medusajs/ui"

import ChevronDown from "@modules/common/icons/chevron-down"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { convertToLocale } from "@lib/util/money"
import { HttpTypes } from "@medusajs/types"
import { StoreCreditAccount } from "@lib/data/store-credits"

type OverviewProps = {
  customer: HttpTypes.StoreCustomer | null
  orders: HttpTypes.StoreOrder[] | null
  storeCreditAccounts?: StoreCreditAccount[]
}

const Overview = ({ customer, orders, storeCreditAccounts = [] }: OverviewProps) => {
  const totalCredits = storeCreditAccounts.reduce((sum, a) => sum + a.balance, 0)
  const creditAccount = storeCreditAccounts[0]
  return (
    <div data-testid="overview-page-wrapper">
      <div className="hidden small:block">
        <div className="text-xl-semi flex justify-between items-center mb-4">
          <span data-testid="welcome-message" data-value={customer?.first_name}>
            Hello {customer?.first_name || "there"}
          </span>
          <span className="text-small-regular text-ui-fg-base">
            Signed in as:{" "}
            <span
              className="font-semibold"
              data-testid="customer-email"
              data-value={customer?.email}
            >
              {customer?.email}
            </span>
          </span>
        </div>
        <div className="flex flex-col py-8 border-t border-gray-800">
          <div className="flex flex-col gap-y-4 h-full col-span-1 row-span-2 flex-1">
            {totalCredits > 0 && creditAccount && (
              <div className="mb-6 rounded-xl border border-[#b8ff2b]/20 bg-[#b8ff2b]/5 px-5 py-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Store Credit</p>
                  <p className="text-2xl font-bold text-[#b8ff2b]">
                    {convertToLocale({ amount: totalCredits, currency_code: creditAccount.currency_code })}
                  </p>
                </div>
                <LocalizedClientLink
                  href="/checkout"
                  className="text-sm text-[#b8ff2b] hover:text-[#b8ff2b]/70 transition-colors"
                >
                  Use at checkout →
                </LocalizedClientLink>
              </div>
            )}

            <div className="flex items-start gap-x-16 mb-6">
              <div className="flex flex-col gap-y-4">
                <h3 className="text-large-semi text-white">Profile</h3>
                <div className="flex items-end gap-x-2">
                  <span
                    className="text-3xl-semi leading-none text-[#b8ff2b]"
                    data-testid="customer-profile-completion"
                    data-value={getProfileCompletion(customer)}
                  >
                    {getProfileCompletion(customer)}%
                  </span>
                  <span className="uppercase text-base-regular text-gray-500">
                    Completed
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-y-4">
                <h3 className="text-large-semi text-white">Addresses</h3>
                <div className="flex items-end gap-x-2">
                  <span
                    className="text-3xl-semi leading-none text-[#b8ff2b]"
                    data-testid="addresses-count"
                    data-value={customer?.addresses?.length || 0}
                  >
                    {customer?.addresses?.length || 0}
                  </span>
                  <span className="uppercase text-base-regular text-gray-500">
                    Saved
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-y-4">
              <div className="flex items-center gap-x-2">
                <h3 className="text-large-semi text-white">Recent orders</h3>
              </div>
              <ul
                className="flex flex-col gap-y-4"
                data-testid="orders-wrapper"
              >
                {orders && orders.length > 0 ? (
                  orders.slice(0, 5).map((order) => {
                    return (
                      <li
                        key={order.id}
                        data-testid="order-wrapper"
                        data-value={order.id}
                      >
                        <LocalizedClientLink
                          href={`/account/orders/details/${order.id}`}
                        >
                          <Container className="bg-gray-900 border border-gray-800 rounded-lg flex justify-between items-center p-4 hover:border-gray-700 transition-colors">
                            <div className="grid grid-cols-3 grid-rows-2 text-small-regular gap-x-4 flex-1">
                              <span className="font-semibold text-gray-500">Date placed</span>
                              <span className="font-semibold text-gray-500">
                                Order number
                              </span>
                              <span className="font-semibold text-gray-500">
                                Total amount
                              </span>
                              <span data-testid="order-created-date" className="text-gray-300">
                                {new Date(order.created_at).toDateString()}
                              </span>
                              <span
                                data-testid="order-id"
                                data-value={order.display_id}
                                className="text-white font-medium"
                              >
                                #ONX-{order.display_id}
                              </span>
                              <span data-testid="order-amount" className="text-[#b8ff2b]">
                                {convertToLocale({
                                  amount: order.total,
                                  currency_code: order.currency_code,
                                })}
                              </span>
                            </div>
                            <button
                              className="flex items-center justify-between text-gray-400 hover:text-white"
                              data-testid="open-order-button"
                            >
                              <span className="sr-only">
                                Go to order #ONX-{order.display_id}
                              </span>
                              <ChevronDown className="-rotate-90" />
                            </button>
                          </Container>
                        </LocalizedClientLink>
                      </li>
                    )
                  })
                ) : (
                  <span data-testid="no-orders-message" className="text-gray-500">No recent orders</span>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const getProfileCompletion = (customer: HttpTypes.StoreCustomer | null) => {
  let count = 0

  if (!customer) {
    return 0
  }

  if (customer.email) {
    count++
  }

  if (customer.first_name && customer.last_name) {
    count++
  }

  if (customer.phone) {
    count++
  }

  const billingAddress = customer.addresses?.find(
    (addr) => addr.is_default_billing
  )

  if (billingAddress) {
    count++
  }

  return (count / 4) * 100
}

export default Overview
