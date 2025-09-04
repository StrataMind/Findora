import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({
        error: 'No session found',
        session: null
      })
    }

    // Get user data from database
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isSuperuser: true,
        superuserLevel: true,
        superuserSince: true,
        canCreateProducts: true,
        canModerateContent: true,
        canViewAnalytics: true,
        canManageUsers: true,
        canFeatureProducts: true
      }
    })

    return NextResponse.json({
      sessionUserId: session.user.id,
      sessionUserEmail: session.user.email,
      databaseUser: user,
      isSuperuserCheck: {
        userExists: !!user,
        isSuperuser: user?.isSuperuser || false,
        wouldRedirect: !user || !user.isSuperuser
      }
    })
  } catch (error) {
    console.error('Debug superuser status error:', error)
    return NextResponse.json({
      error: 'Database error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}