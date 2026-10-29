import { test } from "node:test"
import assert from "node:assert/strict"
import {
  isSurchargeMethod,
  splitShippingMethods,
  surchargeName,
  surchargeTotal,
} from "./payment-surcharge.ts"

const delivery = { name: "Standart", amount: 31, data: {} }
const fee = {
  name: "PayPal fee (5%)",
  amount: 7.55,
  data: { payment_surcharge: "paypal", percent: 5 },
}

test("isSurchargeMethod: data/metadata marker or the guest-page boolean", () => {
  assert.equal(isSurchargeMethod(fee), true)
  assert.equal(isSurchargeMethod({ metadata: { payment_surcharge: "paypal" } }), true)
  assert.equal(isSurchargeMethod({ name: "PayPal fee (5%)", total: 7.55, payment_surcharge: true }), true)
  assert.equal(isSurchargeMethod({ payment_surcharge: false }), false)
  assert.equal(isSurchargeMethod(delivery), false)
  assert.equal(isSurchargeMethod(null), false)
})

test("splitShippingMethods keeps delivery first even if the fee comes first", () => {
  const { delivery: d, surcharge: s } = splitShippingMethods([fee, delivery])
  assert.deepEqual(d, [delivery])
  assert.deepEqual(s, [fee])
})

test("surchargeTotal prefers total, falls back to amount; 0 without a fee", () => {
  assert.equal(surchargeTotal([delivery, fee]), 7.55)
  assert.equal(surchargeTotal([{ ...fee, total: 8 }]), 8)
  assert.equal(surchargeTotal([delivery]), 0)
  assert.equal(surchargeTotal(undefined), 0)
})

test("surchargeName uses the stored label", () => {
  assert.equal(surchargeName([delivery, fee]), "PayPal fee (5%)")
  assert.equal(surchargeName([]), "PayPal fee")
})
