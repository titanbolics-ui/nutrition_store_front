import { Heading, Text } from "@medusajs/ui"
import TransferActions from "@modules/order/components/transfer-actions"
import TransferImage from "@modules/order/components/transfer-image"

export default async function TransferPage({
  params,
}: {
  params: Promise<{ id: string; token: string }>
}) {
  const { id, token } = await params

  return (
    <div className="content-container py-10 sm:py-14">
      <div className="w-full max-w-2xl mx-auto bg-gray-900 border border-gray-800 rounded-xl p-5 sm:p-8">
        <div className="mb-4 sm:mb-6 flex justify-center">
          <TransferImage />
        </div>
        <div className="flex flex-col gap-y-5">
          <Heading level="h1" className="text-2xl text-white">
            Transfer request for order{" "}
            <span className="font-mono text-gray-200 break-all">{id}</span>
          </Heading>
          <Text className="text-gray-300">
            You&#39;ve received a request to transfer ownership of this order.
            If you agree, approve the transfer using the button below.
          </Text>
          <div className="w-full h-px bg-gray-800" />
          <Text className="text-gray-400">
            If you accept, the new owner will take over all responsibilities and
            permissions associated with this order.
          </Text>
          <Text className="text-gray-400">
            If you do not recognize this request or wish to keep ownership, do
            not proceed.
          </Text>
          <div className="w-full h-px bg-gray-800" />
          <TransferActions id={id} token={token} />
        </div>
      </div>
    </div>
  )
}
