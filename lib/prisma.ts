// /lib/prisma.ts
import { PrismaClient } from "@prisma/client";

/**
 * Create a single PrismaClient across hot reloads (dev)
 * and across RSC/Route handlers. Also logs in dev.
 */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma: PrismaClient =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "warn", "error"] : ["error"],
  });

// Reuse client in dev to avoid exhausting DB connections
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

/** Optional helper to assert env presence when you want */
export function ensurePrismaClient(): PrismaClient {
  if (!process.env.DATABASE_URL) {
    throw new Error(
      "DATABASE_URL is not set. Add it to .env.local (and .env for CLI) and restart the dev server."
    );
  }
  return prisma;
}

export default prisma;
