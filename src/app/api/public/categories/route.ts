import { NextRequest, NextResponse } from 'next/server'
import { mockCategories } from '@/lib/mock-data'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 50)

    const categories = mockCategories.slice(0, limit)

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