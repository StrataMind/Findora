'use client'
export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Search, 
  Star, 
  Package, 
  Users,
  Shield,
  ArrowRight,
  ArrowLeft,
  Grid3X3,
  List,
  Award,
  TrendingUp
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

export default function SellersPage() {
  const [sellers, setSellers] = useState<Seller[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('averageRating:desc')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  useEffect(() => {
    fetchSellers()
  }, [sortBy])

  const fetchSellers = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/public/sellers/featured?sortBy=${sortBy}`)
      if (response.ok) {
        const data = await response.json()
        setSellers(data.sellers || [])
      }
    } catch (error) {
      console.error('Error fetching sellers:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredSellers = sellers.filter(seller =>
    seller.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (seller.description && seller.description.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const formatRating = (rating: number) => {
    return rating ? rating.toFixed(1) : '0.0'
  }

  const renderStars = (rating: number) => (
    <div className="flex text-yellow-400">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${i < Math.floor(rating) ? 'fill-current' : ''}`}
        />
      ))}
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-8">
            {/* Back Button */}
            <div className="mb-6">
              <Link href="/">
                <Button variant="ghost" size="sm" className="flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Home
                </Button>
              </Link>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Sellers</h1>
                <p className="text-gray-600 mt-2">Discover verified sellers and their products</p>
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
        {/* Filters */}
        <div className="mb-8 flex flex-col sm:flex-row gap-4">
          <div className="flex-1 max-w-md relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search sellers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="sm:w-48">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="averageRating:desc">Highest Rated</option>
              <option value="totalSales:desc">Most Sales</option>
              <option value="totalProducts:desc">Most Products</option>
              <option value="businessName:asc">Name A-Z</option>
            </select>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Shield className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Verified Sellers</h3>
            <p className="text-gray-600 text-sm">All sellers are verified for quality and authenticity</p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Award className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Top Rated</h3>
            <p className="text-gray-600 text-sm">4.5+ average rating from customer reviews</p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-3">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Growing Fast</h3>
            <p className="text-gray-600 text-sm">New sellers joining our marketplace daily</p>
          </div>
        </div>

        {/* Sellers Grid/List */}
        {loading ? (
          <div className={viewMode === 'grid' 
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6' 
            : 'space-y-4'
          }>
            {[...Array(9)].map((_, index) => (
              <div key={index} className="bg-white rounded-lg shadow animate-pulse">
                {viewMode === 'grid' ? (
                  <div className="p-6 space-y-4">
                    <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center p-6 space-x-4">
                    <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : filteredSellers.length === 0 ? (
          <div className="text-center py-12">
            <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No sellers found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm ? 'No sellers match your search.' : 'No sellers available at the moment.'}
            </p>
            {searchTerm && (
              <Button onClick={() => setSearchTerm('')}>Clear Search</Button>
            )}
          </div>
        ) : (
          <div className={viewMode === 'grid' 
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6' 
            : 'space-y-4'
          }>
            {filteredSellers.map((seller, index) => (
              <motion.div
                key={seller.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Link href={`/seller/${seller.id}`}>
                  {viewMode === 'grid' ? (
                    <div className="bg-white rounded-lg shadow hover:shadow-lg transition-all duration-300 group">
                      <div className="p-6 text-center">
                        <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden">
                          {seller.logo ? (
                            <img
                              src={seller.logo}
                              alt={seller.businessName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Users className="h-8 w-8 text-gray-400" />
                          )}
                        </div>
                        
                        <div className="flex items-center justify-center mb-2">
                          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                            {seller.businessName}
                          </h3>
                          {seller.verificationStatus === 'VERIFIED' && (
                            <Shield className="h-4 w-4 text-green-500 ml-2" />
                          )}
                        </div>
                        
                        {seller.description && (
                          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                            {seller.description}
                          </p>
                        )}
                        
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center justify-center gap-2">
                            {renderStars(seller.averageRating)}
                            <span className="text-sm text-gray-600">
                              {formatRating(seller.averageRating)} ({seller.totalReviews})
                            </span>
                          </div>
                          
                          <div className="flex items-center justify-between text-sm text-gray-600">
                            <div className="flex items-center">
                              <Package className="h-4 w-4 mr-1" />
                              {seller.totalProducts} products
                            </div>
                            <div>
                              {seller.totalSales} sales
                            </div>
                          </div>
                        </div>
                        
                        <Button 
                          size="sm" 
                          className="w-full group-hover:bg-blue-600 transition-colors"
                        >
                          View Store
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white rounded-lg shadow hover:shadow-lg transition-all duration-300 group">
                      <div className="flex items-center p-6">
                        <div className="w-16 h-16 flex-shrink-0 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden mr-4">
                          {seller.logo ? (
                            <img
                              src={seller.logo}
                              alt={seller.businessName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Users className="h-8 w-8 text-gray-400" />
                          )}
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center mb-1">
                            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                              {seller.businessName}
                            </h3>
                            {seller.verificationStatus === 'VERIFIED' && (
                              <Shield className="h-4 w-4 text-green-500 ml-2" />
                            )}
                          </div>
                          
                          {seller.description && (
                            <p className="text-gray-600 text-sm mb-2 line-clamp-1">
                              {seller.description}
                            </p>
                          )}
                          
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              {renderStars(seller.averageRating)}
                              <span>{formatRating(seller.averageRating)}</span>
                            </div>
                            <div className="flex items-center">
                              <Package className="h-4 w-4 mr-1" />
                              {seller.totalProducts} products
                            </div>
                            <div>
                              {seller.totalSales} sales
                            </div>
                          </div>
                        </div>
                        
                        <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                      </div>
                    </div>
                  )}
                </Link>
              </motion.div>
            ))}
          </div>
        )}

        {/* Call to Action */}
        <div className="mt-16 bg-blue-50 rounded-xl p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Want to sell on Findora?</h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Join thousands of verified sellers and start selling your products to our growing customer base.
            Get started with our easy seller registration process.
          </p>
          <Link href="/seller/register">
            <Button size="lg" className="px-8">
              Become a Seller
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}