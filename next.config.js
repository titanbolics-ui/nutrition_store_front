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
  devIndicators: false,
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
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
  async redirects(){
    return [
      // Real storefront links carry the country prefix (/us/products/...).
      // :countryCode is a path param — it must be re-emitted in destination,
      // otherwise the segment stays literal.
      {
        source: '/:countryCode/products/testoplex-e300',
        destination: '/:countryCode/products/testosterone-enanthate-250mgml-10ml-zphc',
        permanent: false,
      },
      // Fallback for bare links without a country prefix; proxy re-adds it after.
      {
        source: '/products/testoplex-e300',
        destination: '/products/testosterone-enanthate-250mgml-10ml-zphc',
        permanent: false,
      },
      { source: '/:countryCode/products/mastaplex',
        destination: '/:countryCode/products/drostanolone-propionate-100mgml-10ml',
        permanent: false,},
        // Fallback for bare links without a country prefix; proxy re-adds it after.
      {
source: '/products/mastaplex',
        destination: '/products/drostanolone-propionate-100mgml-10ml',
        permanent: false,
      },
    
    ]
  },
  skipTrailingSlashRedirect: true,
}

module.exports = nextConfig
