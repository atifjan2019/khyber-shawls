import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/api/',
          '/dashboard/',
          '/login',
          '/signup',
        ],
      },
    ],
    sitemap: 'https://khybershawls.com/sitemap.xml',
  }
}
