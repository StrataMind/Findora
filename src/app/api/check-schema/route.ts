import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

export async function GET() {
  try {
    const prisma = new PrismaClient()
    
    // Check if User table exists and has superuser fields
    const userWithSuperuserFields = await prisma.user.findFirst({
      select: {
        id: true,
        email: true,
        role: true,
        isSuperuser: true,
        superuserLevel: true,
        canCreateProducts: true,
        canModerateContent: true,
        canViewAnalytics: true,
        canManageUsers: true,
        canFeatureProducts: true
      }
    })
    
    await prisma.$disconnect()
    
    return NextResponse.json({
      success: true,
      message: 'Schema check successful - all superuser fields exist',
      sampleUser: userWithSuperuserFields,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('Schema check failed:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Schema check failed - superuser fields may be missing',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}