import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // 1. Create Admin User
  const password = await bcrypt.hash('admin123', 10)
  await prisma.user.upsert({
    where: { email: 'admin@khybershawls.com' },
    update: {},
    create: {
      email: 'admin@khybershawls.com',
      name: 'Admin',
      role: 'ADMIN',
      password,
    },
  })
  console.log('✅ Admin user created: admin@khybershawls.com / admin123')

  // 2. Create Categories
  const categories = [
    { name: "Men's Shawls", slug: 'men', featuredImageUrl: '/uploads/men-cat.jpg' },
    { name: "Women's Shawls", slug: 'women', featuredImageUrl: '/uploads/women-cat.jpg' },
    { name: "Kids' Shawls", slug: 'kids', featuredImageUrl: '/uploads/kids-cat.jpg' },
  ]

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: {
        name: cat.name,
        slug: cat.slug,
        featuredImageUrl: cat.featuredImageUrl,
        intro: JSON.stringify({
          title: `The Finest ${cat.name}`,
          description: "Explore our premium collection.",
          image: { url: cat.featuredImageUrl, alt: cat.name }
        }),
        uiConfig: JSON.stringify({
          showFilters: true,
          gridColumns: { mobile: 2, tablet: 3, desktop: 4 }
        })
      },
    })
  }
  console.log('✅ Categories created/verified')

  // 3. Create Dummy Products
  const products = [
    {
      name: "Classic Peshawari Wool Shawl",
      slug: "classic-peshawari-wool-shawl",
      description: "A timeless classic handmade with pure wool, perfect for the winter season.",
      details: "Size: 2.5m x 1.25m\nMaterial: 100% Pure Wool\nOrigin: Swat Valley",
      careInstructions: "Dry clean only. Do not bleach. Iron on low heat.",
      price: 4500,
      image: "/uploads/placeholder.svg",
      categorySlug: "men",
      tags: ["Featured", "New Arrival"]
    },
    {
      name: "Premium Karakul Cap & Shawl Set",
      slug: "premium-karakul-set",
      description: "An elegant combination of a handcrafted Karakul cap and a matching wool shawl.",
      details: "Includes: 1 Karakul Cap, 1 Wool Shawl\nColor: Charcoal Grey",
      careInstructions: "Professional dry clean recommended.",
      price: 8500,
      image: "/uploads/placeholder.svg",
      categorySlug: "men",
      tags: ["Featured"]
    },
    {
      name: "Embroidered Pashmina for Her",
      slug: "embroidered-pashmina-women",
      description: "Delicate embroidery on the finest pashmina fabric, designed for elegance.",
      details: "Material: Pashmina Blend\nPattern: Floral Embroidery",
      careInstructions: "Hand wash with cold water or dry clean.",
      price: 6200,
      image: "/uploads/placeholder.svg",
      categorySlug: "women",
      tags: ["Best Seller"]
    },
    {
      name: "Royal Velvet Shawl",
      slug: "royal-velvet-shawl",
      description: "Luxurious velvet shawl with golden borders, suitable for weddings.",
      details: "Material: Velvet\nColor: Maroon",
      careInstructions: "Dry clean only.",
      price: 5500,
      image: "/uploads/placeholder.svg",
      categorySlug: "women",
      tags: ["Featured"]
    },
    {
      name: "Kids' Warm Fleece Shawl",
      slug: "kids-warm-fleece-shawl",
      description: "Soft, comfortable, and warm shawl designed specifically for children.",
      details: "Material: Soft Fleece\nSize: Kids Standard",
      careInstructions: "Machine washable.",
      price: 1800,
      image: "/uploads/placeholder.svg",
      categorySlug: "kids",
      tags: []
    }
  ]

  for (const p of products) {
    const category = await prisma.category.findUnique({ where: { slug: p.categorySlug } })
    if (!category) continue

    await prisma.product.upsert({
      where: { slug: p.slug },
      update: {
        published: true,
        inStock: true,
      }, // Ensure it's published if it already exists
      create: {
        name: p.name,
        slug: p.slug,
        description: p.description,
        details: p.details,
        careInstructions: p.careInstructions,
        price: p.price,
        image: p.image,
        categoryId: category.id,
        published: true, // IMPORTANT: Set to true so they show up
        inStock: true
      }
    })

    // Add dummy tags if needed (Handling tags requires creating Tag model and linking)
    // For simplicity, skipping detailed tag relation logic unless specifically requested, 
    // but the schema has Tags. Let's do it properly.
    if (p.tags && p.tags.length > 0) {
      const product = await prisma.product.findUnique({ where: { slug: p.slug } });
      for (const tagName of p.tags) {
        const tag = await prisma.tag.upsert({
          where: { name: tagName },
          update: {},
          create: { name: tagName }
        });
        // Connect tag to product
        // Prisma implicitly handles the many-to-many table if configured, but here we might need explicit connect.
        // Check schema: products Product[] @relation("ProductTags")
        // So we update the product to connect the tag.
        await prisma.product.update({
          where: { id: product.id },
          data: {
            tags: {
              connect: { id: tag.id }
            }
          }
        });
      }
    }
  }
  console.log('✅ Dummy products created')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
