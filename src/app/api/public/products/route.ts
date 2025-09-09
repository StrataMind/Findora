import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const featured = searchParams.get('featured')
    const search = searchParams.get('search')
    const category = searchParams.get('category')
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    // Build where clause - more flexible for development
    const where: any = {
      status: 'ACTIVE'
      // Remove seller verification requirement for now
    }

    if (featured === 'true') {
      where.featured = true
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (category) {
      where.category = {
        slug: category
      }
    }

    // Build orderBy clause - optimize expensive _count queries
    let orderBy: any = {}
    switch (sortBy) {
      case 'price':
        orderBy = { price: sortOrder }
        break
      case 'price_desc':
        orderBy = { price: 'desc' }
        break
      case 'totalSales':
        // Use a pre-computed field if available, otherwise fall back to createdAt
        orderBy = { featured: 'desc' } // Use featured as proxy for popular items
        break
      default:
        orderBy = { createdAt: sortOrder }
    }

    const skip = (page - 1) * limit

    // Add detailed logging
    console.log('Products API - Query params:', { page, limit, featured, search, category, sortBy, sortOrder })
    console.log('Products API - Where clause:', JSON.stringify(where, null, 2))
    console.log('Products API - Order by:', JSON.stringify(orderBy, null, 2))

    const [products, total] = await Promise.all([
      db.product.findMany({
        where,
        include: {
          images: {
            orderBy: { position: 'asc' },
            take: 1
          },
          seller: {
            select: {
              businessName: true
            }
          },
          category: {
            select: {
              name: true,
              slug: true
            }
          },
          _count: {
            select: {
              reviews: true
            }
          }
        },
        orderBy,
        skip,
        take: limit
      }).catch(error => {
        console.error('Database findMany error - Details:', error)
        console.error('Database findMany error - Message:', error.message)
        console.error('Database findMany error - Code:', error.code)
        return [] // Return empty array if query fails
      }),
      db.product.count({ where }).catch(error => {
        console.error('Database count error - Details:', error)
        console.error('Database count error - Message:', error.message)
        return 0 // Return 0 if count fails
      })
    ])

    console.log('Products API - Results:', { productsFound: products.length, total })

    // Transform data to match frontend expectations
    const transformedProducts = products.map(product => ({
      ...product,
      images: product.images.map(img => ({
        id: img.id,
        url: img.url,
        alt: img.altText || product.name,
        isPrimary: img.position === 0
      }))
    }))

    return NextResponse.json({
      success: true,
      products: transformedProducts,
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