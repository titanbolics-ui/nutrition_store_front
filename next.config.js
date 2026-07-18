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
 // 1. from 10ml-zphc to base zphc
      {
        source: '/:countryCode/products/testosterone-enanthate-250mgml-10ml-zphc',
        destination: '/:countryCode/products/testosterone-enanthate-250mgml-zphc',
        permanent: false,
      },
      {
        source: '/products/testosterone-enanthate-250mgml-10ml-zphc',
        destination: '/products/testosterone-enanthate-250mgml-zphc',
        permanent: false,
      },

      // 2. from 30ml-zphc to base zphc
      {
        source: '/:countryCode/products/testosterone-enanthate-250mgml-30ml-zphc',
        destination: '/:countryCode/products/testosterone-enanthate-250mgml-zphc',
        permanent: false,
      },
      {
        source: '/products/testosterone-enanthate-250mgml-30ml-zphc',
        destination: '/products/testosterone-enanthate-250mgml-zphc',
        permanent: false,
      },

      // 3. from 1ml-amp-zphc to base zphc
      {
        source: '/:countryCode/products/testosterone-enanthate-250mgml-1ml-amp-zphc',
        destination: '/:countryCode/products/testosterone-enanthate-250mgml-zphc',
        permanent: false,
      },
      {
        source: '/products/testosterone-enanthate-250mgml-1ml-amp-zphc',
        destination: '/products/testosterone-enanthate-250mgml-zphc',
        permanent: false,
      },

      // 4. from 2ml-amp-zphc to base zphc
      {
        source: '/:countryCode/products/testosterone-enanthate-250mgml-2ml-amp-zphc',
        destination: '/:countryCode/products/testosterone-enanthate-250mgml-zphc',
        permanent: false,
      },
      {
        source: '/products/testosterone-enanthate-250mgml-2ml-amp-zphc',
        destination: '/products/testosterone-enanthate-250mgml-zphc',
        permanent: false,
      },
        // 5. from test-e-xt-labs to base zphc
      {
        source: '/:countryCode/products/testoplex-e300',
        destination: '/:countryCode/products/testosterone-enanthate-250mgml-zphc',
        permanent: false,
      },
      {
        source: '/products/testoplex-e300',
        destination: '/products/testosterone-enanthate-250mgml-zphc',
        permanent: false,
      },
      // 1. From 10ml-zphc to base zphc
      {
        source: '/:countryCode/products/testosterone-cypionate-250mgml-10ml-zphc',
        destination: '/:countryCode/products/testosterone-cypionate-250mgml-zphc',
        permanent: false,
      },
      {
        source: '/products/testosterone-cypionate-250mgml-10ml-zphc',
        destination: '/products/testosterone-cypionate-250mgml-zphc',
        permanent: false,
      },

      // 2. From 1ml-amp-zphc to base zphc
      {
        source: '/:countryCode/products/testosterone-cypionate-250mgml-1ml-amp-zphc',
        destination: '/:countryCode/products/testosterone-cypionate-250mgml-zphc',
        permanent: false,
      },
      {
        source: '/products/testosterone-cypionate-250mgml-1ml-amp-zphc',
        destination: '/products/testosterone-cypionate-250mgml-zphc',
        permanent: false,
      },

      // 3. From 30ml-zphc to base zphc
      {
        source: '/:countryCode/products/testosterone-cypionate-250mgml-30ml-zphc',
        destination: '/:countryCode/products/testosterone-cypionate-250mgml-zphc',
        permanent: false,
      },
      {
        source: '/products/testosterone-cypionate-250mgml-30ml-zphc',
        destination: '/products/testosterone-cypionate-250mgml-zphc',
        permanent: false,
      },
      // 4. From test-c-xt-labs to base zphc
      {
        source: '/:countryCode/products/testoplex-c300',
        destination: '/:countryCode/products/testosterone-cypionate-250mgml-zphc',
        permanent: false,
      },
      {
        source: '/products/testoplex-c300',
        destination: '/products/testosterone-cypionate-250mgml-zphc',
        permanent: false,
      },
      // Redirects for Testosterone Mix variants to the base product

      // 1. From 10ml-zphc to base zphc
      {
        source: '/:countryCode/products/testosterone-mix-250mgml-10ml-zphc',
        destination: '/:countryCode/products/testosterone-mix-250mgml-zphc',
        permanent: false,
      },
      {
        source: '/products/testosterone-mix-250mgml-10ml-zphc',
        destination: '/products/testosterone-mix-250mgml-zphc',
        permanent: false,
      },

      // 2. From 1ml-amp-zphc to base zphc
      {
        source: '/:countryCode/products/testosterone-mix-250mgml-1ml-amp-zphc',
        destination: '/:countryCode/products/testosterone-mix-250mgml-zphc',
        permanent: false,
      },
      {
        source: '/products/testosterone-mix-250mgml-1ml-amp-zphc',
        destination: '/products/testosterone-mix-250mgml-zphc',
        permanent: false,
      },

      // 3. From 2ml-amp-zphc to base zphc
      {
        source: '/:countryCode/products/testosterone-mix-250mgml-2ml-amp-zphc',
        destination: '/:countryCode/products/testosterone-mix-250mgml-zphc',
        permanent: false,
      },
      {
        source: '/products/testosterone-mix-250mgml-2ml-amp-zphc',
        destination: '/products/testosterone-mix-250mgml-zphc',
        permanent: false,
      },

      // 4. From 30ml-zphc to base zphc
      {
        source: '/:countryCode/products/testosterone-mix-250mgml-30ml-zphc',
        destination: '/:countryCode/products/testosterone-mix-250mgml-zphc',
        permanent: false,
      },
      {
        source: '/products/testosterone-mix-250mgml-30ml-zphc',
        destination: '/products/testosterone-mix-250mgml-zphc',
        permanent: false,
      },
        // 4. From sustaplex-275-xt-labs to base zphc
      {
        source: '/:countryCode/products/sustaplex-275',
        destination: '/:countryCode/products/testosterone-mix-250mgml-zphc',
        permanent: false,
      },
      {
        source: '/products/sustaplex-275',
        destination: '/products/testosterone-mix-250mgml-zphc',
        permanent: false,
      },
      // Redirects for Zptropin HGH variants to the base product

      // 1. From zptropin-hgh-160iu-zphc to base hgh
      {
        source: '/:countryCode/products/zptropin-hgh-160iu-zphc',
        destination: '/:countryCode/products/zptrop-hgh-somatripin-191aa-rdna-zphc',
        permanent: false,
      },
      {
        source: '/products/zptropin-hgh-160iu-zphc',
        destination: '/products/zptrop-hgh-somatripin-191aa-rdna-zphc',
        permanent: false,
      },

      // 2. From zptrop-hgh-80iu-zphc-bacteriostatic-water to base hgh
      {
        source: '/:countryCode/products/zptrop-hgh-80iu-zphc-bacteriostatic-water',
        destination: '/:countryCode/products/zptrop-hgh-somatripin-191aa-rdna-zphc',
        permanent: false,
      },
      {
        source: '/products/zptrop-hgh-80iu-zphc-bacteriostatic-water',
        destination: '/products/zptrop-hgh-somatripin-191aa-rdna-zphc',
        permanent: false,
      },

      // 3. From zptrop-200iu-hgh-bacteriostatic-water-zphc to base hgh
      {
        source: '/:countryCode/products/zptrop-200iu-hgh-bacteriostatic-water-zphc',
        destination: '/:countryCode/products/zptrop-hgh-somatripin-191aa-rdna-zphc',
        permanent: false,
      },
      {
        source: '/products/zptrop-200iu-hgh-bacteriostatic-water-zphc',
        destination: '/products/zptrop-hgh-somatripin-191aa-rdna-zphc',
        permanent: false,
      },

      // 4. From zptrop-hgh-320iu-zphc to base hgh
      {
        source: '/:countryCode/products/zptrop-hgh-320iu-zphc',
        destination: '/:countryCode/products/zptrop-hgh-somatripin-191aa-rdna-zphc',
        permanent: false,
      },
      {
        source: '/products/zptrop-hgh-320iu-zphc',
        destination: '/products/zptrop-hgh-somatripin-191aa-rdna-zphc',
        permanent: false,
      },

      // 5. From zptrop-100iu-zphc to base hgh
      {
        source: '/:countryCode/products/zptrop-100iu-zphc',
        destination: '/:countryCode/products/zptrop-hgh-somatripin-191aa-rdna-zphc',
        permanent: false,
      },
      {
        source: '/products/zptrop-100iu-zphc',
        destination: '/products/zptrop-hgh-somatripin-191aa-rdna-zphc',
        permanent: false,
      },
      // Redirects for Spectros HGH variants to the base product

      // 1. From spectros-140iu-hgh-spectrum-pharma to base hgh
      {
        source: '/:countryCode/products/spectros-140iu-hgh-spectrum-pharma',
        destination: '/:countryCode/products/spectros-hgh-somatropin-spectrum-pharma',
        permanent: false,
      },
      {
        source: '/products/spectros-140iu-hgh-spectrum-pharma',
        destination: '/products/spectros-hgh-somatropin-spectrum-pharma',
        permanent: false,
      },

      // 2. From spectros-150iu-hgh-spectrum-pharma (derived from SPECTROS 150IU HGH [Spectrum Pharma]) to base hgh
      {
        source: '/:countryCode/products/spectros-150iu-hgh-spectrum-pharma',
        destination: '/:countryCode/products/spectros-hgh-somatropin-spectrum-pharma',
        permanent: false,
      },
      {
        source: '/products/spectros-150iu-hgh-spectrum-pharma',
        destination: '/products/spectros-hgh-somatropin-spectrum-pharma',
        permanent: false,
      },

      // 3. From spectros-280iu-hgh-spectrum-pharma to base hgh
      {
        source: '/:countryCode/products/spectros-280iu-hgh-spectrum-pharma',
        destination: '/:countryCode/products/spectros-hgh-somatropin-spectrum-pharma',
        permanent: false,
      },
      {
        source: '/products/spectros-280iu-hgh-spectrum-pharma',
        destination: '/products/spectros-hgh-somatropin-spectrum-pharma',
        permanent: false,
      },
    ]
  },
  skipTrailingSlashRedirect: true,
}

module.exports = nextConfig
