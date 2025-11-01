#!/usr/bin/env node
/**
 * Fix Image URLs Script
 * 
 * This script fixes image URLs in the database that have timestamp prefixes
 * but the actual files don't have those prefixes.
 */

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function fixImageUrls() {
  console.log('\n🔍 Checking for broken image references...\n');

  // Get all actual files in uploads directory
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
  const actualFiles = fs.readdirSync(uploadsDir).filter(f => f !== '.gitkeep');
  
  console.log(`Found ${actualFiles.length} files in /public/uploads/\n`);

  // Check products
  const products = await prisma.product.findMany({
    select: { id: true, name: true, image: true }
  });

  let fixedCount = 0;

  for (const product of products) {
    if (!product.image) continue;
    
    const filename = product.image.replace('/uploads/', '');
    const fileExists = actualFiles.includes(filename);

    if (!fileExists) {
      // Try to find the file without timestamp prefix
      const possibleMatches = actualFiles.filter(f => {
        // Check if file ends with the same name (after removing timestamp)
        const match = f.match(/^\d+-(.+)$/) || [null, f];
        const nameWithoutTimestamp = match[1];
        return filename.includes(nameWithoutTimestamp) || nameWithoutTimestamp === filename.replace(/^\d+-/, '');
      });

      if (possibleMatches.length > 0) {
        const correctFile = possibleMatches[0];
        const newUrl = `/uploads/${correctFile}`;
        
        console.log(`❌ Product "${product.name}"`);
        console.log(`   Old: ${product.image}`);
        console.log(`   New: ${newUrl}`);
        
        await prisma.product.update({
          where: { id: product.id },
          data: { image: newUrl }
        });
        
        fixedCount++;
        console.log(`   ✅ Fixed!\n`);
      } else {
        console.log(`⚠️  Product "${product.name}" - No match found for: ${product.image}\n`);
      }
    }
  }

  // Check categories
  const categories = await prisma.category.findMany({
    where: { featuredImageUrl: { not: null } },
    select: { id: true, name: true, featuredImageUrl: true }
  });

  for (const category of categories) {
    if (!category.featuredImageUrl) continue;
    
    const filename = category.featuredImageUrl.replace('/uploads/', '');
    const fileExists = actualFiles.includes(filename) || actualFiles.includes(decodeURIComponent(filename));

    if (!fileExists) {
      console.log(`⚠️  Category "${category.name}" - File not found: ${category.featuredImageUrl}\n`);
    }
  }

  // Check media table
  const media = await prisma.media.findMany({
    select: { id: true, url: true }
  });

  for (const m of media) {
    const filename = m.url.replace('/uploads/', '');
    const fileExists = actualFiles.includes(filename);

    if (!fileExists) {
      const possibleMatches = actualFiles.filter(f => {
        const match = f.match(/^\d+-(.+)$/) || [null, f];
        const nameWithoutTimestamp = match[1];
        return filename.includes(nameWithoutTimestamp) || nameWithoutTimestamp === filename.replace(/^\d+-/, '');
      });

      if (possibleMatches.length > 0) {
        const correctFile = possibleMatches[0];
        const newUrl = `/uploads/${correctFile}`;
        
        console.log(`❌ Media ${m.id}`);
        console.log(`   Old: ${m.url}`);
        console.log(`   New: ${newUrl}`);
        
        await prisma.media.update({
          where: { id: m.id },
          data: { url: newUrl }
        });
        
        fixedCount++;
        console.log(`   ✅ Fixed!\n`);
      }
    }
  }

  console.log(`\n✨ Fixed ${fixedCount} image references\n`);
  
  await prisma.$disconnect();
}

fixImageUrls().catch(console.error);
