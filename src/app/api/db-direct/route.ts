import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

export async function GET() {
  try {
    console.log('Direct DB test starting...')
    
    // Create a new client directly
    const prisma = new PrismaClient({
      log: ['error', 'warn'],
    })
    
    console.log('Prisma client created')
    
    // Test basic connection
    const result = await prisma.$queryRaw`SELECT 1 as test`
    console.log('Query executed successfully:', result)
    
    // Test user table exists
    const userCount = await prisma.user.count()
    console.log('User count:', userCount)
    
    await prisma.$disconnect()
    
    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      result: result,
      userCount: userCount,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('Direct DB test failed:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      code: error.code || 'UNKNOWN',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}