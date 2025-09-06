import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

// SECURITY: This endpoint is disabled for security reasons
// CEO privileges should only be granted through proper admin channels
export async function GET() {
  return NextResponse.json({ 
    error: 'Endpoint disabled for security reasons. Contact system administrator.' 
  }, { status: 403 })
}

// Secure function for admin use only - requires proper authentication
async function secureCreateCEO(requestingUserId: string, targetUserEmail: string) {
  try {
    // Verify the requesting user is already a CEO/ADMIN
    const requestingUser = await db.user.findUnique({
      where: { id: requestingUserId },
      select: { role: true, isSuperuser: true }
    })

    if (!requestingUser?.isSuperuser || requestingUser.role !== 'CEO') {
      throw new Error('Insufficient privileges to create CEO')
    }

    // Find target user
    const targetUser = await db.user.findUnique({
      where: { email: targetUserEmail }
    })

    if (!targetUser) {
      throw new Error('Target user not found')
    }

    // Update target user to CEO with proper audit trail
    const user = await db.user.update({
      where: { id: targetUser.id },
      data: {
        role: 'CEO',
        isSuperuser: true,
        superuserLevel: 'CEO',
        superuserSince: new Date(),
        grantedBy: requestingUserId,
        canCreateProducts: true,
        canModerateContent: true,
        canViewAnalytics: true,
        canManageUsers: true,
        canFeatureProducts: true
      }
    })

    // Log the privilege escalation for audit
    await db.superuserActivity.create({
      data: {
        userId: requestingUserId,
        action: 'GRANT_CEO_PRIVILEGES',
        target: targetUser.id,
        details: {
          targetEmail: targetUserEmail,
          timestamp: new Date().toISOString(),
          reason: 'Manual CEO privilege grant'
        }
      }
    })

    return {
      success: true,
      message: 'CEO privileges granted successfully',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    }

  } catch (error) {
    throw new Error(`Failed to grant CEO privileges: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

// This function is kept for internal use only and is not exported as an API endpoint