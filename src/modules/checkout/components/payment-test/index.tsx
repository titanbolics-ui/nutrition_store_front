import { Badge } from "@medusajs/ui"

const PaymentTest = ({ className }: { className?: string }) => {
  return (
    <Badge color="green" className={className}>
      <span className="font-semibold">Secure Checkout:</span>
      &nbsp;Your order details are safe. Instructions will follow via email.
    </Badge>
  )
}

export default PaymentTest
