import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const sellerId = searchParams.get('sellerId')
    const days = parseInt(searchParams.get('days') || '30')
    const productId = searchParams.get('productId') // Optional: get analytics for specific product

    // Verify user is the seller or has access
    const seller = await db.seller.findFirst({
      where: {
        id: sellerId || undefined,
        userId: session.user.id
      }
    })

    if (!seller) {
      return NextResponse.json({ error: 'Seller not found or access denied' }, { status: 403 })
    }

    // Get seller's products
    const products = await db.product.findMany({
      where: {
        sellerId: seller.id,
        ...(productId && { id: productId })
      },
      select: {
        id: true,
        name: true,
        slug: true,
        price: true,
        inventory: true,
        status: true,
        featured: true,
        averageRating: true,
        totalReviews: true,
        totalSales: true,
        createdAt: true,
        category: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        },
        images: {
          select: {
            url: true,
            altText: true
          },
          take: 1,
          orderBy: {
            position: 'asc'
          }
        }
      },
      orderBy: {
        totalSales: 'desc'
      }
    })

    // In a real implementation, you would query actual analytics data from your database
    // For now, we'll simulate some analytics data based on product performance
    const analyticsData = products.map(product => {
      // Simulate analytics metrics based on product data
      const baseViews = Math.max(10, product.totalSales * 5 + Math.floor(Math.random() * 100))
      const searchImpressions = Math.max(20, baseViews * 2 + Math.floor(Math.random() * 200))
      const searchClicks = Math.max(5, Math.floor(baseViews * 0.7))
      const clickThroughRate = searchImpressions > 0 ? (searchClicks / searchImpressions) * 100 : 0

      // Generate time series data for the last 'days' period
      const viewsOverTime = []
      const currentDate = new Date()
      
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date(currentDate)
        date.setDate(date.getDate() - i)
        const dayViews = Math.max(0, Math.floor(baseViews / days) + Math.floor(Math.random() * 20) - 10)
        const uniqueViews = Math.max(0, Math.floor(dayViews * 0.7))
        
        viewsOverTime.push({
          date: date.toISOString().split('T')[0],
          views: dayViews,
          uniqueViews
        })
      }

      // Simulate popular search terms
      const searchTerms = [
        product.name.split(' ')[0]?.toLowerCase(),
        product.category?.name.toLowerCase(),
        product.name.toLowerCase(),
        `${product.category?.name} ${product.name.split(' ')[0]}`.toLowerCase(),
        'best ' + product.category?.name.toLowerCase()
      ].filter(Boolean).slice(0, 3)

      const topSearchTerms = searchTerms.map((term, index) => {
        const termImpressions = Math.max(5, Math.floor(searchImpressions / (index + 1)))
        const termClicks = Math.max(1, Math.floor(termImpressions * (0.1 + Math.random() * 0.3)))
        return {
          term,
          impressions: termImpressions,
          clicks: termClicks,
          ctr: (termClicks / termImpressions) * 100
        }
      })

      // Simulate traffic sources
      const viewsBySource = [
        { source: 'search', views: Math.floor(baseViews * 0.4), percentage: 40 },
        { source: 'homepage', views: Math.floor(baseViews * 0.25), percentage: 25 },
        { source: 'category', views: Math.floor(baseViews * 0.2), percentage: 20 },
        { source: 'direct', views: Math.floor(baseViews * 0.1), percentage: 10 },
        { source: 'recommendation', views: Math.floor(baseViews * 0.05), percentage: 5 }
      ]

      // Simulate top referrers
      const topReferrers = [
        { referrer: 'google.com', views: Math.floor(baseViews * 0.3) },
        { referrer: 'facebook.com', views: Math.floor(baseViews * 0.1) },
        { referrer: 'instagram.com', views: Math.floor(baseViews * 0.08) },
        { referrer: 'twitter.com', views: Math.floor(baseViews * 0.05) },
        { referrer: 'pinterest.com', views: Math.floor(baseViews * 0.03) }
      ].filter(r => r.views > 0)

      return {
        productId: product.id,
        productName: product.name,
        slug: product.slug,
        product: {
          ...product,
          image: product.images[0]?.url
        },
        metrics: {
          totalViews: baseViews,
          uniqueViews: Math.floor(baseViews * 0.8),
          searchImpressions,
          searchClicks,
          clickThroughRate: Math.round(clickThroughRate * 100) / 100,
          averagePosition: Math.max(1, Math.min(10, Math.floor(Math.random() * 10) + 1)),
          topSearchTerms,
          viewsBySource,
          viewsOverTime,
          topReferrers
        },
        period: {
          start: new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          end: new Date().toISOString().split('T')[0],
          days
        }
      }
    })

    // Calculate summary statistics
    const totalViews = analyticsData.reduce((sum, p) => sum + p.metrics.totalViews, 0)
    const totalImpressions = analyticsData.reduce((sum, p) => sum + p.metrics.searchImpressions, 0)
    const totalClicks = analyticsData.reduce((sum, p) => sum + p.metrics.searchClicks, 0)
    const averageCTR = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0

    // Get top performing products
    const topProducts = analyticsData
      .sort((a, b) => b.metrics.totalViews - a.metrics.totalViews)
      .slice(0, 5)

    // Aggregate search terms across all products
    const allSearchTerms = new Map<string, { impressions: number; clicks: number }>()
    analyticsData.forEach(product => {
      product.metrics.topSearchTerms.forEach(term => {
        const current = allSearchTerms.get(term.term) || { impressions: 0, clicks: 0 }
        allSearchTerms.set(term.term, {
          impressions: current.impressions + term.impressions,
          clicks: current.clicks + term.clicks
        })
      })
    })

    const topSearchTerms = Array.from(allSearchTerms.entries())
      .map(([term, data]) => ({
        term,
        impressions: data.impressions,
        clicks: data.clicks,
        ctr: data.impressions > 0 ? (data.clicks / data.impressions) * 100 : 0
      }))
      .sort((a, b) => b.impressions - a.impressions)
      .slice(0, 10)

    // Aggregate views over time
    const viewsByDate = new Map<string, { views: number; uniqueViews: number }>()
    analyticsData.forEach(product => {
      product.metrics.viewsOverTime.forEach(day => {
        const current = viewsByDate.get(day.date) || { views: 0, uniqueViews: 0 }
        viewsByDate.set(day.date, {
          views: current.views + day.views,
          uniqueViews: current.uniqueViews + day.uniqueViews
        })
      })
    })

    const viewsOverTime = Array.from(viewsByDate.entries())
      .map(([date, data]) => ({ date, views: data.views, uniqueViews: data.uniqueViews }))
      .sort((a, b) => a.date.localeCompare(b.date))

    return NextResponse.json({
      success: true,
      seller: {
        id: seller.id,
        businessName: seller.businessName,
        totalProducts: products.length
      },
      summary: {
        totalViews,
        totalImpressions,
        totalClicks,
        averageCTR: Math.round(averageCTR * 100) / 100,
        totalProducts: products.length,
        activeProducts: products.filter(p => p.status === 'ACTIVE').length
      },
      topProducts,
      topSearchTerms,
      viewsOverTime,
      products: analyticsData,
      period: {
        start: new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0],
        days
      }
    })

  } catch (error) {
    console.error('Seller analytics API error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch analytics data',
        success: false
      },
      { status: 500 }
    )
  }
}