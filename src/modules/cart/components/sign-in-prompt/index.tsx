import { Button, Heading, Text } from "@medusajs/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

const SignInPrompt = () => {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 flex items-center justify-between">
      <div>
        <Heading level="h2" className="txt-xlarge text-white">
          Already have an account?
        </Heading>
        <Text className="txt-medium text-gray-400 mt-2">
          Sign in for a better experience.
        </Text>
      </div>
      <div>
        <LocalizedClientLink href="/account">
          <Button variant="secondary" className="h-10 bg-gray-800 border-gray-700 text-white hover:bg-gray-700" data-testid="sign-in-button">
            Sign in
          </Button>
        </LocalizedClientLink>
      </div>
    </div>
  )
}

export default SignInPrompt
