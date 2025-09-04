import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    console.log('User status endpoint called')
    
    const session = await getServerSession(authOptions)
    console.log('Session obtained:', !!session?.user?.email)
    
    if (!session?.user?.email) {
      console.log('No session found, returning 401')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Test database connection first
    try {
      await db.$queryRaw`SELECT 1 as test`
      console.log('Database connection successful')
    } catch (dbError) {
      console.error('Database connection failed:', dbError)
      return NextResponse.json({ 
        error: 'Database connection failed', 
        details: dbError instanceof Error ? dbError.message : 'Unknown error'
      }, { status: 500 })
    }

    // Get fresh user data from database with seller profile
    console.log('Fetching user status for:', session.user.email)
    const user = await db.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isSuperuser: true,
        superuserLevel: true,
        canCreateProducts: true,
        canModerateContent: true,
        canViewAnalytics: true,
        canManageUsers: true,
        canFeatureProducts: true,
        sellerProfile: {
          select: {
            id: true,
            verificationStatus: true,
            isOfficial: true
          }
        }
      }
    })
    
    console.log('User data from database:', user)

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({
      id: user.id,
      role: user.role,
      isSuperuser: user.isSuperuser,
      superuserLevel: user.superuserLevel,
      isVerifiedSeller: user.sellerProfile?.verificationStatus === 'VERIFIED',
      sellerProfile: user.sellerProfile,
      permissions: {
        canCreateProducts: user.canCreateProducts,
        canModerateContent: user.canModerateContent,
        canViewAnalytics: user.canViewAnalytics,
        canManageUsers: user.canManageUsers,
        canFeatureProducts: user.canFeatureProducts
      }
    })

  } catch (error) {
    console.error('Error fetching user status:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}