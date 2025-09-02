import { NextRequest, NextResponse } from 'next/server'
import { mockProducts } from '@/lib/mock-data'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const featured = searchParams.get('featured')

    let products = [...mockProducts]
    
    if (featured === 'true') {
      products = products.filter(p => p.featured)
    }

    const skip = (page - 1) * limit
    const paginatedProducts = products.slice(skip, skip + limit)

    return NextResponse.json({
      success: true,
      products: paginatedProducts,
      pagination: {
        page,
        limit,
        total: products.length,
        pages: Math.ceil(products.length / limit)
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