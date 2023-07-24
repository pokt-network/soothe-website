/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@soothe/ui', '@soothe/common'],
  experimental: {
    appDir: true,
  },
  staticPageGenerationTimeout: 120,
  reactStrictMode: false,
  swcMinify: true,
  ...(process.env.NODE_ENV === 'production' && {
    compiler: {
      removeConsole: {
        exclude: ['error'],
      },
    },
  }),
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/i,
      // issuer section restricts svg as component only to
      // svgs imported from js / ts files.
      //
      // This allows configuring other behavior for
      // svgs imported from other file types (such as .css)
      issuer: { and: [/\.(js|ts|md)x?$/] },
      use: [
        {
          loader: '@svgr/webpack',
          options: {},
        },
      ],
    })
    return config
  },
}

module.exports = nextConfig
