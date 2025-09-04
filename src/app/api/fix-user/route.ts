import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET() {
  return await handleUserFix()
}

export async function POST() {
  return await handleUserFix()
}

async function handleUserFix() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No session found' }, { status: 401 })
    }

    console.log('Fix user - Session data:', {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name
    })

    // Check if user exists by email
    const existingUser = await db.user.findUnique({
      where: { email: session.user.email }
    })

    console.log('Existing user by email:', existingUser)

    // Check if user exists by session ID
    const userById = await db.user.findUnique({
      where: { id: session.user.id }
    })

    console.log('User by session ID:', userById)

    if (existingUser) {
      // Update existing user with session ID
      const updatedUser = await db.user.update({
        where: { email: session.user.email },
        data: {
          id: session.user.id,
          name: session.user.name || existingUser.name,
          // Keep existing CEO privileges if they exist
          isSuperuser: existingUser.isSuperuser || true,
          superuserLevel: existingUser.superuserLevel || 'CEO',
          role: existingUser.role || 'CEO',
          canCreateProducts: true,
          canModerateContent: true,
          canViewAnalytics: true,
          canManageUsers: true,
          canFeatureProducts: true
        }
      })
      
      return NextResponse.json({
        message: 'User updated successfully',
        action: 'updated_existing',
        user: updatedUser
      })
    } else {
      // Create new CEO user
      const newUser = await db.user.create({
        data: {
          id: session.user.id,
          email: session.user.email,
          name: session.user.name || 'CEO',
          role: 'CEO',
          isSuperuser: true,
          superuserLevel: 'CEO',
          superuserSince: new Date(),
          canCreateProducts: true,
          canModerateContent: true,
          canViewAnalytics: true,
          canManageUsers: true,
          canFeatureProducts: true
        }
      })

      return NextResponse.json({
        message: 'CEO user created successfully',
        action: 'created_new',
        user: newUser
      })
    }

  } catch (error) {
    console.error('Error fixing user:', error)
    return NextResponse.json({
      error: 'Database error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}