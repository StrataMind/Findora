import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// This is a one-time setup endpoint - remove after use
export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()
    
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    // Find user by email
    const user = await db.user.findUnique({
      where: { email },
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

    if (user.isSuperuser) {
      return NextResponse.json({ 
        message: 'User is already a superuser',
        user: {
          email: user.email,
          name: user.name,
          role: user.role,
          superuserLevel: user.superuserLevel
        }
      })
    }

    // Update user to CEO
    const updatedUser = await db.user.update({
      where: { email },
      data: {
        role: 'CEO',
        isSuperuser: true,
        superuserLevel: 'CEO',
        superuserSince: new Date(),
        canCreateProducts: true,
        canModerateContent: true,
        canViewAnalytics: true,
        canManageUsers: true,
        canFeatureProducts: true,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isSuperuser: true,
        superuserLevel: true,
        canCreateProducts: true
      }
    })

    return NextResponse.json({
      message: 'CEO setup successful!',
      user: updatedUser
    })

  } catch (error) {
    console.error('CEO setup error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}