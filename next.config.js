const checkEnvVariables = require("./check-env-variables")

checkEnvVariables()

/**
 * S3 Cloud-related environment variables
 */
const S3_HOSTNAME = process.env.MEDUSA_CLOUD_S3_HOSTNAME
const S3_PATHNAME = process.env.MEDUSA_CLOUD_S3_PATHNAME

/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  reactStrictMode: true,
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    qualities: [25, 50, 75, 100],
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
      },
      {
        protocol: "https",
        hostname: "medusa-public-images.s3.eu-west-1.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "medusa-server-testing.s3.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "medusa-server-testing.s3.us-east-1.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "onyxgenetics.com",
      },
      {
        protocol: "https",
        hostname: "cdn.onyxgenetics.com",
      },
      {
        protocol: "https",
        hostname: "cdn.onyxgenetics.com/onyxgenetics",
      },
      {
        protocol: "https",
        hostname: "pub-180ab5eb49854df5a790e2b99c1c0be9.r2.dev",
      },
      ...(S3_HOSTNAME && S3_PATHNAME
        ? [
            {
              protocol: "https",
              hostname: S3_HOSTNAME,
              pathname: S3_PATHNAME,
            },
          ]
        : []),
    ],
  },
  async rewrites() {
    const posthogHost =
      process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://eu.i.posthog.com"

    const isEU = posthogHost.includes("eu.i.posthog.com")
    const posthogAssetsHost = isEU
      ? "https://eu-assets.i.posthog.com"
      : "https://us-assets.i.posthog.com"

    return [
      // Rewrites для запитів БЕЗ countryCode - статика (має бути першим для правильного matching)
      {
        source: "/ingest/static/:path*",
        destination: `${posthogAssetsHost}/static/:path*`,
      },
      // Rewrites для запитів БЕЗ countryCode - array (для завантаження config.js)
      {
        source: "/ingest/array/:path*",
        destination: `${posthogHost}/array/:path*`,
      },
      // Rewrites для запитів БЕЗ countryCode - всі інші endpoint'и
      {
        source: "/ingest/:path*",
        destination: `${posthogHost}/:path*`,
      },
      // Rewrites для запитів З countryCode - статика
      {
        source: "/:countryCode/ingest/static/:path*",
        destination: `${posthogAssetsHost}/static/:path*`,
      },
      // Rewrites для запитів З countryCode - array
      {
        source: "/:countryCode/ingest/array/:path*",
        destination: `${posthogHost}/array/:path*`,
      },
      // Rewrites для запитів З countryCode - всі інші endpoint'и
      {
        source: "/:countryCode/ingest/:path*",
        destination: `${posthogHost}/:path*`,
      },
    ]
  },
  skipTrailingSlashRedirect: true,
}

module.exports = nextConfig
