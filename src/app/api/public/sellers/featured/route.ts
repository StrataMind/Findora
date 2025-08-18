import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = Math.min(parseInt(searchParams.get('limit') || '6'), 20)

    const sellers = await db.seller.findMany({
      where: {
        verificationStatus: 'VERIFIED',
        averageRating: { gte: 4.0 }
      },
      select: {
        id: true,
        businessName: true,
        description: true,
        logo: true,
        verificationStatus: true,
        averageRating: true,
        totalSales: true,
        createdAt: true,
        _count: {
          select: {
            products: true,
            reviews: true
          }
        }
      },
      orderBy: [
        { averageRating: 'desc' },
        { totalSales: 'desc' }
      ],
      take: limit
    })

    const formattedSellers = sellers.map(seller => ({
      ...seller,
      totalProducts: seller._count.products,
      totalReviews: seller._count.reviews
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