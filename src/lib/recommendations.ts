// Product Recommendation Engine
export interface Product {
  id: string
  name: string
  description: string
  price: number
  compareAtPrice?: number
  slug: string
  featured: boolean
  inventory: number
  images: { id: string; url: string; altText?: string }[]
  category?: { id: string; name: string; slug: string }
  seller: {
    id: string
    businessName: string
    verificationStatus: string
    averageRating?: number
    totalRatings: number
  }
  averageRating: number
  totalReviews: number
  totalSales: number
  tags: string[]
  createdAt: string
}

export interface RecommendationOptions {
  limit?: number
  excludeProductIds?: string[]
  categoryId?: string
  userId?: string
}

class ProductRecommendationEngine {
  private storageKey = 'findora_recently_viewed'
  private maxRecentlyViewed = 20

  // Recently viewed products tracking
  trackProductView(productId: string) {
    if (typeof window === 'undefined') return

    try {
      const stored = localStorage.getItem(this.storageKey)
      let recentlyViewed: string[] = stored ? JSON.parse(stored) : []
      
      // Remove if already exists and add to front
      recentlyViewed = recentlyViewed.filter(id => id !== productId)
      recentlyViewed.unshift(productId)
      
      // Keep only the most recent items
      recentlyViewed = recentlyViewed.slice(0, this.maxRecentlyViewed)
      
      localStorage.setItem(this.storageKey, JSON.stringify(recentlyViewed))
    } catch (error) {
      console.error('Error tracking product view:', error)
    }
  }

  // Get recently viewed product IDs
  getRecentlyViewedIds(): string[] {
    if (typeof window === 'undefined') return []

    try {
      const stored = localStorage.getItem(this.storageKey)
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.error('Error getting recently viewed:', error)
      return []
    }
  }

  // Get recently viewed products with full data
  async getRecentlyViewedProducts(options: RecommendationOptions = {}): Promise<Product[]> {
    const { limit = 8, excludeProductIds = [] } = options
    const recentIds = this.getRecentlyViewedIds()
    
    if (recentIds.length === 0) return []

    const filteredIds = recentIds
      .filter(id => !excludeProductIds.includes(id))
      .slice(0, limit)

    if (filteredIds.length === 0) return []

    try {
      const response = await fetch('/api/public/products/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productIds: filteredIds })
      })

      if (response.ok) {
        const data = await response.json()
        // Maintain order of recently viewed
        return filteredIds
          .map(id => data.products.find((p: Product) => p.id === id))
          .filter(Boolean)
      }
    } catch (error) {
      console.error('Error fetching recently viewed products:', error)
    }

    return []
  }

  // Get popular products in a category
  async getPopularInCategory(categoryId: string, options: RecommendationOptions = {}): Promise<Product[]> {
    const { limit = 8, excludeProductIds = [] } = options

    try {
      const params = new URLSearchParams({
        category: categoryId,
        sortBy: 'totalSales',
        sortOrder: 'desc',
        limit: (limit * 2).toString(), // Get more to filter out exclusions
        featured: 'false' // Don't limit to featured only
      })

      const response = await fetch(`/api/public/products?${params}`)
      if (response.ok) {
        const data = await response.json()
        return data.products
          .filter((product: Product) => !excludeProductIds.includes(product.id))
          .slice(0, limit)
      }
    } catch (error) {
      console.error('Error fetching popular in category:', error)
    }

    return []
  }

  // Get trending products (high sales velocity + recent)
  async getTrendingProducts(options: RecommendationOptions = {}): Promise<Product[]> {
    const { limit = 8, excludeProductIds = [] } = options

    try {
      const params = new URLSearchParams({
        sortBy: 'trending', // This would be a custom sort combining recency + sales
        limit: (limit * 2).toString(),
        featured: 'false'
      })

      const response = await fetch(`/api/public/products?${params}`)
      if (response.ok) {
        const data = await response.json()
        return data.products
          .filter((product: Product) => !excludeProductIds.includes(product.id))
          .slice(0, limit)
      }
    } catch (error) {
      console.error('Error fetching trending products:', error)
    }

    // Fallback to recent products with high sales
    return this.getNewArrivals({ ...options, limit })
  }

  // Get new arrivals
  async getNewArrivals(options: RecommendationOptions = {}): Promise<Product[]> {
    const { limit = 8, excludeProductIds = [] } = options

    try {
      const params = new URLSearchParams({
        sortBy: 'createdAt',
        sortOrder: 'desc',
        limit: (limit * 2).toString(),
        featured: 'false'
      })

      const response = await fetch(`/api/public/products?${params}`)
      if (response.ok) {
        const data = await response.json()
        return data.products
          .filter((product: Product) => !excludeProductIds.includes(product.id))
          .slice(0, limit)
      }
    } catch (error) {
      console.error('Error fetching new arrivals:', error)
    }

    return []
  }

  // Get featured products
  async getFeaturedProducts(options: RecommendationOptions = {}): Promise<Product[]> {
    const { limit = 8, excludeProductIds = [] } = options

    try {
      const params = new URLSearchParams({
        featured: 'true',
        sortBy: 'totalSales',
        sortOrder: 'desc',
        limit: (limit * 2).toString()
      })

      const response = await fetch(`/api/public/products?${params}`)
      if (response.ok) {
        const data = await response.json()
        return data.products
          .filter((product: Product) => !excludeProductIds.includes(product.id))
          .slice(0, limit)
      }
    } catch (error) {
      console.error('Error fetching featured products:', error)
    }

    return []
  }

  // Get random product discoveries
  async getRandomDiscoveries(options: RecommendationOptions = {}): Promise<Product[]> {
    const { limit = 8, excludeProductIds = [], categoryId } = options

    try {
      // Get a larger set to randomize from
      const params = new URLSearchParams({
        limit: (limit * 4).toString(),
        sortBy: 'averageRating',
        sortOrder: 'desc',
        rating: '3', // At least 3 stars
        ...(categoryId && { category: categoryId })
      })

      const response = await fetch(`/api/public/products?${params}`)
      if (response.ok) {
        const data = await response.json()
        const filtered = data.products.filter((product: Product) => 
          !excludeProductIds.includes(product.id)
        )
        
        // Shuffle and return random selection
        const shuffled = filtered.sort(() => 0.5 - Math.random())
        return shuffled.slice(0, limit)
      }
    } catch (error) {
      console.error('Error fetching random discoveries:', error)
    }

    return []
  }

  // Get personalized recommendations based on user behavior
  async getPersonalizedRecommendations(options: RecommendationOptions = {}): Promise<Product[]> {
    const { limit = 8, excludeProductIds = [] } = options
    const recentlyViewed = this.getRecentlyViewedIds()
    
    if (recentlyViewed.length === 0) {
      // No history, return trending products
      return this.getTrendingProducts(options)
    }

    try {
      // Get categories from recently viewed products
      const recentProducts = await this.getRecentlyViewedProducts({ limit: 5 })
      const categories = [...new Set(
        recentProducts.map(p => p.category?.id).filter(Boolean)
      )] as string[]

      if (categories.length === 0) {
        return this.getTrendingProducts(options)
      }

      // Get popular products from user's preferred categories
      const recommendations: Product[] = []
      const productsPerCategory = Math.ceil(limit / categories.length)

      for (const categoryId of categories) {
        const categoryProducts = await this.getPopularInCategory(categoryId, {
          limit: productsPerCategory,
          excludeProductIds: [...excludeProductIds, ...recommendations.map(p => p.id)]
        })
        recommendations.push(...categoryProducts)
        
        if (recommendations.length >= limit) break
      }

      // Fill remaining slots with random discoveries if needed
      if (recommendations.length < limit) {
        const remaining = limit - recommendations.length
        const randomProducts = await this.getRandomDiscoveries({
          limit: remaining,
          excludeProductIds: [...excludeProductIds, ...recommendations.map(p => p.id)]
        })
        recommendations.push(...randomProducts)
      }

      return recommendations.slice(0, limit)
    } catch (error) {
      console.error('Error getting personalized recommendations:', error)
      return this.getTrendingProducts(options)
    }
  }

  // Get featured sellers
  async getFeaturedSellers(options: { limit?: number } = {}) {
    const { limit = 6 } = options

    try {
      const response = await fetch(`/api/public/sellers/featured?limit=${limit}`)
      if (response.ok) {
        return await response.json()
      }
    } catch (error) {
      console.error('Error fetching featured sellers:', error)
    }

    return { sellers: [] }
  }

  // Get category showcase
  async getCategoryShowcase(options: { limit?: number } = {}) {
    const { limit = 8 } = options

    try {
      const response = await fetch(`/api/public/categories?limit=${limit}&withProductCount=true`)
      if (response.ok) {
        return await response.json()
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    }

    return { categories: [] }
  }

  // Clear recently viewed history
  clearRecentlyViewed() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.storageKey)
    }
  }
}

// Export singleton instance
export const recommendationEngine = new ProductRecommendationEngine()

// Hook for React components
export function useRecommendations() {
  return {
    trackProductView: recommendationEngine.trackProductView.bind(recommendationEngine),
    getRecentlyViewedProducts: recommendationEngine.getRecentlyViewedProducts.bind(recommendationEngine),
    getPopularInCategory: recommendationEngine.getPopularInCategory.bind(recommendationEngine),
    getTrendingProducts: recommendationEngine.getTrendingProducts.bind(recommendationEngine),
    getNewArrivals: recommendationEngine.getNewArrivals.bind(recommendationEngine),
    getFeaturedProducts: recommendationEngine.getFeaturedProducts.bind(recommendationEngine),
    getRandomDiscoveries: recommendationEngine.getRandomDiscoveries.bind(recommendationEngine),
    getPersonalizedRecommendations: recommendationEngine.getPersonalizedRecommendations.bind(recommendationEngine),
    getFeaturedSellers: recommendationEngine.getFeaturedSellers.bind(recommendationEngine),
    getCategoryShowcase: recommendationEngine.getCategoryShowcase.bind(recommendationEngine),
    clearRecentlyViewed: recommendationEngine.clearRecentlyViewed.bind(recommendationEngine)
  }
}