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
    return (rating && rating > 0) ? rating.toFixed(1) : '0.0'
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-800">
      {/* Enhanced Header */}
      <div className="bg-slate-800/80 backdrop-blur-xl shadow-lg border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-8">
            {/* Back Button */}
            <motion.div 
              className="mb-6"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Link href="/">
                <Button variant="ghost" size="sm" className="flex items-center gap-2 hover:bg-slate-700 hover:text-amber-400 text-slate-300 transition-all duration-300 rounded-xl">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Home
                </Button>
              </Link>
            </motion.div>
            
            <motion.div 
              className="flex items-center justify-between"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div>
                <h1 className="text-4xl lg:text-5xl font-bold mb-3">
                  <span className="bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
                    Sellers
                  </span>
                </h1>
                <p className="text-xl text-slate-300 max-w-2xl">
                  Discover verified sellers and their premium products from around the world
                </p>
              </div>
              <motion.div 
                className="flex items-center space-x-2"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className={`rounded-xl transition-all duration-300 ${
                    viewMode === 'grid' 
                      ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg' 
                      : 'hover:bg-slate-700 hover:border-amber-400 text-slate-300'
                  }`}
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className={`rounded-xl transition-all duration-300 ${
                    viewMode === 'list' 
                      ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg' 
                      : 'hover:bg-slate-700 hover:border-amber-400 text-slate-300'
                  }`}
                >
                  <List className="h-4 w-4" />
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
        {/* Enhanced Filters */}
        <motion.div 
          className="mb-12 flex flex-col sm:flex-row gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="flex-1 max-w-md relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
            <Input
              placeholder="Search sellers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 pr-4 py-3 rounded-xl border-slate-600 bg-slate-700/70 backdrop-blur-sm focus:border-amber-500 focus:ring-2 focus:ring-amber-400/20 transition-all duration-300 shadow-sm hover:shadow-md text-white placeholder-slate-400"
            />
          </div>
          
          <div className="sm:w-52">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full rounded-xl border border-slate-600 bg-slate-700/70 backdrop-blur-sm px-4 py-3 text-sm focus:border-amber-500 focus:ring-2 focus:ring-amber-400/20 transition-all duration-300 shadow-sm hover:shadow-md text-slate-300"
            >
              <option value="averageRating:desc">Highest Rated</option>
              <option value="totalSales:desc">Most Sales</option>
              <option value="totalProducts:desc">Most Products</option>
              <option value="businessName:asc">Name A-Z</option>
            </select>
          </div>
        </motion.div>

        {/* Enhanced Stats */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
        >
          <motion.div 
            className="bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl p-8 text-center transition-all duration-500 border border-slate-700 hover:border-amber-400 group"
            whileHover={{ scale: 1.02, y: -5 }}
          >
            <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-slate-100 mb-2">Verified Sellers</h3>
            <p className="text-slate-300">All sellers are verified for quality and authenticity</p>
          </motion.div>
          
          <motion.div 
            className="bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl p-8 text-center transition-all duration-500 border border-slate-700 hover:border-orange-400 group"
            whileHover={{ scale: 1.02, y: -5 }}
          >
            <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
              <Award className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-slate-100 mb-2">Top Rated</h3>
            <p className="text-slate-300">4.5+ average rating from customer reviews</p>
          </motion.div>
          
          <motion.div 
            className="bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl p-8 text-center transition-all duration-500 border border-slate-700 hover:border-red-400 group"
            whileHover={{ scale: 1.02, y: -5 }}
          >
            <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
              <TrendingUp className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-slate-100 mb-2">Growing Fast</h3>
            <p className="text-slate-300">New sellers joining our marketplace daily</p>
          </motion.div>
        </motion.div>

        {/* Sellers Grid/List */}
        {loading ? (
          <div className={viewMode === 'grid' 
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6' 
            : 'space-y-4'
          }>
            {[...Array(9)].map((_, index) => (
              <div key={index} className="bg-slate-800 rounded-lg shadow animate-pulse">
                {viewMode === 'grid' ? (
                  <div className="p-6 space-y-4">
                    <div className="w-16 h-16 bg-slate-600 rounded-full mx-auto"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-slate-600 rounded"></div>
                      <div className="h-4 bg-slate-600 rounded w-3/4 mx-auto"></div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center p-6 space-x-4">
                    <div className="w-16 h-16 bg-slate-600 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-slate-600 rounded"></div>
                      <div className="h-4 bg-slate-600 rounded w-3/4"></div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : filteredSellers.length === 0 ? (
          <div className="text-center py-12">
            <Users className="mx-auto h-12 w-12 text-slate-400 mb-4" />
            <h3 className="text-lg font-medium text-slate-200 mb-2">No sellers found</h3>
            <p className="text-slate-400 mb-4">
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
                    <div className="bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 group border border-slate-700 hover:border-amber-400 overflow-hidden">
                      <div className="p-8 text-center relative">
                        {/* Background decoration */}
                        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-full -translate-y-10 translate-x-10 group-hover:scale-150 transition-transform duration-700"></div>
                        
                        <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-slate-600 to-slate-700 rounded-2xl flex items-center justify-center overflow-hidden shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110 relative z-10">
                          {seller.logo ? (
                            <img
                              src={seller.logo}
                              alt={seller.businessName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Users className="h-10 w-10 text-slate-400" />
                          )}
                        </div>
                        
                        <div className="flex items-center justify-center mb-3 relative z-10">
                          <h3 className="text-xl font-bold text-slate-100 group-hover:text-amber-400 transition-colors duration-300">
                            {seller.businessName}
                          </h3>
                          {seller.verificationStatus === 'VERIFIED' && (
                            <motion.div
                              whileHover={{ scale: 1.2, rotate: 10 }}
                              className="ml-2"
                            >
                              <Shield className="h-5 w-5 text-green-500" />
                            </motion.div>
                          )}
                        </div>
                        
                        {seller.description && (
                          <p className="text-slate-300 mb-6 line-clamp-2 leading-relaxed">
                            {seller.description}
                          </p>
                        )}
                        
                        <div className="space-y-4 mb-6 relative z-10">
                          <div className="flex items-center justify-center gap-2">
                            <div className="flex items-center">
                              {renderStars(seller.averageRating)}
                            </div>
                            <span className="text-sm font-semibold text-slate-800 bg-amber-200 px-2 py-1 rounded-full">
                              {formatRating(seller.averageRating)} ({seller.totalReviews})
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="flex items-center justify-center bg-amber-100 rounded-xl p-3 group-hover:bg-amber-200 transition-colors duration-300">
                              <Package className="h-4 w-4 mr-2 text-amber-700" />
                              <span className="font-medium text-slate-800">{seller.totalProducts} products</span>
                            </div>
                            <div className="flex items-center justify-center bg-orange-100 rounded-xl p-3 group-hover:bg-orange-200 transition-colors duration-300">
                              <TrendingUp className="h-4 w-4 mr-2 text-orange-700" />
                              <span className="font-medium text-slate-800">{seller.totalSales} sales</span>
                            </div>
                          </div>
                        </div>
                        
                        <Button 
                          className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 rounded-xl py-3 font-semibold relative z-10"
                        >
                          <span className="flex items-center justify-center gap-2">
                            View Store
                            <ArrowRight className="h-4 w-4" />
                          </span>
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-slate-800 rounded-lg shadow hover:shadow-lg transition-all duration-300 group">
                      <div className="flex items-center p-6">
                        <div className="w-16 h-16 flex-shrink-0 bg-slate-700 rounded-full flex items-center justify-center overflow-hidden mr-4">
                          {seller.logo ? (
                            <img
                              src={seller.logo}
                              alt={seller.businessName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Users className="h-8 w-8 text-slate-400" />
                          )}
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center mb-1">
                            <h3 className="text-lg font-semibold text-slate-100 group-hover:text-amber-400 transition-colors">
                              {seller.businessName}
                            </h3>
                            {seller.verificationStatus === 'VERIFIED' && (
                              <Shield className="h-4 w-4 text-green-500 ml-2" />
                            )}
                          </div>
                          
                          {seller.description && (
                            <p className="text-slate-300 text-sm mb-2 line-clamp-1">
                              {seller.description}
                            </p>
                          )}
                          
                          <div className="flex items-center gap-4 text-sm text-slate-400">
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
                        
                        <ArrowRight className="h-5 w-5 text-slate-400 group-hover:text-amber-400 transition-colors" />
                      </div>
                    </div>
                  )}
                </Link>
              </motion.div>
            ))}
          </div>
        )}

        {/* Call to Action */}
        <div className="mt-16 bg-slate-800 rounded-xl p-8 text-center border border-slate-700">
          <h2 className="text-2xl font-bold text-slate-100 mb-4">Want to sell on Findora?</h2>
          <p className="text-slate-300 mb-6 max-w-2xl mx-auto">
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