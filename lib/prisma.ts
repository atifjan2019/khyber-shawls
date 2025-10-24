import { PrismaClient } from "@prisma/client"

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient | null
}

function createPrismaClient() {
  return new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  })
}

const hasDatabaseUrl = Boolean(process.env.DATABASE_URL)

export const prisma: PrismaClient | null = hasDatabaseUrl
  ? globalForPrisma.prisma ?? createPrismaClient()
  : null

if (hasDatabaseUrl && process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma
}

export function ensurePrismaClient(): PrismaClient {
  if (!prisma) {
    throw new Error(
      "DATABASE_URL is not configured. Add it to your environment (e.g. .env.local) to enable database features."
    )
  }

  return prisma
}
