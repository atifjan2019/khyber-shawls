const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkImages() {
  console.log('\n=== CATEGORY IMAGES ===');
  const categories = await prisma.category.findMany({
    select: { name: true, featuredImageUrl: true }
  });
  categories.forEach(cat => {
    console.log(`${cat.name}: ${cat.featuredImageUrl || 'NULL'}`);
  });

  console.log('\n=== PRODUCT IMAGES (first 5) ===');
  const products = await prisma.product.findMany({
    take: 5,
    select: { name: true, image: true }
  });
  products.forEach(prod => {
    console.log(`${prod.name}: ${prod.image}`);
  });

  await prisma.$disconnect();
}

checkImages().catch(console.error);
