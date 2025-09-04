import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get fresh user data from database
    const user = await db.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isSuperuser: true,
        superuserLevel: true
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({
      message: 'Session data refreshed',
      session: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          isSuperuser: user.isSuperuser,
          superuserLevel: user.superuserLevel
        }
      },
      databaseUser: user
    })

  } catch (error) {
    console.error('Error refreshing session:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}