'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useRecommendations, Product } from '@/lib/recommendations'
import { 
  TrendingUp, 
  Star, 
  ShoppingCart, 
  Users, 
  Package, 
  ArrowRight,
  Shield,
  Award,
  Heart,
  Eye,
  Sparkles,
  Clock,
  Grid3X3
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
  const recommendations = useRecommendations()
  
  // Product sections state
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [trendingProducts, setTrendingProducts] = useState<Product[]>([])
  const [newArrivals, setNewArrivals] = useState<Product[]>([])
  const [recentlyViewed, setRecentlyViewed] = useState<Product[]>([])
  const [featuredSellers, setFeaturedSellers] = useState<Seller[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setMounted(true)
    loadHomePageData()
  }, [])

  const loadHomePageData = async () => {
    try {
      setLoading(true)
      
      // Load all sections in parallel
      const [
        featured,
        trending,
        newProducts,
        recent,
        sellers,
        categoryData
      ] = await Promise.all([
        recommendations.getFeaturedProducts({ limit: 8 }),
        recommendations.getTrendingProducts({ limit: 8 }),
        recommendations.getNewArrivals({ limit: 8 }),
        recommendations.getRecentlyViewedProducts({ limit: 6 }),
        recommendations.getFeaturedSellers({ limit: 6 }),
        recommendations.getCategoryShowcase({ limit: 8 })
      ])

      setFeaturedProducts(featured)
      setTrendingProducts(trending)
      setNewArrivals(newProducts)
      setRecentlyViewed(recent)
      setFeaturedSellers(sellers.sellers || [])
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

  const renderStars = (rating: number) => {
    return (
      <div className="flex text-yellow-400">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-3 w-3 ${i < Math.floor(rating) ? 'fill-current' : ''}`}
          />
        ))}
      </div>
    )
  }

  const ProductCard = ({ product, showQuickActions = true }: { product: Product; showQuickActions?: boolean }) => (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200 group">
      <div className="relative">
        <div className="aspect-square overflow-hidden">
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

        {showQuickActions && (
          <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="flex space-x-1">
              <Button size="sm" variant="secondary" className="h-8 w-8 p-0">
                <Heart className="h-4 w-4" />
              </Button>
              <Link href={`/products/${product.slug}`}>
                <Button size="sm" variant="secondary" className="h-8 w-8 p-0">
                  <Eye className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="mb-2">
          <h3 className="font-semibold text-gray-900 hover:text-blue-600 line-clamp-2">
            <Link href={`/products/${product.slug}`}>
              {product.name}
            </Link>
          </h3>
          <p className="text-sm text-gray-600">{product.seller.businessName}</p>
        </div>

        <div className="mb-2">
          <div className="flex items-center space-x-2">
            {renderStars(product.averageRating)}
            <span className="text-sm text-gray-600">({product.totalReviews})</span>
            {product.seller.verificationStatus === 'VERIFIED' && (
              <Shield className="h-3 w-3 text-green-600" />
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
          <Link href={`/products/${product.slug}`}>
            <Button size="sm">
              <ShoppingCart className="h-4 w-4 mr-1" />
              View
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )

  const SectionHeader = ({ 
    title, 
    subtitle, 
    icon: Icon, 
    viewAllLink 
  }: { 
    title: string; 
    subtitle?: string; 
    icon?: any; 
    viewAllLink?: string 
  }) => (
    <div className="flex items-center justify-between mb-8">
      <div>
        <div className="flex items-center space-x-2 mb-2">
          {Icon && <Icon className="h-6 w-6 text-blue-600" />}
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        </div>
        {subtitle && <p className="text-gray-600">{subtitle}</p>}
      </div>
      {viewAllLink && (
        <Link href={viewAllLink}>
          <Button variant="outline">
            View All
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </Link>
      )}
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/">
                <h1 className="text-2xl font-bold text-gray-900">Findora</h1>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              {!mounted ? (
                <div className="flex items-center space-x-4">
                  <div className="h-9 w-24 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-9 w-16 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-9 w-20 bg-gray-200 rounded animate-pulse"></div>
                </div>
              ) : (
                <>
                  <Link href="/products">
                    <Button variant="ghost" size="sm">Browse Products</Button>
                  </Link>
                  {status === 'loading' ? (
                    <div className="flex items-center space-x-4">
                      <div className="h-9 w-16 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-9 w-20 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                  ) : session ? (
                    <>
                      <span className="text-sm text-gray-700">
                        Welcome, {session.user?.name || session.user?.email}
                      </span>
                      <Link href="/dashboard">
                        <Button size="sm">Dashboard</Button>
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link href="/auth/signin">
                        <Button variant="outline" size="sm">Sign In</Button>
                      </Link>
                      <Link href="/auth/signup">
                        <Button size="sm">Sign Up</Button>
                      </Link>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-purple-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-4xl font-bold sm:text-6xl">
              Discover Amazing Products
            </h1>
            <p className="mt-6 text-lg text-blue-100 max-w-3xl mx-auto">
              Your modern e-commerce platform with personalized recommendations, 
              secure shopping, and thousands of products from verified sellers.
            </p>
            
            <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/products">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 w-full sm:w-auto">
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  Start Shopping
                </Button>
              </Link>
              {!session && (
                <Link href="/auth/signup">
                  <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-blue-600 w-full sm:w-auto">
                    Join Findora
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Categories Showcase */}
        <section className="py-16">
          <SectionHeader
            title="Shop by Category"
            subtitle="Explore our wide range of product categories"
            icon={Grid3X3}
            viewAllLink="/products"
          />
          
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white p-6 rounded-lg shadow-sm animate-pulse">
                  <div className="w-12 h-12 bg-gray-200 rounded-lg mx-auto mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-16 mx-auto"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
              {categories.map((category) => (
                <Link key={category.id} href={`/categories/${category.slug}`}>
                  <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow text-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <Package className="h-6 w-6 text-blue-600" />
                    </div>
                    <h3 className="font-medium text-gray-900 mb-1">{category.name}</h3>
                    <p className="text-xs text-gray-600">{category._count.products} items</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Recently Viewed */}
        {recentlyViewed.length > 0 && (
          <section className="py-16">
            <SectionHeader
              title="Recently Viewed"
              subtitle="Continue where you left off"
              icon={Clock}
            />
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {recentlyViewed.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        )}

        {/* Featured Products */}
        <section className="py-16">
          <SectionHeader
            title="Featured Products"
            subtitle="Hand-picked favorites from our collection"
            icon={Sparkles}
            viewAllLink="/products?featured=true"
          />
          
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow animate-pulse">
                  <div className="aspect-square bg-gray-200"></div>
                  <div className="p-4 space-y-2">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </section>

        {/* Trending Products */}
        <section className="py-16 bg-white rounded-lg shadow-sm">
          <div className="px-8">
            <SectionHeader
              title="Trending Now"
              subtitle="Most popular products this week"
              icon={TrendingUp}
              viewAllLink="/products?sortBy=trending"
            />
            
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="bg-gray-50 rounded-lg shadow animate-pulse">
                    <div className="aspect-square bg-gray-200"></div>
                    <div className="p-4 space-y-2">
                      <div className="h-4 bg-gray-200 rounded"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {trendingProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* New Arrivals */}
        <section className="py-16">
          <SectionHeader
            title="New Arrivals"
            subtitle="Fresh products just added to our store"
            icon={Sparkles}
            viewAllLink="/products?sortBy=createdAt:desc"
          />
          
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow animate-pulse">
                  <div className="aspect-square bg-gray-200"></div>
                  <div className="p-4 space-y-2">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {newArrivals.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </section>

        {/* Featured Sellers */}
        <section className="py-16 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg">
          <div className="px-8">
            <SectionHeader
              title="Featured Sellers"
              subtitle="Top-rated verified sellers on our platform"
              icon={Award}
            />
            
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white p-6 rounded-lg shadow animate-pulse">
                    <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-3/4 mx-auto mb-4"></div>
                    <div className="flex justify-center space-x-4">
                      <div className="h-3 bg-gray-200 rounded w-16"></div>
                      <div className="h-3 bg-gray-200 rounded w-16"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredSellers.map((seller) => (
                  <div key={seller.id} className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Users className="h-8 w-8 text-white" />
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-2">{seller.businessName}</h3>
                      <div className="flex items-center justify-center mb-4">
                        {renderStars(seller.averageRating)}
                        <span className="ml-2 text-sm text-gray-600">({seller.totalReviews})</span>
                      </div>
                      <div className="flex items-center justify-center space-x-4 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Package className="h-4 w-4 mr-1" />
                          {seller.totalProducts} products
                        </div>
                        <div className="flex items-center">
                          <Shield className="h-4 w-4 mr-1 text-green-600" />
                          Verified
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-16 text-center">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-12 text-white">
            <h2 className="text-3xl font-bold mb-4">Ready to Start Shopping?</h2>
            <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
              Join thousands of satisfied customers and discover amazing products from verified sellers.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/products">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 w-full sm:w-auto">
                  Browse All Products
                </Button>
              </Link>
              {!session && (
                <Link href="/auth/signup">
                  <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-blue-600 w-full sm:w-auto">
                    Create Account
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-white mb-4">Findora</h3>
            <p className="mb-4">Your trusted e-commerce platform</p>
            <div className="flex justify-center space-x-6">
              <Link href="/products" className="hover:text-white">Products</Link>
              <Link href="/auth/signin" className="hover:text-white">Sign In</Link>
              <Link href="/auth/signup" className="hover:text-white">Sign Up</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
