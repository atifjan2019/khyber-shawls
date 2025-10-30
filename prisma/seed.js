import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
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
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
