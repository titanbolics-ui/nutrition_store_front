const AlsoKnownAs = ({ names }: { names?: string[] }) => {
  if (!names || names.length === 0) return null

  return (
    <p className="mt-2 text-sm text-gray-500" data-testid="also-known-as">
      Also known as {names.join(", ")}.
    </p>
  )
}

export default AlsoKnownAs
