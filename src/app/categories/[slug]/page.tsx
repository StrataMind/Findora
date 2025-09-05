'use client'
export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import BackButton from '@/components/ui/back-button'
import { 
  Search, 
  Filter, 
  Star, 
  ShoppingCart,
  Grid3X3,
  List,
  Package,
  Heart,
  ArrowLeft,
  Tag,
  Folder
} from 'lucide-react'
import Link from 'next/link'

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

interface Category {
  id: string
  name: string
  slug: string
  description?: string
  image?: string
  parent?: {
    id: string
    name: string
    slug: string
  }
  children: {
    id: string
    name: string
    slug: string
    _count: { products: number }
  }[]
  _count: {
    products: number
  }
}

interface CategoryResponse {
  success: boolean
  category: Category
  products: Product[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export default function CategoryPage() {
  const router = useRouter()
  const params = useParams()
  const slug = params.slug as string
  
  const [category, setCategory] = useState<Category | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('createdAt:desc')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    pages: 0
  })

  useEffect(() => {
    fetchCategoryData()
  }, [slug, currentPage, sortBy, searchTerm, minPrice, maxPrice])

  const fetchCategoryData = async () => {
    try {
      setLoading(true)
      
      // Fetch category info
      const categoryResponse = await fetch(`/api/public/categories/${slug}`)
      if (categoryResponse.ok) {
        const categoryData = await categoryResponse.json()
        setCategory(categoryData)
      }
      
      // Fetch products in this category
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '12',
        ...(category && { category: category.id }),
        ...(searchTerm && { search: searchTerm }),
        ...(sortBy && { sortBy }),
        ...(minPrice && { minPrice }),
        ...(maxPrice && { maxPrice })
      })

      const productsResponse = await fetch(`/api/public/products?${params}`)
      if (productsResponse.ok) {
        const data: { products: Product[], pagination: any } = await productsResponse.json()
        setProducts(data.products)
        setPagination(data.pagination)
      }
    } catch (error) {
      console.error('Error fetching category data:', error)
    } finally {
      setLoading(false)
    }
  }

  const clearFilters = () => {
    setSearchTerm('')
    setSortBy('createdAt:desc')
    setMinPrice('')
    setMaxPrice('')
    setCurrentPage(1)
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price)
  }

  if (loading && !category) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  if (!category) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Category not found</h3>
          <p className="text-gray-600 mb-4">The category you're looking for doesn't exist.</p>
          <Link href="/products">
            <Button>Browse All Products</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            {/* Back Button */}
            <div className="mb-4">
              <BackButton href="/products" label="Back to Products" />
            </div>
            
            {/* Breadcrumb */}
            <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
              <Link href="/products" className="hover:text-gray-900">Products</Link>
              <span>/</span>
              {category.parent && (
                <>
                  <Link href={`/categories/${category.parent.slug}`} className="hover:text-gray-900">
                    {category.parent.name}
                  </Link>
                  <span>/</span>
                </>
              )}
              <span className="text-gray-900">{category.name}</span>
            </nav>
            
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{category.name}</h1>
                {category.description && (
                  <p className="text-gray-600 mt-2">{category.description}</p>
                )}
                <p className="text-gray-600 mt-1">
                  {pagination.total} products in this category
                </p>
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
                  Search in {category.name}
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

              {/* Sort */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sort by
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="createdAt:desc">Newest First</option>
                  <option value="createdAt:asc">Oldest First</option>
                  <option value="price:asc">Price: Low to High</option>
                  <option value="price:desc">Price: High to Low</option>
                  <option value="averageRating:desc">Highest Rated</option>
                  <option value="totalSales:desc">Most Popular</option>
                </select>
              </div>

              {/* Price Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price Range
                </label>
                <div className="flex space-x-2">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                  />
                  <Input
                    type="number"
                    placeholder="Max"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                  />
                </div>
              </div>

              {/* Subcategories */}
              {category.children.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subcategories
                  </label>
                  <div className="space-y-2">
                    {category.children.map((child) => (
                      <Link
                        key={child.id}
                        href={`/categories/${child.slug}`}
                        className="flex items-center justify-between p-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded"
                      >
                        <div className="flex items-center">
                          <Folder className="h-4 w-4 mr-2" />
                          {child.name}
                        </div>
                        <span className="text-xs text-gray-400">
                          {child._count.products}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Products Grid */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <div className="text-sm text-gray-600">
                Showing {products.length} of {pagination.total} products
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, index) => (
                  <div key={index} className="bg-white rounded-lg shadow animate-pulse">
                    <div className="aspect-square bg-gray-200"></div>
                    <div className="p-4 space-y-2">
                      <div className="h-4 bg-gray-200 rounded"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-12">
                <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-600 mb-4">
                  No products match your current filters in this category.
                </p>
                <Button onClick={clearFilters}>Clear Filters</Button>
              </div>
            ) : (
              <>
                <div className={viewMode === 'grid' 
                  ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6' 
                  : 'space-y-4'
                }>
                  {products.map((product) => (
                    <Link
                      key={product.id}
                      href={`/products/${product.slug}`}
                      className={viewMode === 'grid' ? 'group' : 'group flex bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-4'}
                    >
                      {viewMode === 'grid' ? (
                        <div className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
                          <div className="aspect-square overflow-hidden rounded-t-lg">
                            {product.images.length > 0 ? (
                              <img
                                src={product.images[0].url}
                                alt={product.images[0].altText || product.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                              />
                            ) : (
                              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                <Package className="h-12 w-12 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div className="p-4">
                            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                              {product.name}
                            </h3>
                            <p className="text-gray-600 text-sm mt-1 line-clamp-2">
                              {product.description}
                            </p>
                            <div className="mt-2 flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <span className="text-lg font-bold text-gray-900">
                                  {formatPrice(product.price)}
                                </span>
                                {product.compareAtPrice && (
                                  <span className="text-sm text-gray-500 line-through">
                                    {formatPrice(product.compareAtPrice)}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center">
                                <Star className="h-4 w-4 text-yellow-400 fill-current" />
                                <span className="text-sm text-gray-600 ml-1">
                                  {product.averageRating.toFixed(1)} ({product.totalReviews})
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="w-24 h-24 flex-shrink-0 overflow-hidden rounded-lg mr-4">
                            {product.images.length > 0 ? (
                              <img
                                src={product.images[0].url}
                                alt={product.images[0].altText || product.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                <Package className="h-6 w-6 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                              {product.name}
                            </h3>
                            <p className="text-gray-600 text-sm mt-1 line-clamp-2">
                              {product.description}
                            </p>
                            <div className="mt-2 flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <span className="text-lg font-bold text-gray-900">
                                  {formatPrice(product.price)}
                                </span>
                                {product.compareAtPrice && (
                                  <span className="text-sm text-gray-500 line-through">
                                    {formatPrice(product.compareAtPrice)}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center">
                                <Star className="h-4 w-4 text-yellow-400 fill-current" />
                                <span className="text-sm text-gray-600 ml-1">
                                  {product.averageRating.toFixed(1)} ({product.totalReviews})
                                </span>
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                    </Link>
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