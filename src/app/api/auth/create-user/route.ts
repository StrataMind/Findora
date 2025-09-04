import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No session found' }, { status: 401 })
    }

    // Check if user already exists in database
    const existingUser = await db.user.findUnique({
      where: { email: session.user.email }
    }).catch(error => {
      console.error('Database findUnique error:', error)
      return null
    })

    if (!existingUser) {
      // Create new user from session data
      const newUser = await db.user.create({
        data: {
          email: session.user.email,
          name: session.user.name || '',
          image: session.user.image,
          role: 'BUYER',
          emailVerified: new Date(), // OAuth emails are pre-verified
        }
      }).catch(error => {
        console.error('Database create error:', error)
        throw new Error('Failed to create user in database')
      })

      return NextResponse.json({ 
        success: true, 
        message: 'User created successfully',
        user: {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
          role: newUser.role
        }
      })
    }

    return NextResponse.json({ 
      success: true, 
      message: 'User already exists',
      user: {
        id: existingUser.id,
        email: existingUser.email,
        name: existingUser.name,
        role: existingUser.role
      }
    })

  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    )
  }
}