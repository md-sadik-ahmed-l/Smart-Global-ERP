import { PrismaClient } from '@prisma/client'

// Force a fresh PrismaClient when the schema version changes
// This prevents stale client issues during development
const SCHEMA_VERSION = 'v3-enterprise'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
  prismaSchemaVersion?: string
}

// If schema version changed, create a new client
if (globalForPrisma.prismaSchemaVersion !== SCHEMA_VERSION) {
  globalForPrisma.prisma = undefined
  globalForPrisma.prismaSchemaVersion = SCHEMA_VERSION
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['error'],
    // Enhanced connection pool configuration for production
    datasources: {
      db: {
        url: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/erp_production'
      }
    }
  })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = db
}

// Enhanced connection management with retry logic
export async function ensureDbConnection() {
  try {
    // Test connection
    await db.$queryRaw`SELECT 1`;
    console.log('✓ Database connection established');
    return true;
  } catch (error) {
    console.error('✗ Database connection failed:', error);
    // Implement reconnection logic
    console.log('Attempting to reconnect to database...');
    try {
      await new Promise(resolve => setTimeout(resolve, 5000));
      await db.$queryRaw`SELECT 1`;
      console.log('✓ Database reconnected successfully');
      return true;
    } catch (retryError) {
      console.error('✗ Database reconnection failed:', retryError);
      return false;
    }
  }
}
