import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const { productIds } = await request.json()

    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return NextResponse.json({
        error: 'Product IDs array is required'
      }, { status: 400 })
    }

    // Limit to 50 products max for performance
    const limitedIds = productIds.slice(0, 50)

    const products = await db.product.findMany({
      where: {
        id: { in: limitedIds },
        status: 'ACTIVE'
      },
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        compareAtPrice: true,
        slug: true,
        featured: true,
        inventory: true,
        averageRating: true,
        totalReviews: true,
        totalSales: true,
        tags: true,
        createdAt: true,
        images: {
          select: {
            id: true,
            url: true,
            altText: true
          },
          orderBy: {
            position: 'asc'
          },
          take: 1
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        },
        seller: {
          select: {
            id: true,
            businessName: true,
            verificationStatus: true,
            averageRating: true,
            _count: {
              select: {
                reviews: true
              }
            }
          }
        }
      }
    })

    // Transform the data to match the expected format
    const formattedProducts = products.map(product => ({
      ...product,
      seller: {
        ...product.seller,
        totalRatings: product.seller._count.reviews
      }
    }))

    return NextResponse.json({
      success: true,
      products: formattedProducts
    })

  } catch (error) {
    console.error('Batch products API error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch products',
        products: []
      },
      { status: 500 }
    )
  }
}