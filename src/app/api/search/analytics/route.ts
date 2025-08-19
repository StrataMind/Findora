import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Mock popular queries and trending categories for demo
// In a real app, this would come from analytics database
const mockAnalytics = {
  popularQueries: [
    { query: 'iPhone', count: 1245 },
    { query: 'Laptop', count: 987 },
    { query: 'Headphones', count: 756 },
    { query: 'Gaming', count: 654 },
    { query: 'Books', count: 543 },
    { query: 'Home decor', count: 432 },
    { query: 'Fashion', count: 321 },
    { query: 'Sports', count: 287 }
  ],
  trendingCategories: [
    { name: 'Electronics', slug: 'electronics', growth: 23 },
    { name: 'Health & Beauty', slug: 'health-beauty', growth: 18 },
    { name: 'Sports & Outdoors', slug: 'sports-outdoors', growth: 15 },
    { name: 'Home & Garden', slug: 'home-garden', growth: 12 }
  ]
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const timeframe = searchParams.get('timeframe') || '7d' // 7d, 30d, 90d
    const limit = parseInt(searchParams.get('limit') || '10')

    // In a real implementation, you would:
    // 1. Query your analytics database for actual search data
    // 2. Aggregate search queries by frequency
    // 3. Calculate category growth trends
    // 4. Filter by timeframe

    // For demo purposes, we'll return mock data and some real category data
    const categories = await db.category.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        _count: {
          select: {
            products: true
          }
        }
      },
      orderBy: {
        products: {
          _count: 'desc'
        }
      },
      take: limit
    })

    // Enhance categories with mock growth data
    const trendingCategories = categories.map((category, index) => ({
      name: category.name,
      slug: category.slug,
      growth: Math.max(5, 25 - index * 2) // Mock growth percentage
    }))

    return NextResponse.json({
      success: true,
      data: {
        popularQueries: mockAnalytics.popularQueries.slice(0, limit),
        trendingCategories: trendingCategories.slice(0, limit),
        timeframe,
        generatedAt: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('Search analytics error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch search analytics',
        data: mockAnalytics // Fallback to mock data
      },
      { status: 500 }
    )
  }
}

// POST endpoint to track search queries (for building real analytics)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { query, results_count, user_id, filters, timestamp } = body

    // In a real implementation, you would:
    // 1. Store search queries in an analytics table
    // 2. Track user behavior and search patterns
    // 3. Store filter usage statistics
    // 4. Calculate search success rates

    // For now, we'll just log the search for development
    console.log('Search tracked:', {
      query,
      results_count,
      user_id,
      filters,
      timestamp: timestamp || new Date().toISOString()
    })

    // You could store this in a dedicated analytics table:
    /*
    await db.searchAnalytics.create({
      data: {
        query: query.toLowerCase().trim(),
        resultsCount: results_count,
        userId: user_id,
        filters: JSON.stringify(filters),
        timestamp: new Date(timestamp || Date.now())
      }
    })
    */

    return NextResponse.json({
      success: true,
      message: 'Search analytics tracked'
    })

  } catch (error) {
    console.error('Search tracking error:', error)
    return NextResponse.json(
      { error: 'Failed to track search analytics' },
      { status: 500 }
    )
  }
}