import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    // Check all CEO users
    const ceoUsers = await db.user.findMany({
      where: { 
        isSuperuser: true, 
        superuserLevel: 'CEO' 
      },
      include: { 
        sellerProfile: true 
      }
    })

    // Check all seller profiles
    const allSellerProfiles = await db.sellerProfile.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            isSuperuser: true,
            superuserLevel: true
          }
        }
      }
    })

    return NextResponse.json({
      ceoUsers: ceoUsers,
      totalCeoUsers: ceoUsers.length,
      ceoUsersWithProfile: ceoUsers.filter(u => u.sellerProfile).length,
      allSellerProfiles: allSellerProfiles,
      totalSellerProfiles: allSellerProfiles.length
    })

  } catch (error) {
    console.error('Error checking CEO status:', error)
    return NextResponse.json({
      error: 'Failed to check CEO status',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}