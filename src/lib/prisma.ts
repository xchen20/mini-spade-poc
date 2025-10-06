import { PrismaClient } from '@prisma/client';

// This prevents Prisma from creating too many connections in a serverless environment
// during development with hot-reloading.

declare global {
  // allow global `var` declarations
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

export const prisma =
  global.prisma ||
  new PrismaClient();

if (process.env.NODE_ENV !== 'production') global.prisma = prisma;