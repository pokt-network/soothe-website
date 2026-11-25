/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    // Only the statically imported assets (app/assets/*) go through the image optimizer.
    // Next 16 defaults localPatterns to "**", which lets /_next/image?url=/<any route> make the
    // server request its own routes (probed 2026-11-25). SVGs (public/soothe_logo.svg, the browser
    // logos) are served unoptimized by next/image anyway.
    localPatterns: [{ pathname: '/_next/static/media/**', search: '' }],
    remotePatterns: [],
  },
}
export default nextConfig;
