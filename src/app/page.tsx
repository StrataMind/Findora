'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { useRecommendations, Product } from '@/lib/recommendations'
import { 
  Search, 
  Star, 
  ShoppingCart, 
  Users, 
  Package, 
  ArrowRight,
  Shield,
  Heart,
  Eye,
  TrendingUp,
  Award,
  Truck,
  CheckCircle
} from 'lucide-react'

interface Seller {
  id: string
  businessName: string
  description?: string
  logo?: string
  verificationStatus: string
  averageRating: number
  totalProducts: number
  totalReviews: number
  totalSales: number
}

interface Category {
  id: string
  name: string
  slug: string
  description?: string
  image?: string
  _count: {
    products: number
  }
}

export default function Home() {
  const { data: session, status } = useSession()
  const [mounted, setMounted] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const recommendations = useRecommendations()
  
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [trendingProducts, setTrendingProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setMounted(true)
    loadHomePageData()
  }, [])

  // Create user in database after OAuth login
  useEffect(() => {
    if (session?.user?.email && status === 'authenticated') {
      createUserInDatabase()
    }
  }, [session, status])

  const createUserInDatabase = async () => {
    try {
      const response = await fetch('/api/auth/create-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      if (response.ok) {
        const result = await response.json()
        console.log('User database sync:', result.message)
      }
    } catch (error) {
      console.error('Failed to sync user with database:', error)
    }
  }

  const loadHomePageData = async () => {
    try {
      setLoading(true)
      const [
        featured,
        trending,
        categoryData
      ] = await Promise.all([
        recommendations.getFeaturedProducts({ limit: 8 }),
        recommendations.getTrendingProducts({ limit: 8 }),
        recommendations.getCategoryShowcase({ limit: 6 })
      ])

      setFeaturedProducts(featured)
      setTrendingProducts(trending)
      setCategories(categoryData.categories || [])
    } catch (error) {
      console.error('Error loading homepage data:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price)
  }

  const renderStars = (rating: number) => (
    <div className="flex text-yellow-400">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className={`h-3 w-3 ${i < Math.floor(rating) ? 'fill-current' : ''}`}
        />
      ))}
    </div>
  )

  const ProductCard = ({ product }: { product: Product }) => (
    <motion.div 
      className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300"
      whileHover={{ y: -4 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="relative aspect-square overflow-hidden">
        {product.images && product.images.length > 0 ? (
          <img
            src={product.images[0].url}
            alt={product.images[0].altText || product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gray-50 flex items-center justify-center">
            <Package className="h-12 w-12 text-gray-300" />
          </div>
        )}
        
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button className="w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors">
            <Heart className="h-4 w-4 text-gray-600" />
          </button>
        </div>
        
        {product.compareAtPrice && product.compareAtPrice > product.price && (
          <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-medium px-2 py-1 rounded-full">
            Sale
          </div>
        )}
      </div>

      <div className="p-5">
        <div className="mb-3">
          <h3 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-2 group-hover:text-blue-600 transition-colors">
            <Link href={`/products/${product.slug}`}>
              {product.name}
            </Link>
          </h3>
          <p className="text-xs text-gray-500">{product.seller?.businessName || 'Unknown Seller'}</p>
        </div>

        <div className="flex items-center gap-2 mb-3">
          {renderStars(product.averageRating || 0)}
          <span className="text-xs text-gray-500">({product.totalReviews || 0})</span>
          {product.seller?.verificationStatus === 'VERIFIED' && (
            <Shield className="h-3 w-3 text-green-500" />
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-bold text-gray-900">
              {formatPrice(product.price)}
            </span>
            {product.compareAtPrice && product.compareAtPrice > product.price && (
              <span className="text-xs text-gray-400 line-through">
                {formatPrice(product.compareAtPrice)}
              </span>
            )}
          </div>
          <Link href={`/products/${product.slug}`}>
            <Button size="sm" className="h-8 px-3 text-xs">
              View
            </Button>
          </Link>
        </div>
      </div>
    </motion.div>
  )

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Findora</h1>
            </Link>
            
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/products" className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors">
                Products
              </Link>
              <Link href="/categories" className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors">
                Categories
              </Link>
              <Link href="/sellers" className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors">
                Sellers
              </Link>
            </div>

            <div className="flex items-center space-x-4">
              {status === 'loading' ? (
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-16 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-8 w-20 bg-gray-200 rounded animate-pulse"></div>
                </div>
              ) : session ? (
                <>
                  <span className="text-sm text-gray-600 hidden sm:block">
                    {session.user?.name || session.user?.email}
                  </span>
                  <Link href="/dashboard">
                    <Button size="sm">Dashboard</Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/auth/signin">
                    <Button variant="ghost" size="sm">Sign In</Button>
                  </Link>
                  <Link href="/auth/signup">
                    <Button size="sm">Sign Up</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <motion.h1 
              className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              Discover Amazing
              <span className="block text-blue-600">Products</span>
            </motion.h1>
            
            <motion.p 
              className="text-lg md:text-xl text-gray-600 mb-10 leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              Shop from verified sellers and discover quality products 
              with seamless shopping experience.
            </motion.p>

            {/* Search Bar */}
            <motion.div 
              className="max-w-2xl mx-auto mb-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search for products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-32 py-4 text-lg border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <Button className="absolute right-2 top-1/2 transform -translate-y-1/2 px-6">
                  Search
                </Button>
              </div>
            </motion.div>

            {/* Stats */}
            <motion.div 
              className="grid grid-cols-3 gap-8 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">10K+</div>
                <div className="text-sm text-gray-600">Products</div>
              </div>
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">500+</div>
                <div className="text-sm text-gray-600">Sellers</div>
              </div>
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">4.9★</div>
                <div className="text-sm text-gray-600">Rating</div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div 
              className="text-center p-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Shield className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Verified Sellers</h3>
              <p className="text-gray-600">All sellers are verified for quality and authenticity</p>
            </motion.div>
            
            <motion.div 
              className="text-center p-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Truck className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Fast Delivery</h3>
              <p className="text-gray-600">Quick and reliable delivery to your doorstep</p>
            </motion.div>
            
            <motion.div 
              className="text-center p-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Quality Guarantee</h3>
              <p className="text-gray-600">100% satisfaction guarantee on all purchases</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Featured Products</h2>
              <p className="text-gray-600">Handpicked products just for you</p>
            </div>
            <Link href="/products">
              <Button variant="outline" className="flex items-center gap-2">
                View All
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-gray-200 rounded-2xl aspect-square animate-pulse"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.slice(0, 8).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Categories */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Shop by Category</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Explore our wide range of categories and find exactly what you're looking for
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.slice(0, 6).map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Link href={`/categories/${category.slug}`}>
                  <div className="bg-white rounded-2xl p-6 text-center hover:shadow-lg transition-all duration-300 group">
                    <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:bg-blue-100 transition-colors">
                      <Package className="h-6 w-6 text-gray-600 group-hover:text-blue-600" />
                    </div>
                    <h3 className="font-medium text-gray-900 text-sm mb-1">{category.name}</h3>
                    <p className="text-xs text-gray-500">{category._count.products} items</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Trending Products */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                <TrendingUp className="h-8 w-8 text-orange-500" />
                Trending Now
              </h2>
              <p className="text-gray-600">Most popular products this week</p>
            </div>
            <Link href="/products?sort=trending">
              <Button variant="outline" className="flex items-center gap-2">
                View All
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-gray-200 rounded-2xl aspect-square animate-pulse"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {trendingProducts.slice(0, 8).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-xl font-bold mb-4">Findora</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Your trusted marketplace for quality products from verified sellers.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Shop</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/products" className="hover:text-white transition-colors">All Products</Link></li>
                <li><Link href="/categories" className="hover:text-white transition-colors">Categories</Link></li>
                <li><Link href="/sellers" className="hover:text-white transition-colors">Sellers</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Account</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/auth/signin" className="hover:text-white transition-colors">Sign In</Link></li>
                <li><Link href="/auth/signup" className="hover:text-white transition-colors">Sign Up</Link></li>
                <li><Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/help" className="hover:text-white transition-colors">Help Center</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
                <li><Link href="/returns" className="hover:text-white transition-colors">Returns</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 text-center">
            <p className="text-gray-400 text-sm">
              &copy; 2024 Findora. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
