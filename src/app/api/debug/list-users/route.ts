import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const users = await db.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isSuperuser: true,
        superuserLevel: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({
      totalUsers: users.length,
      users: users
    })
  } catch (error) {
    console.error('Error listing users:', error)
    return NextResponse.json({
      error: 'Database error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}