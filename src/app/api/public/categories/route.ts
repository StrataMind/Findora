import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 50)
    const withProductCount = searchParams.get('withProductCount') === 'true'

    const categories = await db.category.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        image: true,
        ...(withProductCount && {
          _count: {
            select: {
              products: {
                where: {
                  status: 'ACTIVE',
                  inventory: { gt: 0 }
                }
              }
            }
          }
        })
      },
      orderBy: withProductCount ? {
        products: {
          _count: 'desc'
        }
      } : {
        name: 'asc'
      },
      take: limit
    })

    return NextResponse.json({
      success: true,
      categories
    })

  } catch (error) {
    console.error('Categories API error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch categories',
        categories: []
      },
      { status: 500 }
    )
  }
}