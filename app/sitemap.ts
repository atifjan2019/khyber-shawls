import { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://khybershawls.com'

  // Static pages
  const staticPages = [
    '',
    '/shop',
    '/about',
    '/contact',
    '/cart',
    '/checkout',
    '/collections',
    '/faq',
    '/track-order',
    '/journal',
    '/policies/shipping',
    '/policies/returns',
    '/policies/privacy',
    '/policies/terms',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1 : 0.8,
  }))

  // Get all published products
  const products = await prisma.product.findMany({
    where: { published: true },
    select: { slug: true, updatedAt: true },
  })

  const productPages = products.map((product) => ({
    url: `${baseUrl}/products/${product.slug}`,
    lastModified: product.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.9,
  }))

  // Get all categories
  const categories = await prisma.category.findMany({
    select: { slug: true, updatedAt: true },
  })

  const categoryPages = categories.map((category) => ({
    url: `${baseUrl}/category/${category.slug}`,
    lastModified: category.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  // Get all published blog posts
  const posts = await prisma.blogPost.findMany({
    where: { published: true },
    select: { slug: true, updatedAt: true },
  })

  const blogPages = posts.map((post) => ({
    url: `${baseUrl}/journal/${post.slug}`,
    lastModified: post.updatedAt,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }))

  return [...staticPages, ...productPages, ...categoryPages, ...blogPages]
}
