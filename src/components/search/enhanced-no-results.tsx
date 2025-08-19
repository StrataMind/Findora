'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Search, TrendingUp, Tag, Filter, Mail, Lightbulb, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface NoResultsProps {
  query: string
  totalFilters?: number
  suggestions?: {
    queries: string[]
    categories: { name: string; slug: string; count?: number }[]
    products: { name: string; slug: string; price: number; image?: string }[]
    alternativeSpellings: string[]
  }
  onSearch?: (query: string) => void
  onClearFilters?: () => void
  showAnalytics?: boolean
}

export default function EnhancedNoResults({
  query,
  totalFilters = 0,
  suggestions = {
    queries: ['Electronics', 'Fashion', 'Home & Garden', 'Books', 'Sports'],
    categories: [],
    products: [],
    alternativeSpellings: []
  },
  onSearch,
  onClearFilters,
  showAnalytics = true
}: NoResultsProps) {
  const router = useRouter()
  const [newQuery, setNewQuery] = useState('')
  const [searchAnalytics, setSearchAnalytics] = useState<{
    popularQueries: { query: string; count: number }[]
    trendingCategories: { name: string; slug: string; growth: number }[]
  }>({
    popularQueries: [],
    trendingCategories: []
  })

  useEffect(() => {
    if (showAnalytics) {
      fetchSearchAnalytics()
    }
    
    // Track no results event
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'search', {
        search_term: query,
        search_results: 0
      })
    }
  }, [query, showAnalytics])

  const fetchSearchAnalytics = async () => {
    try {
      const response = await fetch('/api/search/analytics')
      if (response.ok) {
        const data = await response.json()
        setSearchAnalytics(data)
      }
    } catch (error) {
      console.error('Failed to fetch search analytics:', error)
    }
  }

  const handleSearch = (searchQuery: string = newQuery) => {
    if (!searchQuery.trim()) return
    
    if (onSearch) {
      onSearch(searchQuery)
    } else {
      router.push(`/products?search=${encodeURIComponent(searchQuery)}`)
    }
    
    // Track search suggestion click
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'search_suggestion_click', {
        search_term: searchQuery,
        original_query: query
      })
    }
  }

  const handleCategoryClick = (slug: string) => {
    router.push(`/categories/${slug}`)
  }

  const handleProductClick = (slug: string) => {
    router.push(`/products/${slug}`)
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price)
  }

  return (
    <div className="max-w-4xl mx-auto text-center py-12 px-4">
      {/* Main Message */}
      <div className="mb-8">
        <Search className="mx-auto h-16 w-16 text-gray-300 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          No results found
        </h2>
        {query && (
          <p className="text-gray-600 mb-4">
            We couldn&apos;t find any products matching <strong>&quot;{query}&quot;</strong>
          </p>
        )}
        {totalFilters > 0 && (
          <p className="text-sm text-gray-500">
            Try removing some filters or adjusting your search criteria
          </p>
        )}
      </div>

      {/* Alternative Spellings */}
      {suggestions.alternativeSpellings.length > 0 && (
        <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-center mb-2">
            <Lightbulb className="h-5 w-5 text-blue-600 mr-2" />
            <span className="text-sm font-medium text-blue-900">Did you mean:</span>
          </div>
          <div className="flex flex-wrap gap-2 justify-center">
            {suggestions.alternativeSpellings.map((spelling) => (
              <button
                key={spelling}
                onClick={() => handleSearch(spelling)}
                className="inline-flex items-center px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded-full text-sm transition-colors"
              >
                {spelling}
                <ArrowRight className="h-3 w-3 ml-1" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Clear Filters */}
      {totalFilters > 0 && onClearFilters && (
        <div className="mb-8">
          <Button
            onClick={onClearFilters}
            variant="outline"
            size="lg"
            className="flex items-center space-x-2"
          >
            <Filter className="h-4 w-4" />
            <span>Clear all filters ({totalFilters})</span>
          </Button>
        </div>
      )}

      {/* Search Again */}
      <div className="mb-12">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Try a different search</h3>
        <div className="flex space-x-2 max-w-md mx-auto">
          <Input
            type="text"
            placeholder="Search for products..."
            value={newQuery}
            onChange={(e) => setNewQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSearch()
              }
            }}
            className="flex-1"
          />
          <Button onClick={() => handleSearch()}>
            <Search className="h-4 w-4 mr-2" />
            Search
          </Button>
        </div>
      </div>

      {/* Suggestions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Left Column */}
        <div className="space-y-8">
          {/* Popular Searches */}
          {(suggestions.queries.length > 0 || searchAnalytics.popularQueries.length > 0) && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 mr-2 text-blue-600" />
                Popular Searches
              </h3>
              <div className="flex flex-wrap gap-2 justify-center">
                {(searchAnalytics.popularQueries.length > 0 ? searchAnalytics.popularQueries : 
                  suggestions.queries.map(q => ({ query: q, count: 0 }))).slice(0, 8).map((item) => (
                  <button
                    key={item.query}
                    onClick={() => handleSearch(item.query)}
                    className="inline-flex items-center px-3 py-2 bg-gray-100 hover:bg-blue-100 text-gray-700 hover:text-blue-700 rounded-lg text-sm transition-colors group"
                  >
                    <Search className="h-3 w-3 mr-1 group-hover:text-blue-600" />
                    {item.query}
                    {item.count > 0 && (
                      <span className="ml-1 text-xs text-gray-500">({item.count})</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Browse Categories */}
          {suggestions.categories.length > 0 && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center justify-center">
                <Tag className="h-5 w-5 mr-2 text-green-600" />
                Browse Categories
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {suggestions.categories.slice(0, 6).map((category) => (
                  <button
                    key={category.slug}
                    onClick={() => handleCategoryClick(category.slug)}
                    className="p-3 border border-gray-200 hover:border-green-300 hover:bg-green-50 rounded-lg text-sm font-medium text-gray-700 hover:text-green-700 transition-colors group"
                  >
                    <div className="flex items-center justify-between">
                      <span>{category.name}</span>
                      {category.count && (
                        <span className="text-xs text-gray-500 group-hover:text-green-600">
                          {category.count}
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column */}
        <div className="space-y-8">
          {/* Similar Products */}
          {suggestions.products.length > 0 && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                You might be interested in
              </h3>
              <div className="space-y-3">
                {suggestions.products.slice(0, 4).map((product) => (
                  <button
                    key={product.slug}
                    onClick={() => handleProductClick(product.slug)}
                    className="w-full p-4 border border-gray-200 hover:border-purple-300 hover:bg-purple-50 rounded-lg text-left transition-colors group"
                  >
                    <div className="flex items-center space-x-3">
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-12 h-12 rounded object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                          <Search className="h-5 w-5 text-gray-400" />
                        </div>
                      )}
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 group-hover:text-purple-700 mb-1">
                          {product.name}
                        </h4>
                        <p className="text-sm text-gray-600 font-medium">
                          {formatPrice(product.price)}
                        </p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-purple-600" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Trending Categories */}
          {searchAnalytics.trendingCategories.length > 0 && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 mr-2 text-orange-600" />
                Trending Now
              </h3>
              <div className="space-y-2">
                {searchAnalytics.trendingCategories.slice(0, 4).map((category) => (
                  <button
                    key={category.slug}
                    onClick={() => handleCategoryClick(category.slug)}
                    className="w-full p-3 border border-gray-200 hover:border-orange-300 hover:bg-orange-50 rounded-lg text-left transition-colors group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-900 group-hover:text-orange-700">
                        {category.name}
                      </span>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-green-600 font-medium">
                          +{category.growth}%
                        </span>
                        <ArrowRight className="h-3 w-3 text-gray-400 group-hover:text-orange-600" />
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Help Section */}
      <div className="p-6 bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl border">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Still can&apos;t find what you&apos;re looking for?</h3>
        <p className="text-gray-600 mb-4">
          Here are some tips to improve your search:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 mb-6">
          <ul className="space-y-2">
            <li className="flex items-center">
              <div className="w-2 h-2 bg-blue-600 rounded-full mr-3"></div>
              Check your spelling and try alternative words
            </li>
            <li className="flex items-center">
              <div className="w-2 h-2 bg-blue-600 rounded-full mr-3"></div>
              Use more general or specific terms
            </li>
          </ul>
          <ul className="space-y-2">
            <li className="flex items-center">
              <div className="w-2 h-2 bg-blue-600 rounded-full mr-3"></div>
              Try browsing our categories instead
            </li>
            <li className="flex items-center">
              <div className="w-2 h-2 bg-blue-600 rounded-full mr-3"></div>
              Remove some filters to see more results
            </li>
          </ul>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button 
            variant="outline" 
            onClick={() => router.push('/categories')}
            className="flex items-center space-x-2"
          >
            <Tag className="h-4 w-4" />
            <span>Browse All Categories</span>
          </Button>
          <Button 
            variant="outline" 
            onClick={() => router.push('/contact')}
            className="flex items-center space-x-2"
          >
            <Mail className="h-4 w-4" />
            <span>Contact Support</span>
          </Button>
        </div>
      </div>
    </div>
  )
}