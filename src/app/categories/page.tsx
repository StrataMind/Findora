'use client'
export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Search, 
  Package, 
  ArrowRight,
  ArrowLeft,
  Grid3X3,
  List,
  Filter,
  Tag,
  Star,
  TrendingUp,
  Eye
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

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/public/categories')
      if (response.ok) {
        const data = await response.json()
        setCategories(data.categories || [])
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (category.description && category.description.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900">
      {/* Stars Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(100)].map((_, i) => {
          const seed1 = (i * 7919) % 10000
          const seed2 = (i * 6151) % 10000
          const top = (seed1 / 100).toFixed(2)
          const left = (seed2 / 100).toFixed(2)
          const duration = 2 + ((i * 31) % 300) / 100
          const delay = ((i * 17) % 200) / 100
          
          return (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-amber-300 rounded-full"
              style={{ top: `${top}%`, left: `${left}%` }}
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration, delay, repeat: Infinity }}
            />
          )
        })}
      </div>

      {/* Header */}
      <div className="relative bg-gradient-to-r from-slate-900/90 via-slate-800/90 to-indigo-900/90 backdrop-blur-sm border-b border-amber-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-8">
            {/* Back Button */}
            <div className="mb-6">
              <Link href="/">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="flex items-center gap-2 text-amber-100 hover:text-amber-300 hover:bg-amber-500/10 border border-amber-500/30 hover:border-amber-400/50 backdrop-blur-sm"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Home
                </Button>
              </Link>
            </div>
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <motion.h1 
                  className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-amber-300 to-orange-400 bg-clip-text text-transparent mb-3"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  Categories
                </motion.h1>
                <motion.p 
                  className="text-slate-300 text-lg"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  Discover amazing products across all categories
                </motion.p>
              </div>
              <motion.div 
                className="flex items-center space-x-3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <div className="flex items-center bg-slate-800/50 backdrop-blur-sm border border-amber-500/30 rounded-lg p-1">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className={`${viewMode === 'grid' 
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg' 
                      : 'text-slate-300 hover:text-amber-300 hover:bg-amber-500/10'
                    } transition-all duration-200`}
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className={`${viewMode === 'list' 
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg' 
                      : 'text-slate-300 hover:text-amber-300 hover:bg-amber-500/10'
                    } transition-all duration-200`}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Section */}
        <motion.div 
          className="mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="max-w-2xl mx-auto">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-xl blur-xl group-focus-within:blur-2xl transition-all duration-300"></div>
              <div className="relative flex items-center">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-amber-400 h-5 w-5 z-10" />
                <Input
                  placeholder="Search categories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 pr-4 py-4 text-lg bg-slate-800/50 border border-amber-500/30 text-slate-200 placeholder-slate-400 rounded-xl backdrop-blur-sm focus:border-amber-400/60 focus:ring-2 focus:ring-amber-500/20 transition-all duration-300"
                />
                {searchTerm && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSearchTerm('')}
                      className="text-slate-400 hover:text-amber-300 hover:bg-amber-500/10"
                    >
                      ×
                    </Button>
                  </motion.div>
                )}
              </div>
            </div>

            {/* Search Stats */}
            {!loading && (
              <motion.div
                className="flex items-center justify-center mt-4 text-slate-400 text-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <span>
                  {searchTerm ? `${filteredCategories.length} categories found` : `${categories.length} categories available`}
                </span>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Categories Grid/List */}
        {loading ? (
          <div className={viewMode === 'grid' 
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8' 
            : 'space-y-6'
          }>
            {[...Array(12)].map((_, index) => (
              <motion.div 
                key={index} 
                className="relative group"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-2xl blur-lg"></div>
                <div className="relative bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-2xl shadow-xl animate-pulse">
                  {viewMode === 'grid' ? (
                    <>
                      <div className="aspect-square bg-slate-700/50 rounded-t-2xl"></div>
                      <div className="p-6 space-y-3">
                        <div className="h-4 bg-slate-700/50 rounded"></div>
                        <div className="h-4 bg-slate-700/50 rounded w-3/4"></div>
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center p-6 space-x-4">
                      <div className="w-16 h-16 bg-slate-700/50 rounded-xl"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-slate-700/50 rounded"></div>
                        <div className="h-4 bg-slate-700/50 rounded w-3/4"></div>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        ) : filteredCategories.length === 0 ? (
          <motion.div 
            className="text-center py-20"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="relative inline-block mb-6">
              <div className="absolute inset-0 bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-full blur-2xl"></div>
              <div className="relative bg-slate-800/50 backdrop-blur-sm border border-amber-500/30 rounded-full p-6">
                <Package className="h-16 w-16 text-amber-400 mx-auto" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-slate-200 mb-4">No categories found</h3>
            <p className="text-slate-400 mb-8 max-w-md mx-auto">
              {searchTerm ? 'No categories match your search criteria. Try different keywords.' : 'No categories are available at the moment. Please check back later.'}
            </p>
            {searchTerm && (
              <Button 
                onClick={() => setSearchTerm('')}
                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Clear Search
              </Button>
            )}
          </motion.div>
        ) : (
          <div className={viewMode === 'grid' 
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8' 
            : 'space-y-6'
          }>
            {filteredCategories.map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group"
              >
                <Link href={`/categories/${category.slug}`}>
                  {viewMode === 'grid' ? (
                    <div className="relative group cursor-pointer">
                      {/* Glow Effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                      
                      {/* Card Content */}
                      <div className="relative bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden group-hover:border-amber-500/50">
                        {/* Image Container */}
                        <div className="aspect-square overflow-hidden rounded-t-2xl bg-gradient-to-br from-slate-700/50 to-slate-600/50 flex items-center justify-center relative">
                          {category.image ? (
                            <img
                              src={category.image}
                              alt={category.name}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                            />
                          ) : (
                            <div className="w-20 h-20 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-amber-500/30">
                              <Package className="h-10 w-10 text-amber-400" />
                            </div>
                          )}
                          
                          {/* Overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        </div>
                        
                        {/* Card Body */}
                        <div className="p-6">
                          <h3 className="text-xl font-bold text-slate-200 group-hover:text-amber-300 transition-colors duration-300 mb-3">
                            {category.name}
                          </h3>
                          {category.description && (
                            <p className="text-slate-400 text-sm mb-4 line-clamp-2 leading-relaxed">
                              {category.description}
                            </p>
                          )}
                          
                          {/* Footer */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
                              <span className="text-sm font-medium text-slate-300">
                                {category._count.products} products
                              </span>
                            </div>
                            <ArrowRight className="h-5 w-5 text-slate-500 group-hover:text-amber-400 group-hover:translate-x-1 transition-all duration-300" />
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="relative group cursor-pointer">
                      {/* Glow Effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                      
                      {/* Card Content */}
                      <div className="relative bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 group-hover:border-amber-500/50">
                        <div className="flex items-center p-6 gap-6">
                          {/* Icon/Image */}
                          <div className="w-20 h-20 flex-shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-slate-700/50 to-slate-600/50 flex items-center justify-center">
                            {category.image ? (
                              <img
                                src={category.image}
                                alt={category.name}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                                <Package className="h-8 w-8 text-amber-400" />
                              </div>
                            )}
                          </div>
                          
                          {/* Content */}
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-slate-200 group-hover:text-amber-300 transition-colors duration-300 mb-2">
                              {category.name}
                            </h3>
                            {category.description && (
                              <p className="text-slate-400 text-sm mb-3 line-clamp-2 leading-relaxed">
                                {category.description}
                              </p>
                            )}
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
                              <span className="text-sm font-medium text-slate-300">
                                {category._count.products} products available
                              </span>
                            </div>
                          </div>
                          
                          {/* Arrow */}
                          <ArrowRight className="h-6 w-6 text-slate-500 group-hover:text-amber-400 group-hover:translate-x-2 transition-all duration-300" />
                        </div>
                      </div>
                    </div>
                  )}
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}