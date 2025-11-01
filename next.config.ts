import type { NextConfig } from "next"

const ALLOWED_HOSTNAMES = [
  "images.unsplash.com",
  "res.cloudinary.com",
  "wobbly-swordfish.org",
  "images.pexels.com",
  "images.khybershawls.com",
  "uncomfortable-dress.info",
  "khybershawls.store",
  "pure-e-mail.com",
]

const nextConfig: NextConfig = {
  images: {
    remotePatterns: ALLOWED_HOSTNAMES.map((hostname) => ({
      protocol: "https",
      hostname,
    })),
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
  output: "standalone",
  // Ensure public directory is properly served in standalone mode
  outputFileTracingIncludes: {
    '/': ['./public/**/*'],
  },
}

export default nextConfig
