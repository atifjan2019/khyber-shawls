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
  },
}

export default nextConfig
