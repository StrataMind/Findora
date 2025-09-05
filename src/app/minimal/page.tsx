'use client'
export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import MinimalButton from '@/components/ui/minimal-button'
import MinimalCard from '@/components/ui/minimal-card'
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
  Truck,
  CheckCircle,
  Award
} from 'lucide-react'

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

export default function MinimalPage() {
  const { data: session, status } = useSession()
  const [searchQuery, setSearchQuery] = useState('')
  const recommendations = useRecommendations()
  
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [featured, categoryData] = await Promise.all([
        recommendations.getFeaturedProducts({ limit: 6 }),
        recommendations.getCategoryShowcase({ limit: 6 })
      ])

      setFeaturedProducts(featured)
      setCategories(categoryData.categories || [])
    } catch (error) {
      console.error('Error loading data:', error)
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
    <div className="flex text-amber-400">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className={`h-3 w-3 ${i < Math.floor(rating) ? 'fill-current' : ''}`}
        />
      ))}
    </div>
  )

  const ProductCard = ({ product }: { product: Product }) => (
    <MinimalCard className="group overflow-hidden">
      <div className="relative aspect-square overflow-hidden rounded-xl mb-4">
        {product.images.length > 0 ? (
          <img
            src={product.images[0].url}
            alt={product.images[0].altText || product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gray-100 flex items-center justify-center">
            <Package className="h-12 w-12 text-gray-300" />
          </div>
        )}
        
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button className="w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors">
            <Heart className="h-4 w-4 text-gray-600" />
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <h3 className="font-medium text-gray-900 text-sm line-clamp-2 group-hover:text-blue-600 transition-colors">
            <Link href={`/products/${product.slug}`}>
              {product.name}
            </Link>
          </h3>
          <p className="text-xs text-gray-500 mt-1">{product.seller.businessName}</p>
        </div>

        <div className="flex items-center gap-2">
          {renderStars(product.averageRating)}
          <span className="text-xs text-gray-500">({product.totalReviews})</span>
          {product.seller.verificationStatus === 'VERIFIED' && (
            <Shield className="h-3 w-3 text-green-500" />
          )}
        </div>

        <div className="flex items-center justify-between">
          <div>
            <span className="font-semibold text-gray-900">
              {formatPrice(product.price)}
            </span>
            {product.compareAtPrice && product.compareAtPrice > product.price && (
              <span className="text-xs text-gray-400 line-through ml-2">
                {formatPrice(product.compareAtPrice)}
              </span>
            )}
          </div>
          <Link href={`/products/${product.slug}`}>
            <MinimalButton size="sm" variant="outline">
              View
            </MinimalButton>
          </Link>
        </div>
      </div>
    </MinimalCard>
  )

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">Findora</h1>
              <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">Minimal</span>
            </Link>
            
            <div className="hidden md:flex items-center space-x-6">
              <Link href="/products" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                Products
              </Link>
              <Link href="/categories" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                Categories
              </Link>
              <Link href="/sellers" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                Sellers
              </Link>
            </div>

            <div className="flex items-center space-x-3">
              {status === 'loading' ? (
                <div className="flex items-center space-x-2">
                  <div className="h-8 w-16 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-8 w-20 bg-gray-200 rounded animate-pulse"></div>
                </div>
              ) : session ? (
                <>
                  <span className="text-sm text-gray-600 hidden sm:block">
                    {session.user?.name || session.user?.email}
                  </span>
                  <Link href="/dashboard">
                    <MinimalButton size="sm">Dashboard</MinimalButton>
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/auth/signin">
                    <MinimalButton variant="ghost" size="sm">Sign In</MinimalButton>
                  </Link>
                  <Link href="/auth/signup">
                    <MinimalButton size="sm">Sign Up</MinimalButton>
                  </Link>
                </>
              )}
              
              <div className="border-l border-gray-200 pl-3">
                <Link href="/">
                  <MinimalButton variant="outline" size="sm">
                    Full Design
                  </MinimalButton>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-16 lg:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <motion.h1 
              className="text-4xl md:text-5xl font-bold text-gray-900 mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              Simple. Clean. Beautiful.
            </motion.h1>
            
            <motion.p 
              className="text-lg text-gray-600 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              Discover amazing products with our minimalist shopping experience.
            </motion.p>

            {/* Search Bar */}
            <motion.div 
              className="max-w-xl mx-auto mb-10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </motion.div>

            {/* Stats */}
            <motion.div 
              className="grid grid-cols-3 gap-6 max-w-lg mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">10K+</div>
                <div className="text-sm text-gray-500">Products</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">500+</div>
                <div className="text-sm text-gray-500">Sellers</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">4.9★</div>
                <div className="text-sm text-gray-500">Rating</div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Shield className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Verified Sellers</h3>
              <p className="text-sm text-gray-600">All sellers are verified for quality</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Truck className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Fast Delivery</h3>
              <p className="text-sm text-gray-600">Quick delivery to your doorstep</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Quality Guarantee</h3>
              <p className="text-sm text-gray-600">100% satisfaction guarantee</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Featured Products</h2>
              <p className="text-gray-600">Handpicked just for you</p>
            </div>
            <Link href="/products">
              <MinimalButton variant="outline">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </MinimalButton>
            </Link>
          </div>
          
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-gray-200 rounded-2xl aspect-square animate-pulse"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredProducts.slice(0, 6).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Categories</h2>
            <p className="text-gray-600">Explore by category</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.slice(0, 6).map((category) => (
              <Link key={category.id} href={`/categories/${category.slug}`}>
                <MinimalCard className="text-center hover:shadow-md transition-shadow">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Package className="h-5 w-5 text-gray-600" />
                  </div>
                  <h3 className="font-medium text-gray-900 text-sm mb-1">{category.name}</h3>
                  <p className="text-xs text-gray-500">{category._count.products} items</p>
                </MinimalCard>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-bold text-gray-900 mb-4">Findora</h3>
              <p className="text-sm text-gray-600">
                Simple, clean marketplace for quality products.
              </p>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Shop</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><Link href="/products" className="hover:text-gray-900">Products</Link></li>
                <li><Link href="/categories" className="hover:text-gray-900">Categories</Link></li>
                <li><Link href="/sellers" className="hover:text-gray-900">Sellers</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Account</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><Link href="/auth/signin" className="hover:text-gray-900">Sign In</Link></li>
                <li><Link href="/auth/signup" className="hover:text-gray-900">Sign Up</Link></li>
                <li><Link href="/dashboard" className="hover:text-gray-900">Dashboard</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Support</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><Link href="/help" className="hover:text-gray-900">Help</Link></li>
                <li><Link href="/contact" className="hover:text-gray-900">Contact</Link></li>
                <li><Link href="/returns" className="hover:text-gray-900">Returns</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-100 pt-6 text-center">
            <p className="text-sm text-gray-500">
              © 2024 Findora. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}