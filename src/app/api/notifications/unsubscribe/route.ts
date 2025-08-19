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
    const { userId, endpoint } = body

    // Validate required fields
    if (!userId || !endpoint) {
      return NextResponse.json(
        { error: 'Missing required fields: userId and endpoint' },
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

    // Unregister push subscription with notification service
    const success = await notificationService.unregisterPushSubscription(userId, endpoint)

    if (success) {
      console.log(`Push subscription removed for user ${userId}:`, {
        endpoint: endpoint.substring(0, 50) + '...',
        timestamp: new Date()
      })

      return NextResponse.json({
        success: true,
        message: 'Push subscription removed successfully'
      })
    } else {
      throw new Error('Failed to remove push subscription')
    }

  } catch (error) {
    console.error('Push unsubscription error:', error)
    return NextResponse.json(
      { error: 'Failed to remove push subscription' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json(
    { message: 'Push unsubscription endpoint. Use POST method.' },
    { status: 405 }
  )
}