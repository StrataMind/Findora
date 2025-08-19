import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import notificationService from '@/lib/notifications'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { userId, subscription } = body

    // Validate required fields
    if (!userId || !subscription) {
      return NextResponse.json(
        { error: 'Missing required fields: userId and subscription' },
        { status: 400 }
      )
    }

    // Validate subscription format
    if (!subscription.endpoint || !subscription.keys || !subscription.keys.p256dh || !subscription.keys.auth) {
      return NextResponse.json(
        { error: 'Invalid subscription format' },
        { status: 400 }
      )
    }

    // Ensure user can only manage their own subscriptions
    if (userId !== session.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized: Can only manage own subscriptions' },
        { status: 403 }
      )
    }

    // Register push subscription with notification service
    const success = await notificationService.registerPushSubscription(userId, subscription)

    if (success) {
      console.log(`Push subscription registered for user ${userId}:`, {
        endpoint: subscription.endpoint.substring(0, 50) + '...',
        timestamp: new Date()
      })

      return NextResponse.json({
        success: true,
        message: 'Push subscription registered successfully'
      })
    } else {
      throw new Error('Failed to register push subscription')
    }

  } catch (error) {
    console.error('Push subscription error:', error)
    return NextResponse.json(
      { error: 'Failed to register push subscription' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json(
    { message: 'Push subscription endpoint. Use POST method.' },
    { status: 405 }
  )
}