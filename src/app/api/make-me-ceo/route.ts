import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No session found' }, { status: 401 })
    }

    console.log('Making CEO - Session:', session.user)

    // Create or update user as CEO
    const user = await db.user.upsert({
      where: { id: session.user.id },
      update: {
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
      },
      create: {
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

    // Create official seller profile
    const sellerProfile = await db.sellerProfile.upsert({
      where: { userId: user.id },
      update: {
        verificationStatus: 'VERIFIED',
        isOfficial: true,
        accountType: 'OFFICIAL',
        autoVerified: true,
        verifiedAt: new Date()
      },
      create: {
        userId: user.id,
        businessName: `${user.name || 'CEO'} - Findora Official`,
        businessType: 'CORPORATION',
        verificationStatus: 'VERIFIED',
        isOfficial: true,
        accountType: 'OFFICIAL',
        autoVerified: true,
        description: 'Official Findora CEO store',
        businessEmail: user.email,
        phone: '+91-9999999999',
        addressLine1: 'Findora HQ',
        city: 'Mangalore',
        state: 'Karnataka',
        country: 'India',
        postalCode: '575001',
        taxId: 'CEO_OFFICIAL',
        businessLicense: 'OFFICIAL_CEO',
        contactPersonName: user.name || 'CEO',
        termsAccepted: true,
        termsAcceptedAt: new Date(),
        verifiedAt: new Date(),
        productCategories: ['all']
      }
    })

    return NextResponse.json({
      message: 'Successfully created CEO user and seller profile',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        isSuperuser: user.isSuperuser
      },
      sellerProfile: {
        id: sellerProfile.id,
        businessName: sellerProfile.businessName,
        verificationStatus: sellerProfile.verificationStatus,
        isOfficial: sellerProfile.isOfficial
      }
    })

  } catch (error) {
    console.error('Error creating CEO:', error)
    return NextResponse.json({
      error: 'Failed to create CEO',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}