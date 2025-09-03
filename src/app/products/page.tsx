'use client'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import PriceRangeSlider from '@/components/filters/price-range-slider'
import RatingFilter from '@/components/filters/rating-filter'
import SellerFilter from '@/components/filters/seller-filter'
import AvailabilityFilter from '@/components/filters/availability-filter'
import BackButton from '@/components/ui/back-button'
import NoResults from '@/components/search/no-results'
import { useSearchAnalytics } from '@/lib/search-analytics'
import { useAnalytics } from '@/lib/analytics'
import { useSession } from 'next-auth/react'
import { 
  Search, 
  Filter, 
  Star, 
  ShoppingCart,
  Grid3X3,
  List,
  SlidersHorizontal,
  Package,
  Heart,
  Eye
} from 'lucide-react'

interface Product {
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
    businessName: string
    verificationStatus: string
    averageRating?: number
    totalRatings: number
  }
  averageRating: number
  totalReviews: number
  totalSales: number
  tags: string[]
}

interface ProductsResponse {
  success: boolean
  products: Product[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

const categories = [
  { id: 'all', name: 'All Categories' },
  { id: 'electronics', name: 'Electronics' },
  { id: 'fashion', name: 'Fashion & Clothing' },
  { id: 'home', name: 'Home & Garden' },
  { id: 'health', name: 'Health & Beauty' },
  { id: 'sports', name: 'Sports & Outdoors' },
  { id: 'books', name: 'Books & Media' },
  { id: 'toys', name: 'Toys & Games' },
  { id: 'automotive', name: 'Automotive' },
  { id: 'food', name: 'Food & Beverages' },
  { id: 'art', name: 'Art & Crafts' },
]

const sortOptions = [
  { value: 'createdAt:desc', label: 'Newest First' },
  { value: 'createdAt:asc', label: 'Oldest First' },
  { value: 'price:asc', label: 'Price: Low to High' },
  { value: 'price:desc', label: 'Price: High to Low' },
  { value: 'name:asc', label: 'Name: A to Z' },
  { value: 'name:desc', label: 'Name: Z to A' },
]

export default function ProductsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session } = useSession()
  const { trackSearch, trackResultClick } = useSearchAnalytics()
  const analytics = useAnalytics()
  
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showFilters, setShowFilters] = useState(false)
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '')
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all')
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'createdAt:desc')
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '')
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '')
  const [featuredOnly, setFeaturedOnly] = useState(searchParams.get('featured') === 'true')
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page') || '1'))
  
  // Advanced filter states
  const [priceRange, setPriceRange] = useState<[number, number]>([
    parseInt(searchParams.get('minPrice') || '0'),
    parseInt(searchParams.get('maxPrice') || '1000')
  ])
  const [minRating, setMinRating] = useState(parseInt(searchParams.get('rating') || '0'))
  const [sellerTypes, setSellerTypes] = useState<string[]>(
    searchParams.get('sellers')?.split(',') || []
  )
  const [availability, setAvailability] = useState<string[]>(
    searchParams.get('availability')?.split(',') || []
  )
  
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    pages: 0
  })

  useEffect(() => {
    fetchProducts()
    updateURL()
  }, [currentPage, selectedCategory, sortBy, searchTerm, priceRange, minRating, sellerTypes, availability, featuredOnly])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '12',
        ...(selectedCategory !== 'all' && { category: selectedCategory }),
        ...(searchTerm && { search: searchTerm }),
        ...(priceRange[0] > 0 && { minPrice: priceRange[0].toString() }),
        ...(priceRange[1] < 1000 && { maxPrice: priceRange[1].toString() }),
        ...(minRating > 0 && { rating: minRating.toString() }),
        ...(sellerTypes.length > 0 && { sellers: sellerTypes.join(',') }),
        ...(availability.length > 0 && { availability: availability.join(',') }),
        ...(featuredOnly && { featured: 'true' })
      })

      // Parse sort parameter
      const [sortField, sortOrder] = sortBy.split(':')
      params.append('sortBy', sortField)
      params.append('sortOrder', sortOrder)

      const response = await fetch(`/api/public/products?${params}`)
      if (response.ok) {
        const data: ProductsResponse = await response.json()
        setProducts(data.products)
        setPagination(data.pagination)
        
        // Track search analytics
        if (searchTerm) {
          trackSearch(
            searchTerm, 
            data.products.length,
            selectedCategory !== 'all' ? selectedCategory : undefined,
            {
              priceRange,
              minRating,
              sellerTypes,
              availability,
              featuredOnly
            }
          )

          // Track search impressions for each product
          data.products.forEach((product, index) => {
            analytics.trackSearchImpression(
              product.id,
              searchTerm,
              index + 1 + ((currentPage - 1) * 12), // Position in overall results
              {
                userId: session?.user?.id,
                categoryFilter: selectedCategory !== 'all' ? selectedCategory : undefined
              }
            )
          })
        }
      }
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateURL = () => {
    const params = new URLSearchParams()
    if (searchTerm) params.set('search', searchTerm)
    if (selectedCategory !== 'all') params.set('category', selectedCategory)
    if (sortBy !== 'createdAt:desc') params.set('sortBy', sortBy)
    if (priceRange[0] > 0) params.set('minPrice', priceRange[0].toString())
    if (priceRange[1] < 1000) params.set('maxPrice', priceRange[1].toString())
    if (minRating > 0) params.set('rating', minRating.toString())
    if (sellerTypes.length > 0) params.set('sellers', sellerTypes.join(','))
    if (availability.length > 0) params.set('availability', availability.join(','))
    if (featuredOnly) params.set('featured', 'true')
    if (currentPage > 1) params.set('page', currentPage.toString())

    const newURL = params.toString() ? `/products?${params.toString()}` : '/products'
    window.history.replaceState({}, '', newURL)
  }

  const clearFilters = () => {
    setSearchTerm('')
    setSelectedCategory('all')
    setSortBy('createdAt:desc')
    setPriceRange([0, 1000])
    setMinRating(0)
    setSellerTypes([])
    setAvailability([])
    setFeaturedOnly(false)
    setCurrentPage(1)
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price)
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex text-yellow-400">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${i < Math.floor(rating) ? 'fill-current' : ''}`}
          />
        ))}
      </div>
    )
  }

  const ProductCard = ({ product }: { product: Product }) => {
    const handleProductClick = () => {
      if (searchTerm) {
        const position = products.findIndex(p => p.id === product.id) + 1
        trackResultClick(product.id, position, searchTerm)
      }
      router.push(`/products/${product.slug}`)
    }

    return (
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200">
        <div className="relative">
          <div className="aspect-square overflow-hidden">
          {product.images && product.images.length > 0 ? (
            <img
              src={product.images[0].url}
              alt={product.images[0].altText || product.name}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <Package className="h-16 w-16 text-gray-400" />
            </div>
          )}
        </div>
        
        {product.featured && (
          <div className="absolute top-2 left-2 bg-purple-600 text-white text-xs px-2 py-1 rounded">
            Featured
          </div>
        )}
        
        {product.compareAtPrice && product.compareAtPrice > product.price && (
          <div className="absolute top-2 right-2 bg-red-600 text-white text-xs px-2 py-1 rounded">
            Sale
          </div>
        )}

        <div className="absolute bottom-2 right-2 opacity-0 hover:opacity-100 transition-opacity">
          <div className="flex space-x-1">
            <Button size="sm" variant="secondary" className="h-8 w-8 p-0">
              <Heart className="h-4 w-4" />
            </Button>
            <Button 
              size="sm" 
              variant="secondary" 
              className="h-8 w-8 p-0"
              onClick={() => router.push(`/products/${product.slug}`)}
            >
              <Eye className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="p-4">
        <div className="mb-2">
          <h3 
            className="font-semibold text-gray-900 hover:text-blue-600 cursor-pointer line-clamp-2"
            onClick={() => router.push(`/products/${product.slug}`)}
          >
            {product.name}
          </h3>
          <p className="text-sm text-gray-600">{product.seller?.businessName || 'Unknown Seller'}</p>
        </div>

        <div className="mb-2">
          <div className="flex items-center space-x-2">
            <div className="flex items-center">
              {renderStars(product.averageRating || 0)}
              <span className="ml-1 text-sm text-gray-600">
                ({product.totalReviews || 0})
              </span>
            </div>
            {product.seller?.verificationStatus === 'VERIFIED' && (
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                Verified
              </span>
            )}
          </div>
        </div>

        <div className="mb-3">
          <div className="flex items-center space-x-2">
            <span className="text-lg font-bold text-gray-900">
              {formatPrice(product.price)}
            </span>
            {product.compareAtPrice && product.compareAtPrice > product.price && (
              <span className="text-sm text-gray-500 line-through">
                {formatPrice(product.compareAtPrice)}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">
            {product.inventory} in stock
          </span>
          <Button
            size="sm"
            onClick={handleProductClick}
          >
            <ShoppingCart className="h-4 w-4 mr-1" />
            View
          </Button>
        </div>
      </div>
    </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <BackButton href="/" label="Back to Home" className="mr-4" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Products</h1>
                <p className="text-gray-600">
                  {pagination.total} products available
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  Clear All
                </Button>
              </div>

              {/* Search */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price Range
                </label>
                <div className="flex space-x-2">
                  <Input
                    placeholder="Min"
                    type="number"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                  />
                  <Input
                    placeholder="Max"
                    type="number"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                  />
                </div>
              </div>

              {/* Featured Only */}
              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={featuredOnly}
                    onChange={(e) => setFeaturedOnly(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Featured products only
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Sort and View Controls */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="text-sm text-gray-600">
                Showing {products.length} of {pagination.total} products
              </div>
            </div>

            {/* Products Grid */}
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : products.length === 0 ? (
              <NoResults
                searchTerm={searchTerm}
                totalFilters={(
                  (priceRange[0] > 0 || priceRange[1] < 1000 ? 1 : 0) +
                  (minRating > 0 ? 1 : 0) +
                  sellerTypes.length +
                  availability.length +
                  (featuredOnly ? 1 : 0)
                )}
                onClearFilters={clearFilters}
                onClearSearch={() => setSearchTerm('')}
              />
            ) : (
              <>
                <div className={viewMode === 'grid' 
                  ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6' 
                  : 'space-y-4'
                }>
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {/* Pagination */}
                {pagination.pages > 1 && (
                  <div className="mt-8 flex items-center justify-between">
                    <div className="text-sm text-gray-700">
                      Page {pagination.page} of {pagination.pages}
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        disabled={pagination.page === 1}
                        onClick={() => setCurrentPage(pagination.page - 1)}
                      >
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        disabled={pagination.page === pagination.pages}
                        onClick={() => setCurrentPage(pagination.page + 1)}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}