const webpack = require('webpack')
const path = require('path')
const { parsed: envs } = require('dotenv').config({ path: path.join('..', '..', '..', '.env') })

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
    config.plugins.push(new webpack.EnvironmentPlugin(envs))
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
  env: {
    STR_TO_ENCRYPT_KEY: process.env.STR_TO_ENCRYPT_KEY,
    SESSION_COOKIE_NAME: process.env.SESSION_COOKIE_NAME,
    INDEX_DB_NAME: process.env.INDEX_DB_NAME,
  },
}

module.exports = nextConfig
