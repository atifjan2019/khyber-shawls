// lib/prisma.ts
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma: PrismaClient =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

/**
 * Back-compat shim so old imports keep working:
 *   import { ensurePrismaClient } from "@/lib/prisma"
 * Now just returns the singleton `prisma`.
 */
export function ensurePrismaClient(): PrismaClient {
  return prisma;
}
