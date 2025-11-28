import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'

const prisma = new PrismaClient()

interface ImageIssue {
  type: 'product' | 'product_image' | 'media' | 'category'
  id: string
  name?: string
  url: string
  exists: boolean
}

async function diagnoseImages() {
  console.log('🔍 Diagnosing image references...\n')
  
  const issues: ImageIssue[] = []
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
  
  // Check if uploads directory exists
  if (!fs.existsSync(uploadsDir)) {
    console.error('❌ uploads directory does not exist!')
    return
  }

  // Get all files in uploads directory
  const existingFiles = fs.readdirSync(uploadsDir).filter(f => f !== '.gitkeep')
  console.log(`📁 Found ${existingFiles.length} files in /public/uploads/\n`)

  // Check Products (main image)
  console.log('Checking Products...')
  const products = await prisma.product.findMany({
    select: { id: true, name: true, image: true }
  })
  
  for (const product of products) {
    if (!product.image) continue
    
    const filename = product.image.replace('/uploads/', '')
    const exists = existingFiles.includes(filename)
    
    if (!exists) {
      issues.push({
        type: 'product',
        id: product.id,
        name: product.name,
        url: product.image,
        exists: false
      })
    }
  }
  console.log(`✓ Checked ${products.length} products, found ${issues.filter(i => i.type === 'product').length} missing images\n`)

  // Check Product Images (gallery)
  console.log('Checking Product Gallery Images...')
  const productImages = await prisma.product_images.findMany({
    select: { id: true, url: true, products: { select: { name: true } } }
  })
  
  for (const img of productImages) {
    const filename = img.url.replace('/uploads/', '')
    const exists = existingFiles.includes(filename)
    
    if (!exists) {
      issues.push({
        type: 'product_image',
        id: img.id,
        name: img.products.name,
        url: img.url,
        exists: false
      })
    }
  }
  console.log(`✓ Checked ${productImages.length} gallery images, found ${issues.filter(i => i.type === 'product_image').length} missing\n`)

  // Check Media Library
  console.log('Checking Media Library...')
  const mediaItems = await prisma.media.findMany({
    select: { id: true, url: true }
  })
  
  for (const media of mediaItems) {
    if (!media.url.startsWith('/uploads/')) continue
    
    const filename = media.url.replace('/uploads/', '')
    const exists = existingFiles.includes(filename)
    
    if (!exists) {
      issues.push({
        type: 'media',
        id: media.id,
        url: media.url,
        exists: false
      })
    }
  }
  console.log(`✓ Checked ${mediaItems.length} media items, found ${issues.filter(i => i.type === 'media').length} missing\n`)

  // Check Categories
  console.log('Checking Categories...')
  const categories = await prisma.category.findMany({
    select: { id: true, name: true, featuredImageUrl: true }
  })
  
  for (const category of categories) {
    if (!category.featuredImageUrl || !category.featuredImageUrl.startsWith('/uploads/')) continue
    
    const filename = category.featuredImageUrl.replace('/uploads/', '')
    const exists = existingFiles.includes(filename)
    
    if (!exists) {
      issues.push({
        type: 'category',
        id: category.id,
        name: category.name,
        url: category.featuredImageUrl,
        exists: false
      })
    }
  }
  console.log(`✓ Checked ${categories.length} categories, found ${issues.filter(i => i.type === 'category').length} missing images\n`)

  // Print Summary
  console.log('\n' + '='.repeat(80))
  console.log('📊 SUMMARY')
  console.log('='.repeat(80))
  console.log(`Total Issues Found: ${issues.length}`)
  console.log(`  - Products: ${issues.filter(i => i.type === 'product').length}`)
  console.log(`  - Product Gallery: ${issues.filter(i => i.type === 'product_image').length}`)
  console.log(`  - Media Library: ${issues.filter(i => i.type === 'media').length}`)
  console.log(`  - Categories: ${issues.filter(i => i.type === 'category').length}`)
  console.log('='.repeat(80) + '\n')

  // Print detailed issues
  if (issues.length > 0) {
    console.log('❌ MISSING IMAGES:\n')
    issues.forEach((issue, idx) => {
      console.log(`${idx + 1}. [${issue.type.toUpperCase()}] ${issue.name || issue.id}`)
      console.log(`   URL: ${issue.url}`)
      console.log(`   File: ${issue.url.replace('/uploads/', '')}`)
      console.log('')
    })
    
    // Save to file
    const reportPath = path.join(process.cwd(), 'image-issues-report.json')
    fs.writeFileSync(reportPath, JSON.stringify(issues, null, 2))
    console.log(`\n💾 Full report saved to: ${reportPath}`)
  } else {
    console.log('✅ No missing images found!')
  }

  await prisma.$disconnect()
}

diagnoseImages().catch(console.error)
