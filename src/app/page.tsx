'use client'
export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { useRecommendations, Product } from '@/lib/recommendations'
import { CartButton } from '@/components/cart/cart-button'
import { AddToCartButton } from '@/components/cart/add-to-cart-button'
import { StunningHero } from '@/components/modern/stunning-hero'
import { CategoryShowcase } from '@/components/modern/category-showcase'
import { FeaturesSection } from '@/components/modern/features-section'
import { TestimonialsSection } from '@/components/modern/testimonials-section'
import { AdvancedProductCard } from '@/components/modern/advanced-product-card'
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

  const ProductCard = ({ product }: { product: Product }) => {
    // Transform Product to AdvancedProductCard format
    const transformedProduct = {
      id: product.id,
      name: product.name,
      price: product.price,
      originalPrice: product.compareAtPrice,
      images: product.images?.map(img => img.url) || ['/api/placeholder/300/300'],
      rating: product.averageRating || 4.0,
      reviews: product.totalReviews || 0,
      category: product.category?.name || 'General',
      badge: product.compareAtPrice && product.compareAtPrice > product.price ? 'sale' as const : undefined,
      discount: product.compareAtPrice && product.compareAtPrice > product.price 
        ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100) 
        : undefined,
      seller: product.seller?.businessName || 'Unknown Seller',
      freeShipping: true,
      fastDelivery: product.id.length % 2 === 0, // Deterministic based on product ID
      inStock: product.stock > 0,
      stockCount: product.stock
    }

    return (
      <AdvancedProductCard
        product={transformedProduct}
        variant="compact"
        onAddToCart={(id) => console.log('Add to cart:', id)}
        onWishlist={(id) => console.log('Add to wishlist:', id)}
        onQuickView={(id) => console.log('Quick view:', id)}
        onShare={(id) => console.log('Share:', id)}
        onCompare={(id) => console.log('Compare:', id)}
      />
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-800 relative overflow-hidden">
      {/* Starry background */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(100)].map((_, i) => {
          // Use deterministic positioning based on index
          const seed1 = (i * 7919) % 10000 // Prime number for better distribution
          const seed2 = (i * 6151) % 10000 // Another prime number
          const top = (seed1 / 100).toFixed(2)
          const left = (seed2 / 100).toFixed(2)
          const duration = 2 + ((i * 31) % 300) / 100 // Deterministic duration between 2-5s
          const delay = ((i * 17) % 200) / 100 // Deterministic delay 0-2s
          
          return (
            <motion.div
              key={i}
              className={`absolute rounded-full ${
                i % 3 === 0 ? 'w-1 h-1 bg-yellow-200' : 
                i % 3 === 1 ? 'w-0.5 h-0.5 bg-blue-200' : 
                'w-px h-px bg-white'
              }`}
              style={{
                top: `${top}%`,
                left: `${left}%`,
              }}
              animate={{
                opacity: [0.3, 1, 0.3],
                scale: [0.8, 1.2, 0.8],
              }}
              transition={{
                duration,
                repeat: Infinity,
                delay,
              }}
            />
          )
        })}
      </div>
      {/* Enhanced Navigation */}
      <nav className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-xl border-b border-slate-700 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center group">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent group-hover:from-amber-300 group-hover:to-orange-400 transition-all duration-300">
                Findora
              </h1>
            </Link>
            
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/products" className="text-sm font-medium text-slate-300 hover:text-amber-400 transition-all duration-300 hover:scale-105 relative after:absolute after:w-0 after:h-0.5 after:bg-amber-400 after:left-0 after:-bottom-1 hover:after:w-full after:transition-all after:duration-300">
                Products
              </Link>
              <Link href="/categories" className="text-sm font-medium text-slate-300 hover:text-amber-400 transition-all duration-300 hover:scale-105 relative after:absolute after:w-0 after:h-0.5 after:bg-amber-400 after:left-0 after:-bottom-1 hover:after:w-full after:transition-all after:duration-300">
                Categories
              </Link>
              <Link href="/sellers" className="text-sm font-medium text-slate-300 hover:text-amber-400 transition-all duration-300 hover:scale-105 relative after:absolute after:w-0 after:h-0.5 after:bg-amber-400 after:left-0 after:-bottom-1 hover:after:w-full after:transition-all after:duration-300">
                Sellers
              </Link>
            </div>

            <div className="flex items-center space-x-4">
              {status === 'loading' ? (
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-16 bg-gradient-to-r from-slate-700 to-slate-600 rounded-xl animate-pulse"></div>
                  <div className="h-8 w-20 bg-gradient-to-r from-slate-700 to-slate-600 rounded-xl animate-pulse"></div>
                </div>
              ) : session ? (
                <>
                  <span className="text-sm text-slate-300 hidden sm:block font-medium">
                    {session.user?.name || session.user?.email}
                  </span>
                  <CartButton />
                  <Link href="/dashboard">
                    <Button size="sm" className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                      Dashboard
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/auth/signin">
                    <Button variant="ghost" size="sm" className="hover:bg-slate-800 hover:text-amber-400 text-slate-300 transition-all duration-300">
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/auth/signup">
                    <Button size="sm" className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                      Sign Up
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <StunningHero />

      {/* Features */}
      <FeaturesSection />

      {/* Enhanced Featured Products Section */}
      <section className="py-20 bg-gradient-to-br from-slate-800 via-slate-900 to-indigo-900 relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute top-10 left-10 w-72 h-72 bg-gradient-to-br from-amber-400/20 to-orange-400/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-gradient-to-br from-orange-400/10 to-red-400/10 rounded-full blur-3xl"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div 
            className="flex items-center justify-between mb-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="text-center lg:text-left">
              <h2 className="text-4xl lg:text-5xl font-bold mb-4">
                <span className="bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
                  Featured Products
                </span>
              </h2>
              <p className="text-xl text-slate-300 max-w-2xl">
                Discover our handpicked collection of premium products with exclusive deals
              </p>
            </div>
            <Link href="/products">
              <Button className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 px-6 py-3 rounded-xl">
                <span className="flex items-center gap-2 font-semibold">
                  View All
                  <ArrowRight className="h-5 w-5" />
                </span>
              </Button>
            </Link>
          </motion.div>
          
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {[...Array(8)].map((_, i) => (
                <motion.div 
                  key={i} 
                  className="bg-white rounded-2xl p-6 shadow-lg"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                >
                  <div className="aspect-square bg-gradient-to-br from-gray-200 to-gray-300 rounded-xl mb-4 animate-pulse"></div>
                  <div className="space-y-3">
                    <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg animate-pulse"></div>
                    <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-3/4 animate-pulse"></div>
                    <div className="h-6 bg-gradient-to-r from-amber-200 to-orange-200 rounded-lg w-1/2 animate-pulse"></div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div 
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              {featuredProducts.slice(0, 8).map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="group"
                >
                  <div className="bg-slate-800 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-500 border border-slate-700 hover:border-amber-400 group-hover:-translate-y-2">
                    <ProductCard product={product} />
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* Categories */}
      <CategoryShowcase />

      {/* Enhanced Trending Products Section */}
      <section className="py-20 bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950 relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute top-16 right-16 w-80 h-80 bg-gradient-to-br from-amber-400/20 to-orange-400/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-16 left-16 w-64 h-64 bg-gradient-to-br from-yellow-400/10 to-amber-400/10 rounded-full blur-3xl"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div 
            className="flex items-center justify-between mb-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="text-center lg:text-left">
              <h2 className="text-4xl lg:text-5xl font-bold mb-4 flex items-center gap-4">
                <motion.div 
                  className="p-3 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl shadow-lg"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ duration: 0.3 }}
                >
                  <TrendingUp className="h-8 w-8 text-white" />
                </motion.div>
                <span className="bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
                  Trending Now
                </span>
              </h2>
              <p className="text-xl text-slate-300 max-w-2xl">
                Discover what's hot right now - most popular products this week
              </p>
            </div>
            <Link href="/products?sort=trending">
              <Button className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 px-6 py-3 rounded-xl">
                <span className="flex items-center gap-2 font-semibold">
                  View All
                  <ArrowRight className="h-5 w-5" />
                </span>
              </Button>
            </Link>
          </motion.div>
          
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {[...Array(8)].map((_, i) => (
                <motion.div 
                  key={i} 
                  className="bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-700"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                >
                  <div className="aspect-square bg-gradient-to-br from-orange-200 to-red-200 rounded-xl mb-4 animate-pulse"></div>
                  <div className="space-y-3">
                    <div className="h-4 bg-gradient-to-r from-amber-400/20 to-orange-400/20 rounded-lg animate-pulse"></div>
                    <div className="h-4 bg-gradient-to-r from-amber-400/20 to-orange-400/20 rounded-lg w-3/4 animate-pulse"></div>
                    <div className="h-6 bg-gradient-to-r from-amber-400/30 to-orange-400/30 rounded-lg w-1/2 animate-pulse"></div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div 
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              {trendingProducts.slice(0, 8).map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="group"
                >
                  <div className="bg-slate-800 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-500 border border-slate-700 hover:border-amber-400 group-hover:-translate-y-2 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-amber-400/10 to-orange-400/10 rounded-full -translate-y-8 translate-x-8"></div>
                    <ProductCard product={product} />
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* Testimonials */}
      <TestimonialsSection />

      {/* Enhanced Footer */}
      <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white py-16 relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-amber-500/50 to-transparent"></div>
        <div className="absolute top-8 right-8 w-32 h-32 bg-gradient-to-br from-amber-600/10 to-orange-600/10 rounded-full blur-2xl"></div>
        <div className="absolute bottom-8 left-8 w-48 h-48 bg-gradient-to-br from-orange-600/10 to-red-600/10 rounded-full blur-3xl"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            <div>
              <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                Findora
              </h3>
              <p className="text-gray-300 text-sm leading-relaxed mb-4">
                Your trusted marketplace for quality products from verified sellers worldwide.
              </p>
              <div className="flex space-x-3">
                {['facebook', 'twitter', 'instagram', 'linkedin'].map((social) => (
                  <a
                    key={social}
                    href="#"
                    className="w-10 h-10 bg-gradient-to-br from-gray-700 to-gray-800 rounded-xl flex items-center justify-center hover:from-amber-500 hover:to-orange-600 transition-all duration-300 hover:scale-110 hover:shadow-lg"
                  >
                    <span className="text-sm font-semibold capitalize">{social[0]}</span>
                  </a>
                ))}
              </div>
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
