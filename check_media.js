const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkMedia() {
  console.log('\n=== ALL MEDIA UPLOADS (Last 10) ===');
  const media = await prisma.media.findMany({
    orderBy: { createdAt: 'desc' },
    take: 10,
    select: { url: true, createdAt: true }
  });
  media.forEach(m => {
    console.log(`${m.createdAt.toISOString().slice(0,19)}: ${m.url}`);
  });

  await prisma.$disconnect();
}

checkMedia().catch(console.error);
