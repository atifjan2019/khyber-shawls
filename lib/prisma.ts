// /lib/prisma.ts
import { PrismaClient } from "@prisma/client";

// ---- Prisma singleton (RSC + HMR safe) ----
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma: PrismaClient =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// ---- Helper used by actions / server code ----
export function ensurePrismaClient(): PrismaClient {
  if (!process.env.DATABASE_URL) {
    throw new Error(
      "DATABASE_URL is not set. Add it to .env.local and restart the dev server."
    );
  }
  return prisma;
}

export default prisma;
