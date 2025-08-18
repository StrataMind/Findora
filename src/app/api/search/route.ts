import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    const limit = parseInt(searchParams.get('limit') || '10')

    if (!query || query.length < 2) {
      return NextResponse.json({
        suggestions: [],
        message: 'Query must be at least 2 characters'
      })
    }

    // Search products
    const products = await db.product.findMany({
      where: {
        AND: [
          {
            OR: [
              { name: { contains: query, mode: 'insensitive' } },
              { description: { contains: query, mode: 'insensitive' } },
              { tags: { hasSome: [query] } }
            ]
          },
          { status: 'ACTIVE' },
          { inventory: { gt: 0 } },
          {
            seller: {
              verificationStatus: 'VERIFIED'
            }
          }
        ]
      },
      select: {
        id: true,
        name: true,
        slug: true,
        images: {
          select: {
            url: true
          },
          take: 1,
          orderBy: {
            position: 'asc'
          }
        }
      },
      take: Math.floor(limit * 0.7), // 70% products
      orderBy: [
        { featured: 'desc' },
        { totalSales: 'desc' },
        { createdAt: 'desc' }
      ]
    })

    // Search categories
    const categories = await db.category.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } }
        ]
      },
      select: {
        id: true,
        name: true,
        slug: true,
        image: true,
        _count: {
          select: {
            products: true
          }
        }
      },
      take: Math.ceil(limit * 0.3), // 30% categories
      orderBy: {
        _count: {
          products: 'desc'
        }
      }
    })

    // Format suggestions
    const suggestions = [
      ...products.map(product => ({
        id: product.id,
        name: product.name,
        type: 'product' as const,
        slug: product.slug,
        image: product.images[0]?.url
      })),
      ...categories.map(category => ({
        id: category.id,
        name: category.name,
        type: 'category' as const,
        slug: category.slug,
        image: category.image
      }))
    ]

    // Sort by relevance (exact matches first, then partial matches)
    suggestions.sort((a, b) => {
      const aExact = a.name.toLowerCase() === query.toLowerCase()
      const bExact = b.name.toLowerCase() === query.toLowerCase()
      const aStarts = a.name.toLowerCase().startsWith(query.toLowerCase())
      const bStarts = b.name.toLowerCase().startsWith(query.toLowerCase())

      if (aExact && !bExact) return -1
      if (!aExact && bExact) return 1
      if (aStarts && !bStarts) return -1
      if (!aStarts && bStarts) return 1
      
      return a.name.localeCompare(b.name)
    })

    return NextResponse.json({
      suggestions: suggestions.slice(0, limit),
      total: suggestions.length
    })

  } catch (error) {
    console.error('Search API error:', error)
    return NextResponse.json(
      { 
        error: 'Search failed',
        suggestions: []
      },
      { status: 500 }
    )
  }
}