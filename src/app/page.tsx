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
import { ProductQuickView } from '@/components/modern/product-quick-view'
import Header from '@/components/navigation/header'
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
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null)
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false)

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

  const handleQuickView = (product: Product) => {
    setQuickViewProduct(product)
    setIsQuickViewOpen(true)
  }

  const closeQuickView = () => {
    setIsQuickViewOpen(false)
    setTimeout(() => setQuickViewProduct(null), 300)
  }

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
        onQuickView={(id) => handleQuickView(product)}
        onShare={(id) => console.log('Share:', id)}
        onCompare={(id) => console.log('Compare:', id)}
      />
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-950 relative overflow-hidden">
      <Header />
      
      {/* Enhanced Civil Dusk Background with Cosmic Atmosphere */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Primary cosmic gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/80 via-indigo-950/70 to-purple-950/80"></div>
        
        {/* Civil dusk horizon gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-amber-900/20 via-orange-800/10 to-transparent"></div>
        
        {/* Atmospheric nebula effects */}
        <div className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-br from-amber-500/10 to-orange-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-40 right-32 w-80 h-80 bg-gradient-to-br from-purple-500/8 to-indigo-500/4 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-32 left-1/3 w-64 h-64 bg-gradient-to-br from-orange-400/6 to-red-400/3 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>
        
        {/* Enhanced starfield with varied sizes and colors */}
        {[...Array(150)].map((_, i) => {
          // Use deterministic positioning based on index
          const seed1 = (i * 7919) % 10000 // Prime number for better distribution
          const seed2 = (i * 6151) % 10000 // Another prime number
          const top = (seed1 / 100).toFixed(2)
          const left = (seed2 / 100).toFixed(2)
          const duration = 1.5 + ((i * 31) % 400) / 100 // Deterministic duration between 1.5-5.5s
          const delay = ((i * 17) % 600) / 100 // Deterministic delay 0-6s
          
          // Determine star type and properties
          const starType = i % 8
          let starClass = ''
          let starSize = ''
          
          if (starType === 0) {
            // Bright amber stars (civil dusk theme)
            starClass = 'bg-amber-300'
            starSize = 'w-1.5 h-1.5'
          } else if (starType === 1) {
            // Golden stars
            starClass = 'bg-yellow-200'
            starSize = 'w-1 h-1'
          } else if (starType === 2) {
            // Warm white stars
            starClass = 'bg-orange-100'
            starSize = 'w-0.5 h-0.5'
          } else if (starType === 3) {
            // Blue-white stars
            starClass = 'bg-blue-100'
            starSize = 'w-0.5 h-0.5'
          } else if (starType === 4) {
            // Tiny distant stars
            starClass = 'bg-slate-200'
            starSize = 'w-px h-px'
          } else if (starType === 5) {
            // Purple distant stars
            starClass = 'bg-purple-200'
            starSize = 'w-px h-px'
          } else if (starType === 6) {
            // Medium warm stars
            starClass = 'bg-amber-200'
            starSize = 'w-0.5 h-0.5'
          } else {
            // Standard white stars
            starClass = 'bg-white'
            starSize = 'w-px h-px'
          }
          
          return (
            <motion.div
              key={i}
              className={`absolute rounded-full ${starSize} ${starClass} shadow-sm`}
              style={{
                top: `${top}%`,
                left: `${left}%`,
                boxShadow: starType <= 2 ? `0 0 ${starType + 2}px currentColor` : 'none'
              }}
              animate={{
                opacity: [0.2, 1, 0.2],
                scale: starType <= 2 ? [0.8, 1.3, 0.8] : [0.9, 1.1, 0.9],
              }}
              transition={{
                duration,
                repeat: Infinity,
                delay,
              }}
            />
          )
        })}
        
        {/* Shooting stars effect */}
        {[...Array(3)].map((_, i) => {
          const shootingDelay = i * 15 + 5 // 5s, 20s, 35s intervals
          const startX = ((i + 1) * 2347) % 100 // Deterministic start position
          
          return (
            <motion.div
              key={`shooting-${i}`}
              className="absolute w-1 h-1 bg-gradient-to-r from-amber-300 to-transparent rounded-full"
              style={{
                top: `${10 + i * 20}%`,
                left: `${startX}%`
              }}
              initial={{ 
                opacity: 0,
                x: 0,
                y: 0,
                scale: 0.5
              }}
              animate={{
                opacity: [0, 1, 0],
                x: [-200, 200],
                y: [0, 100],
                scale: [0.5, 1, 0.3]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: shootingDelay,
                ease: "easeOut"
              }}
            />
          )
        })}
      </div>

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

      {/* Quick View Modal */}
      <ProductQuickView
        product={quickViewProduct ? {
          id: quickViewProduct.id,
          name: quickViewProduct.name,
          price: quickViewProduct.price,
          originalPrice: quickViewProduct.compareAtPrice,
          images: quickViewProduct.images?.map(img => img.url) || ['/api/placeholder/400/400'],
          rating: quickViewProduct.averageRating || 4.0,
          reviews: quickViewProduct.totalReviews || 0,
          category: quickViewProduct.category?.name || 'General',
          badge: quickViewProduct.compareAtPrice && quickViewProduct.compareAtPrice > quickViewProduct.price ? 'sale' as const : undefined,
          discount: quickViewProduct.compareAtPrice && quickViewProduct.compareAtPrice > quickViewProduct.price 
            ? Math.round(((quickViewProduct.compareAtPrice - quickViewProduct.price) / quickViewProduct.compareAtPrice) * 100) 
            : undefined,
          seller: quickViewProduct.seller?.businessName || 'Unknown Seller',
          freeShipping: true,
          fastDelivery: quickViewProduct.id.length % 2 === 0,
          inStock: quickViewProduct.stock > 0,
          stockCount: quickViewProduct.stock,
          description: `Experience the premium quality of ${quickViewProduct.name}. This carefully selected product offers exceptional value and performance, making it perfect for your needs.`
        } : null}
        isOpen={isQuickViewOpen}
        onClose={closeQuickView}
      />
    </div>
  )
}
