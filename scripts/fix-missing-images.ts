import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'

const prisma = new PrismaClient()

// Configuration: Choose your fix strategy
const PLACEHOLDER_IMAGE = '/placeholder.svg' // Fallback to existing placeholder
const DRY_RUN = true // Set to false to actually make changes

async function fixMissingImages() {
    console.log('🔧 Fixing missing image references...')
    console.log(`Mode: ${DRY_RUN ? 'DRY RUN (no changes will be made)' : 'LIVE (changes will be applied)'}\n`)

    const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
    const existingFiles = fs.readdirSync(uploadsDir).filter(f => f !== '.gitkeep')

    let fixedCount = 0

    // Fix Products
    console.log('Fixing Products...')
    const products = await prisma.product.findMany({
        select: { id: true, name: true, image: true }
    })

    for (const product of products) {
        if (!product.image) continue

        const filename = product.image.replace('/uploads/', '')
        const exists = existingFiles.includes(filename)

        if (!exists) {
            console.log(`❌ Product: ${product.name}`)
            console.log(`   Missing: ${product.image}`)
            console.log(`   Fix: ${PLACEHOLDER_IMAGE}`)

            if (!DRY_RUN) {
                await prisma.product.update({
                    where: { id: product.id },
                    data: { image: PLACEHOLDER_IMAGE }
                })
            }

            fixedCount++
            console.log('')
        }
    }

    // Fix Product Images
    console.log('Fixing Product Gallery Images...')
    const productImages = await prisma.product_images.findMany({
        select: { id: true, url: true, products: { select: { name: true } } }
    })

    for (const img of productImages) {
        const filename = img.url.replace('/uploads/', '')
        const exists = existingFiles.includes(filename)

        if (!exists) {
            console.log(`❌ Gallery Image for: ${img.products.name}`)
            console.log(`   Missing: ${img.url}`)
            console.log(`   Action: DELETE (gallery images can be removed)`)

            if (!DRY_RUN) {
                await prisma.product_images.delete({
                    where: { id: img.id }
                })
            }

            fixedCount++
            console.log('')
        }
    }

    // Fix Media Library
    console.log('Fixing Media Library...')
    const mediaItems = await prisma.media.findMany({
        select: { id: true, url: true }
    })

    for (const media of mediaItems) {
        if (!media.url.startsWith('/uploads/')) continue

        const filename = media.url.replace('/uploads/', '')
        const exists = existingFiles.includes(filename)

        if (!exists) {
            console.log(`❌ Media: ${media.id}`)
            console.log(`   Missing: ${media.url}`)
            console.log(`   Action: DELETE (orphaned media record)`)

            if (!DRY_RUN) {
                await prisma.media.delete({
                    where: { id: media.id }
                })
            }

            fixedCount++
            console.log('')
        }
    }

    // Fix Categories
    console.log('Fixing Categories...')
    const categories = await prisma.category.findMany({
        select: { id: true, name: true, featuredImageUrl: true }
    })

    for (const category of categories) {
        if (!category.featuredImageUrl || !category.featuredImageUrl.startsWith('/uploads/')) continue

        const filename = category.featuredImageUrl.replace('/uploads/', '')
        const exists = existingFiles.includes(filename)

        if (!exists) {
            console.log(`❌ Category: ${category.name}`)
            console.log(`   Missing: ${category.featuredImageUrl}`)
            console.log(`   Fix: Set to NULL (optional field)`)

            if (!DRY_RUN) {
                await prisma.category.update({
                    where: { id: category.id },
                    data: { featuredImageUrl: null }
                })
            }

            fixedCount++
            console.log('')
        }
    }

    console.log('\n' + '='.repeat(80))
    console.log('📊 SUMMARY')
    console.log('='.repeat(80))
    console.log(`Total Issues ${DRY_RUN ? 'Found' : 'Fixed'}: ${fixedCount}`)
    console.log('='.repeat(80))

    if (DRY_RUN) {
        console.log('\n⚠️  This was a DRY RUN - no changes were made.')
        console.log('To apply fixes, edit the script and set DRY_RUN = false\n')
    } else {
        console.log('\n✅ All fixes applied successfully!\n')
    }

    await prisma.$disconnect()
}

fixMissingImages().catch(console.error)
