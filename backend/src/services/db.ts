import { PrismaClient } from '@prisma/client';
import logger from '../utils/logger.js';
import config from '../config/index.js';

declare global {
  var prismaClient: PrismaClient | undefined;
}

export const prisma: PrismaClient =
  globalThis.prismaClient ||
  new PrismaClient({
    log: config.isProduction ? ['error', 'warn'] : ['query', 'error', 'warn'],
  });

if (!config.isProduction) {
  globalThis.prismaClient = prisma;
}

export async function checkDatabaseConnection(): Promise<{ connected: boolean; latencyMs?: number; error?: string }> {
  const start = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    const latencyMs = Date.now() - start;
    return { connected: true, latencyMs };
  } catch (err: any) {
    logger.error('Database health check failed:', err.message);
    return { connected: false, error: err.message };
  }
}

export default prisma;
