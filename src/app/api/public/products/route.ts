import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    const featured = searchParams.get('featured')

    const skip = (page - 1) * limit

    // Build where clause for public products (only ACTIVE status)
    const where: any = {
      status: 'ACTIVE',
      inventory: { gt: 0 }, // Only show products in stock
      seller: {
        verificationStatus: 'VERIFIED' // Only show products from verified sellers
      }
    }

    // Add category filter
    if (category && category !== 'all') {
      where.categoryId = category
    }

    // Add search filter
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { tags: { hasSome: [search] } }
      ]
    }

    // Add price range filter
    if (minPrice || maxPrice) {
      where.price = {}
      if (minPrice) where.price.gte = parseFloat(minPrice)
      if (maxPrice) where.price.lte = parseFloat(maxPrice)
    }

    // Add featured filter
    if (featured === 'true') {
      where.featured = true
    }

    // Build orderBy clause
    const orderBy: any = {}
    if (sortBy === 'price') {
      orderBy.price = sortOrder
    } else if (sortBy === 'name') {
      orderBy.name = sortOrder
    } else if (sortBy === 'rating') {
      // For rating, we'll sort by average rating (to be calculated)
      orderBy.createdAt = 'desc' // Fallback for now
    } else {
      orderBy.createdAt = sortOrder
    }

    // Get products with pagination
    const [products, total] = await Promise.all([
      db.product.findMany({
        where,
        include: {
          images: {
            orderBy: { position: 'asc' },
            take: 1 // Just the first image for listing
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
              businessName: true,
              verificationStatus: true,
              averageRating: true,
              totalRatings: true
            }
          },
          reviews: {
            select: {
              rating: true
            }
          },
          _count: {
            select: {
              reviews: true,
              orderItems: true
            }
          }
        },
        orderBy,
        skip,
        take: limit
      }),
      db.product.count({ where })
    ])

    // Calculate average rating for each product
    const productsWithRating = products.map(product => {
      const avgRating = product.reviews.length > 0
        ? product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length
        : 0

      return {
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        compareAtPrice: product.compareAtPrice,
        slug: product.slug,
        featured: product.featured,
        inventory: product.inventory,
        images: product.images,
        category: product.category,
        seller: {
          businessName: product.seller.businessName,
          verificationStatus: product.seller.verificationStatus,
          averageRating: product.seller.averageRating,
          totalRatings: product.seller.totalRatings
        },
        averageRating: Math.round(avgRating * 10) / 10,
        totalReviews: product._count.reviews,
        totalSales: product._count.orderItems,
        tags: product.tags
      }
    })

    return NextResponse.json({
      success: true,
      products: productsWithRating,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Get public products error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}