import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient() {
  const databaseUrl = process.env.POSTGRES_PRISMA_URL || process.env.DATABASE_URL
  
  if (!databaseUrl) {
    console.error('No database URL found!')
    console.error('DATABASE_URL:', !!process.env.DATABASE_URL)
    console.error('POSTGRES_PRISMA_URL:', !!process.env.POSTGRES_PRISMA_URL)
    console.error('POSTGRES_URL:', !!process.env.POSTGRES_URL)
    throw new Error('DATABASE_URL must be set')
  }

  console.log('Creating Prisma client with database URL:', databaseUrl.substring(0, 50) + '...')
  
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