import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient() {
  const databaseUrl = process.env.POSTGRES_PRISMA_URL || process.env.DATABASE_URL
  
  if (!databaseUrl) {
    // Only log boolean existence, never actual URLs or connection strings
    if (process.env.NODE_ENV === 'development') {
      console.error('Database configuration missing')
    }
    throw new Error('DATABASE_URL must be set')
  }

  // Safe logging in development only
  if (process.env.NODE_ENV === 'development') {
    console.log('Initializing database connection...')
  }
  
  return new PrismaClient({
    datasources: {
      db: {
        url: databaseUrl
      }
    },
    log: ['error', 'warn', 'info'],
  })
}

export const db = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db