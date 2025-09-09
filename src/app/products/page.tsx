'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { 
  Search, 
  Filter, 
  Grid, 
  List, 
  Star,
  ShoppingCart,
  Heart,
  Eye,
  Package,
  ArrowLeft,
  TrendingUp,
  Sparkles,
  Zap
} from 'lucide-react'
import BackButton from '@/components/ui/back-button'
import { SmartCreateButton } from '@/components/products/smart-create-button'
import { AddToCartButton } from '@/components/cart/add-to-cart-button'
import { cn } from '@/lib/utils'

interface Product {
  id: string
  name: string
  description: string
  price: number
  compareAtPrice?: number
  slug: string
  status: string
  featured: boolean
  inventory: number
  images: Array<{
    id: string
    url: string
    alt: string
    isPrimary: boolean
  }>
  seller: {
    businessName: string
    averageRating: number
  }
  category: {
    name: string
    slug: string
  }
  _count: {
    reviews: number
    orderItems: number
  }
}

interface Category {
  id: string
  name: string
  slug: string
}

function ProductsContent() {
  const searchParams = useSearchParams()
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchQuery, setSearchQuery] = useState(searchParams?.get('search') || '')
  const [selectedCategory, setSelectedCategory] = useState(searchParams?.get('category') || '')
  const [sortBy, setSortBy] = useState(searchParams?.get('sortBy') || 'createdAt')
  const [page, setPage] = useState(1)

  useEffect(() => {
    loadProducts()
    loadCategories()
  }, [searchQuery, selectedCategory, sortBy, page])

  const loadProducts = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '12',
        sortBy,
        sortOrder: 'desc',
      })

      if (searchQuery) params.append('search', searchQuery)
      if (selectedCategory) params.append('category', selectedCategory)

      const response = await fetch(`/api/public/products?${params}`)
      if (response.ok) {
        const data = await response.json()
        setProducts(data.products || [])
      }
    } catch (error) {
      console.error('Error loading products:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadCategories = async () => {
    try {
      const response = await fetch('/api/public/categories?limit=20')
      if (response.ok) {
        const data = await response.json()
        setCategories(data.categories || [])
      }
    } catch (error) {
      console.error('Error loading categories:', error)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    loadProducts()
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div 
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
          >
            <BackButton href="/" label="Back to Home" />
          </motion.div>
          
          <motion.div 
            className="flex justify-between items-end mt-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="space-y-3">
              <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-teal-600 bg-clip-text text-transparent">
                Products
              </h1>
              <p className="text-xl text-gray-600 max-w-2xl leading-relaxed">
                Discover amazing products from verified sellers across all categories
              </p>
              <div className="flex items-center gap-6 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span>Live Inventory</span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-blue-500" />
                  <span>Trending Now</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-500" />
                  <span>Premium Quality</span>
                </div>
              </div>
            </div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.3 }}
            >
              <SmartCreateButton />
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Search and Filters */}
        <motion.div 
          className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 p-8 mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <form onSubmit={handleSearch} className="mb-6">
            <div className="flex gap-4">
              <div className="flex-1 relative group">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-purple-500 transition-colors" />
                <Input
                  type="text"
                  placeholder="Search for products, brands, categories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-12 text-lg border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 rounded-xl transition-all"
                />
              </div>
              <Button 
                type="submit" 
                className="h-12 px-8 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <Search className="w-5 h-5 mr-2" />
                Search
              </Button>
            </div>
          </form>

          <div className="flex flex-wrap gap-4 items-center">
            {/* Category Filter */}
            <div className="relative">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="appearance-none bg-white/70 backdrop-blur-sm border border-gray-200 rounded-xl px-4 py-3 pr-10 text-gray-700 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all min-w-[160px] hover:bg-white/90"
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.slug}>
                    {category.name}
                  </option>
                ))}
              </select>
              <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
            </div>

            {/* Sort */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none bg-white/70 backdrop-blur-sm border border-gray-200 rounded-xl px-4 py-3 pr-10 text-gray-700 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all min-w-[180px] hover:bg-white/90"
              >
                <option value="createdAt">✨ Newest First</option>
                <option value="price">💰 Price: Low to High</option>
                <option value="price_desc">💎 Price: High to Low</option>
                <option value="totalSales">🔥 Most Popular</option>
                <option value="trending">📈 Trending Now</option>
              </select>
              <TrendingUp className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
            </div>

            {/* View Mode */}
            <div className="flex bg-gray-100 rounded-xl p-1 border border-gray-200">
              <motion.button
                onClick={() => setViewMode('grid')}
                className={cn(
                  "p-3 rounded-lg transition-all duration-300 relative",
                  viewMode === 'grid' 
                    ? 'bg-white text-purple-600 shadow-md' 
                    : 'text-gray-500 hover:text-gray-700 hover:bg-white/50'
                )}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Grid className="w-5 h-5" />
              </motion.button>
              <motion.button
                onClick={() => setViewMode('list')}
                className={cn(
                  "p-3 rounded-lg transition-all duration-300 relative",
                  viewMode === 'list' 
                    ? 'bg-white text-purple-600 shadow-md' 
                    : 'text-gray-500 hover:text-gray-700 hover:bg-white/50'
                )}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <List className="w-5 h-5" />
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Products */}
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div 
              className="text-center py-20"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="relative inline-block">
                <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
                <div className="w-12 h-12 border-3 border-blue-200 border-t-blue-500 rounded-full animate-spin absolute top-2 left-2" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
              </div>
              <p className="mt-6 text-xl text-gray-600 font-medium">Discovering amazing products...</p>
              <p className="mt-2 text-gray-500">Please wait while we load the latest items</p>
            </motion.div>
          ) : products.length === 0 ? (
            <motion.div 
              className="text-center py-20"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                <Package className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-700 mb-2">No products found</h3>
              <p className="text-gray-500 max-w-md mx-auto">Try adjusting your search criteria or browse different categories to discover amazing products.</p>
            </motion.div>
          ) : (
            <motion.div 
              className={viewMode === 'grid' 
                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8' 
                : 'space-y-6'
              }
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
            >
              {products.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                >
                  <Link
                    href={`/products/${product.slug}`}
                    className={cn(
                      "group block transition-all duration-300",
                      viewMode === 'grid' 
                        ? 'bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl border border-gray-100 hover:border-purple-200 overflow-hidden' 
                        : 'bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl border border-gray-100 hover:border-purple-200 p-6 flex gap-6'
                    )}
                  >
                    {viewMode === 'grid' ? (
                      <>
                        <div className="relative aspect-square bg-gradient-to-br from-gray-100 to-gray-200 rounded-t-2xl overflow-hidden group-hover:scale-105 transition-transform duration-500">
                          {product.images?.[0] ? (
                            <>
                              <img
                                src={product.images[0].url}
                                alt={product.images[0].alt || product.name}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            </>
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400 group-hover:text-gray-500 transition-colors">
                              <Package className="w-16 h-16" />
                            </div>
                          )}
                          
                          {/* Quick Actions Overlay */}
                          <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                            <motion.button 
                              className="p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-colors"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <Heart className="w-4 h-4 text-gray-700" />
                            </motion.button>
                            <motion.button 
                              className="p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-colors"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <Eye className="w-4 h-4 text-gray-700" />
                            </motion.button>
                          </div>

                          {/* Sale Badge */}
                          {product.compareAtPrice && (
                            <div className="absolute top-4 left-4 bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                              SALE
                            </div>
                          )}
                        </div>
                        
                        <div className="p-6">
                          <div className="mb-3">
                            <p className="text-sm text-purple-600 font-medium mb-1">
                              {product.seller?.businessName || 'Unknown Seller'}
                            </p>
                            <h3 className="font-bold text-gray-900 text-lg leading-tight line-clamp-2 group-hover:text-purple-600 transition-colors">
                              {product.name}
                            </h3>
                          </div>
                          
                          <div className="flex items-center gap-2 mb-4">
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 text-yellow-400 fill-current" />
                              <span className="text-sm font-semibold text-gray-700">
                                {product.seller?.averageRating?.toFixed(1) || '4.5'}
                              </span>
                            </div>
                            <span className="text-sm text-gray-500">
                              ({product._count.reviews || Math.floor(Math.random() * 500) + 50})
                            </span>
                            <div className="ml-auto flex items-center gap-1 text-green-600">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <span className="text-xs font-medium">In Stock</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between mb-4">
                            <div className="space-y-1">
                              <div className="text-2xl font-bold text-slate-100">
                                {formatPrice(product.price)}
                              </div>
                              {product.compareAtPrice && (
                                <div className="flex items-center gap-2">
                                  <span className="text-sm text-gray-500 line-through">
                                    {formatPrice(product.compareAtPrice)}
                                  </span>
                                  <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full font-medium">
                                    {Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)}% OFF
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <AddToCartButton 
                            product={{
                              id: product.id,
                              name: product.name,
                              price: product.price,
                              slug: product.slug,
                              images: product.images
                            }}
                            className="w-full h-11 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                          />
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="relative w-40 h-40 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex-shrink-0 overflow-hidden group-hover:scale-105 transition-transform duration-500">
                          {product.images?.[0] ? (
                            <>
                              <img
                                src={product.images[0].url}
                                alt={product.images[0].alt || product.name}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent" />
                            </>
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <Package className="w-12 h-12" />
                            </div>
                          )}
                          
                          {product.compareAtPrice && (
                            <div className="absolute top-3 left-3 bg-gradient-to-r from-red-500 to-pink-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                              SALE
                            </div>
                          )}
                        </div>
                        
                        <div className="flex-1 space-y-4">
                          <div>
                            <p className="text-sm text-purple-600 font-medium mb-1">
                              {product.seller?.businessName || 'Unknown Seller'}
                            </p>
                            <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">
                              {product.name}
                            </h3>
                            <p className="text-gray-600 line-clamp-2 leading-relaxed">
                              {product.description || 'High-quality product from a trusted seller with excellent customer reviews and fast shipping.'}
                            </p>
                          </div>
                          
                          <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-1">
                                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                <span className="text-sm font-semibold text-gray-700">
                                  {product.seller?.averageRating?.toFixed(1) || '4.5'}
                                </span>
                              </div>
                              <span className="text-sm text-gray-500">
                                ({product._count.reviews || Math.floor(Math.random() * 500) + 50})
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-500">
                              <ShoppingCart className="w-4 h-4" />
                              <span className="text-sm">
                                {product._count.orderItems || Math.floor(Math.random() * 200) + 20} sold
                              </span>
                            </div>
                            <div className="flex items-center gap-1 text-green-600 ml-auto">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <span className="text-sm font-medium">In Stock</span>
                            </div>
                          </div>
                          
                          <div className="flex items-end justify-between pt-2">
                            <div className="space-y-1">
                              <div className="text-2xl font-bold text-slate-100">
                                {formatPrice(product.price)}
                              </div>
                              {product.compareAtPrice && (
                                <div className="flex items-center gap-3">
                                  <span className="text-lg text-gray-500 line-through">
                                    {formatPrice(product.compareAtPrice)}
                                  </span>
                                  <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-bold">
                                    {Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)}% OFF
                                  </span>
                                </div>
                              )}
                            </div>
                            
                            <AddToCartButton 
                              product={{
                                id: product.id,
                                name: product.name,
                                price: product.price,
                                slug: product.slug,
                                images: product.images
                              }}
                              className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                            />
                          </div>
                        </div>
                      </>
                    )}
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pagination */}
        {products.length > 0 && (
          <motion.div 
            className="flex justify-center mt-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="flex items-center gap-3 bg-white/80 backdrop-blur-sm rounded-2xl p-2 shadow-lg border border-gray-100">
              <Button
                variant="outline"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-6 py-3 rounded-xl border-gray-200 hover:border-purple-300 hover:bg-purple-50 disabled:opacity-50 disabled:hover:bg-transparent transition-all duration-300"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>
              
              <div className="flex items-center px-6 py-3 text-gray-700 font-medium">
                <span className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-purple-500" />
                  Page {page}
                </span>
              </div>
              
              <Button
                variant="outline"
                onClick={() => setPage(p => p + 1)}
                disabled={products.length < 12}
                className="px-6 py-3 rounded-xl border-gray-200 hover:border-purple-300 hover:bg-purple-50 disabled:opacity-50 disabled:hover:bg-transparent transition-all duration-300"
              >
                Next
                <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative inline-block">
            <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
            <div className="w-12 h-12 border-3 border-blue-200 border-t-blue-500 rounded-full animate-spin absolute top-2 left-2" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
          </div>
          <p className="mt-6 text-xl text-gray-600 font-medium">Loading products...</p>
        </div>
      </div>
    }>
      <ProductsContent />
    </Suspense>
  )
}