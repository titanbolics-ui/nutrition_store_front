import { Toaster } from "@medusajs/ui"

export default function ResetPasswordLayout({
  children,
  dashboard,
  login,
}: {
  children: React.ReactNode
  dashboard?: React.ReactNode
  login?: React.ReactNode
}) {
  return (
    <>
      {children}
      <Toaster />
    </>
  )
}

