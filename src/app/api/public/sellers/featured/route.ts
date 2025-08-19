import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = Math.min(parseInt(searchParams.get('limit') || '6'), 20)

    // Try to get verified sellers with good ratings first
    let sellers = await db.sellerProfile.findMany({
      where: {
        verificationStatus: 'VERIFIED',
        averageRating: { gte: 4.0 }
      },
      select: {
        id: true,
        businessName: true,
        description: true,
        logoUrl: true,
        verificationStatus: true,
        averageRating: true,
        totalSales: true,
        createdAt: true,
        _count: {
          select: {
            products: true
          }
        }
      },
      orderBy: [
        { averageRating: 'desc' },
        { totalSales: 'desc' }
      ],
      take: limit
    })

    // If no verified sellers with high ratings, get any verified sellers
    if (sellers.length === 0) {
      sellers = await db.sellerProfile.findMany({
        where: {
          verificationStatus: 'VERIFIED'
        },
        select: {
          id: true,
          businessName: true,
          description: true,
          logoUrl: true,
          verificationStatus: true,
          averageRating: true,
          totalSales: true,
          createdAt: true,
          _count: {
            select: {
              products: true
            }
          }
        },
        orderBy: [
          { totalSales: 'desc' },
          { createdAt: 'desc' }
        ],
        take: limit
      })
    }

    // If still no sellers, get any sellers for development
    if (sellers.length === 0) {
      sellers = await db.sellerProfile.findMany({
        select: {
          id: true,
          businessName: true,
          description: true,
          logoUrl: true,
          verificationStatus: true,
          averageRating: true,
          totalSales: true,
          createdAt: true,
          _count: {
            select: {
              products: true
            }
          }
        },
        orderBy: [
          { createdAt: 'desc' }
        ],
        take: limit
      })
    }

    const formattedSellers = sellers.map(seller => ({
      ...seller,
      logo: seller.logoUrl,
      totalProducts: seller._count.products,
      totalReviews: 0 // Remove reviews count since SellerProfile doesn't have direct reviews
    }))

    return NextResponse.json({
      success: true,
      sellers: formattedSellers
    })

  } catch (error) {
    console.error('Featured sellers API error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch featured sellers',
        sellers: []
      },
      { status: 500 }
    )
  }
}