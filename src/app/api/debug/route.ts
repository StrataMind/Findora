import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    console.log('Debug - Session:', JSON.stringify(session, null, 2))

    // Test basic database connection
    const userCount = await db.user.count().catch(e => {
      console.error('Database connection error:', e)
      return 'ERROR'
    })

    // If user is logged in, get their data
    let userData = null
    if (session?.user?.email) {
      userData = await db.user.findUnique({
        where: { email: session.user.email },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          isSuperuser: true,
          superuserLevel: true,
          createdAt: true
        }
      }).catch(e => {
        console.error('User query error:', e)
        return null
      })
    }

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      session: session || null,
      database: {
        connected: userCount !== 'ERROR',
        userCount: userCount
      },
      currentUser: userData,
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        DATABASE_URL: process.env.DATABASE_URL ? 'SET' : 'NOT SET'
      }
    })

  } catch (error) {
    console.error('Debug endpoint error:', error)
    return NextResponse.json(
      { 
        error: 'Debug endpoint failed',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}