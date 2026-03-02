import { declineTransferRequest } from "@lib/data/orders"
import { Heading, Text } from "@medusajs/ui"
import TransferImage from "@modules/order/components/transfer-image"

export default async function TransferPage({
  params,
}: {
  params: Promise<{ id: string; token: string }>
}) {
  const { id, token } = await params

  const { success, error } = await declineTransferRequest(id, token)

  return (
    <div className="content-container py-10 sm:py-14">
      <div className="w-full max-w-2xl mx-auto bg-gray-900 border border-gray-800 rounded-xl p-5 sm:p-8">
        <div className="mb-4 sm:mb-6 flex justify-center">
          <TransferImage />
        </div>
        <div className="flex flex-col gap-y-5">
        {success && (
          <>
            <Heading level="h1" className="text-2xl text-white">
              Order transfer declined!
            </Heading>
            <Text className="text-gray-300">
              Transfer of order{" "}
              <span className="font-mono text-gray-200 break-all">{id}</span>{" "}
              has been successfully declined.
            </Text>
          </>
        )}
        {!success && (
          <>
            <Text className="text-gray-300">
              There was an error declining the transfer. Please try again.
            </Text>
            {error && (
              <Text className="text-red-400 break-words">
                Error message: {error}
              </Text>
            )}
          </>
        )}
        </div>
      </div>
    </div>
  )
}
