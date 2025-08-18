// Product Analytics System
export interface ProductView {
  productId: string
  userId?: string
  sessionId: string
  timestamp: number
  source: 'search' | 'category' | 'homepage' | 'direct' | 'recommendation'
  searchTerm?: string
  categoryId?: string
  referrer?: string
}

export interface SearchImpression {
  productId: string
  searchTerm: string
  position: number
  userId?: string
  sessionId: string
  timestamp: number
  clicked: boolean
  categoryFilter?: string
}

export interface AnalyticsMetrics {
  totalViews: number
  uniqueViews: number
  searchImpressions: number
  searchClicks: number
  clickThroughRate: number
  averagePosition: number
  topSearchTerms: Array<{ term: string; impressions: number; clicks: number; ctr: number }>
  viewsBySource: Array<{ source: string; views: number; percentage: number }>
  viewsOverTime: Array<{ date: string; views: number; uniqueViews: number }>
  topReferrers: Array<{ referrer: string; views: number }>
}

export interface ProductAnalytics {
  productId: string
  productName: string
  slug: string
  metrics: AnalyticsMetrics
  period: {
    start: string
    end: string
    days: number
  }
}

class ProductAnalyticsEngine {
  private storageKey = 'findora_product_analytics'
  private sessionId: string
  private maxEvents = 10000

  constructor() {
    this.sessionId = this.generateSessionId()
  }

  private generateSessionId(): string {
    if (typeof window !== 'undefined') {
      let sessionId = sessionStorage.getItem('findora_session_id')
      if (!sessionId) {
        sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        sessionStorage.setItem('findora_session_id', sessionId)
      }
      return sessionId
    }
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private getStoredEvents(): (ProductView | SearchImpression)[] {
    if (typeof window === 'undefined') return []
    
    try {
      const stored = localStorage.getItem(this.storageKey)
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.error('Error loading analytics events:', error)
      return []
    }
  }

  private saveEvent(event: ProductView | SearchImpression) {
    if (typeof window === 'undefined') return

    try {
      const events = this.getStoredEvents()
      events.push(event)
      
      // Keep only recent events to prevent storage bloat
      const recentEvents = events.slice(-this.maxEvents)
      localStorage.setItem(this.storageKey, JSON.stringify(recentEvents))
      
      // Also send to server in production
      this.sendToServer(event)
    } catch (error) {
      console.error('Error saving analytics event:', error)
    }
  }

  // Track product view
  trackProductView(
    productId: string, 
    source: ProductView['source'],
    options: {
      userId?: string
      searchTerm?: string
      categoryId?: string
      referrer?: string
    } = {}
  ) {
    const event: ProductView = {
      productId,
      userId: options.userId,
      sessionId: this.sessionId,
      timestamp: Date.now(),
      source,
      searchTerm: options.searchTerm,
      categoryId: options.categoryId,
      referrer: options.referrer || (typeof window !== 'undefined' ? document.referrer : undefined)
    }

    this.saveEvent(event)
  }

  // Track search impression (when product appears in search results)
  trackSearchImpression(
    productId: string,
    searchTerm: string,
    position: number,
    options: {
      userId?: string
      categoryFilter?: string
      clicked?: boolean
    } = {}
  ) {
    const event: SearchImpression = {
      productId,
      searchTerm,
      position,
      userId: options.userId,
      sessionId: this.sessionId,
      timestamp: Date.now(),
      clicked: options.clicked || false,
      categoryFilter: options.categoryFilter
    }

    this.saveEvent(event)
  }

  // Update search impression when clicked
  markSearchImpressionClicked(productId: string, searchTerm: string) {
    if (typeof window === 'undefined') return

    try {
      const events = this.getStoredEvents()
      const impression = events
        .filter((e): e is SearchImpression => 'searchTerm' in e)
        .reverse()
        .find(e => e.productId === productId && e.searchTerm === searchTerm && !e.clicked)
      
      if (impression) {
        impression.clicked = true
        localStorage.setItem(this.storageKey, JSON.stringify(events))
        this.sendToServer(impression)
      }
    } catch (error) {
      console.error('Error marking impression clicked:', error)
    }
  }

  // Calculate analytics for a specific product
  calculateProductAnalytics(
    productId: string, 
    days: number = 30,
    productName: string = '',
    slug: string = ''
  ): ProductAnalytics {
    const cutoff = Date.now() - (days * 24 * 60 * 60 * 1000)
    const events = this.getStoredEvents().filter(e => 
      e.timestamp > cutoff && 
      ('productId' in e && e.productId === productId)
    )

    const views = events.filter((e): e is ProductView => !('searchTerm' in e)) as ProductView[]
    const impressions = events.filter((e): e is SearchImpression => 'searchTerm' in e) as SearchImpression[]

    // Calculate metrics
    const totalViews = views.length
    const uniqueViews = new Set(views.map(v => v.sessionId)).size
    const searchImpressions = impressions.length
    const searchClicks = impressions.filter(i => i.clicked).length
    const clickThroughRate = searchImpressions > 0 ? (searchClicks / searchImpressions) * 100 : 0

    // Average position in search results
    const averagePosition = impressions.length > 0 
      ? impressions.reduce((sum, i) => sum + i.position, 0) / impressions.length 
      : 0

    // Top search terms
    const searchTerms = new Map<string, { impressions: number; clicks: number }>()
    impressions.forEach(i => {
      const current = searchTerms.get(i.searchTerm) || { impressions: 0, clicks: 0 }
      searchTerms.set(i.searchTerm, {
        impressions: current.impressions + 1,
        clicks: current.clicks + (i.clicked ? 1 : 0)
      })
    })

    const topSearchTerms = Array.from(searchTerms.entries())
      .map(([term, data]) => ({
        term,
        impressions: data.impressions,
        clicks: data.clicks,
        ctr: data.impressions > 0 ? (data.clicks / data.impressions) * 100 : 0
      }))
      .sort((a, b) => b.impressions - a.impressions)
      .slice(0, 10)

    // Views by source
    const sourceCount = new Map<string, number>()
    views.forEach(v => {
      sourceCount.set(v.source, (sourceCount.get(v.source) || 0) + 1)
    })

    const viewsBySource = Array.from(sourceCount.entries())
      .map(([source, count]) => ({
        source,
        views: count,
        percentage: totalViews > 0 ? (count / totalViews) * 100 : 0
      }))
      .sort((a, b) => b.views - a.views)

    // Views over time (daily)
    const viewsByDate = new Map<string, { views: number; sessions: Set<string> }>()
    views.forEach(v => {
      const date = new Date(v.timestamp).toISOString().split('T')[0]
      const current = viewsByDate.get(date) || { views: 0, sessions: new Set() }
      current.views++
      current.sessions.add(v.sessionId)
      viewsByDate.set(date, current)
    })

    const viewsOverTime = Array.from(viewsByDate.entries())
      .map(([date, data]) => ({
        date,
        views: data.views,
        uniqueViews: data.sessions.size
      }))
      .sort((a, b) => a.date.localeCompare(b.date))

    // Top referrers
    const referrerCount = new Map<string, number>()
    views.forEach(v => {
      if (v.referrer && v.referrer !== window.location.origin) {
        const domain = this.extractDomain(v.referrer)
        referrerCount.set(domain, (referrerCount.get(domain) || 0) + 1)
      }
    })

    const topReferrers = Array.from(referrerCount.entries())
      .map(([referrer, count]) => ({ referrer, views: count }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 10)

    return {
      productId,
      productName,
      slug,
      metrics: {
        totalViews,
        uniqueViews,
        searchImpressions,
        searchClicks,
        clickThroughRate,
        averagePosition,
        topSearchTerms,
        viewsBySource,
        viewsOverTime,
        topReferrers
      },
      period: {
        start: new Date(cutoff).toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0],
        days
      }
    }
  }

  // Get analytics for all products (for seller dashboard)
  async getSellerAnalytics(sellerId: string, days: number = 30) {
    try {
      const response = await fetch(`/api/seller/analytics?sellerId=${sellerId}&days=${days}`)
      if (response.ok) {
        return await response.json()
      }
    } catch (error) {
      console.error('Error fetching seller analytics:', error)
    }
    return null
  }

  private extractDomain(url: string): string {
    try {
      return new URL(url).hostname
    } catch {
      return url
    }
  }

  private async sendToServer(event: ProductView | SearchImpression) {
    // In production, send events to analytics API
    try {
      // await fetch('/api/analytics/track', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(event)
      // })
    } catch (error) {
      // Silently fail - analytics shouldn't break the app
    }
  }

  // Clear analytics data
  clearAnalytics() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.storageKey)
    }
  }

  // Export analytics data
  exportAnalyticsData(productId?: string): string {
    const events = this.getStoredEvents()
    const filteredEvents = productId 
      ? events.filter(e => 'productId' in e && e.productId === productId)
      : events

    return JSON.stringify(filteredEvents, null, 2)
  }
}

// Export singleton instance
export const analytics = new ProductAnalyticsEngine()

// Hook for React components
export function useAnalytics() {
  return {
    trackProductView: analytics.trackProductView.bind(analytics),
    trackSearchImpression: analytics.trackSearchImpression.bind(analytics),
    markSearchImpressionClicked: analytics.markSearchImpressionClicked.bind(analytics),
    calculateProductAnalytics: analytics.calculateProductAnalytics.bind(analytics),
    getSellerAnalytics: analytics.getSellerAnalytics.bind(analytics),
    clearAnalytics: analytics.clearAnalytics.bind(analytics),
    exportAnalyticsData: analytics.exportAnalyticsData.bind(analytics)
  }
}