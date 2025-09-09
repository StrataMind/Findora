'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Heart, ShoppingCart, Eye, Star, Zap, Shield, TrendingUp, Share2, RotateCcw, Gift } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface Product {
  id: string
  name: string
  price: number
  originalPrice?: number
  images: string[]
  rating: number
  reviews: number
  category: string
  badge?: 'bestseller' | 'new' | 'sale' | 'premium' | 'limited'
  discount?: number
  seller: string
  freeShipping?: boolean
  fastDelivery?: boolean
  inStock: boolean
  stockCount?: number
}

interface AdvancedProductCardProps {
  product: Product
  variant?: 'default' | 'compact' | 'featured' | 'premium'
  onAddToCart?: (productId: string) => void
  onWishlist?: (productId: string) => void
  onQuickView?: (productId: string) => void
  onShare?: (productId: string) => void
  onCompare?: (productId: string) => void
  className?: string
}

const badgeConfig = {
  bestseller: { label: 'Bestseller', color: 'bg-gradient-to-r from-orange-500 to-red-500 text-white', icon: Zap },
  new: { label: 'New', color: 'bg-gradient-to-r from-green-500 to-emerald-500 text-white', icon: TrendingUp },
  sale: { label: 'Sale', color: 'bg-gradient-to-r from-red-500 to-pink-500 text-white', icon: Zap },
  premium: { label: 'Premium', color: 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white', icon: Shield },
  limited: { label: 'Limited', color: 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white', icon: Gift }
}

export function AdvancedProductCard({ 
  product, 
  variant = 'default',
  onAddToCart,
  onWishlist,
  onQuickView,
  onShare,
  onCompare,
  className 
}: AdvancedProductCardProps) {
  const [isWishlisted, setIsWishlisted] = React.useState(false)
  const [currentImageIndex, setCurrentImageIndex] = React.useState(0)
  const [isHovered, setIsHovered] = React.useState(false)

  const BadgeIcon = product.badge ? badgeConfig[product.badge].icon : null

  const handleWishlistClick = () => {
    setIsWishlisted(!isWishlisted)
    onWishlist?.(product.id)
  }

  // Auto-cycle through images on hover
  React.useEffect(() => {
    if (isHovered && product.images.length > 1) {
      const interval = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % product.images.length)
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [isHovered, product.images.length])

  const cardVariants = {
    default: "max-w-sm",
    compact: "max-w-xs",
    featured: "max-w-md",
    premium: "max-w-lg"
  }

  return (
    <motion.div
      className={cn("group relative", cardVariants[variant], className)}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => {
        setIsHovered(false)
        setCurrentImageIndex(0)
      }}
    >
      <div className="relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 hover:border-purple-200">
        {/* Badge */}
        {product.badge && (
          <div className={`absolute top-4 left-4 z-20 px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 ${badgeConfig[product.badge].color} shadow-lg`}>
            {BadgeIcon && <BadgeIcon className="w-3.5 h-3.5" />}
            {badgeConfig[product.badge].label}
          </div>
        )}

        {/* Discount Badge */}
        {product.discount && (
          <div className="absolute top-4 right-4 z-20 bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg">
            -{product.discount}%
          </div>
        )}

        {/* Quick Actions */}
        <div className="absolute top-4 right-4 z-20 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
          <Button
            size="sm"
            variant="ghost"
            className={`w-10 h-10 rounded-full bg-white/90 hover:bg-white shadow-lg backdrop-blur-sm transition-all duration-200 ${
              isWishlisted ? 'text-red-500 hover:text-red-600' : 'text-gray-600 hover:text-red-500'
            }`}
            onClick={handleWishlistClick}
          >
            <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="w-10 h-10 rounded-full bg-white/90 hover:bg-white text-gray-600 hover:text-blue-600 shadow-lg backdrop-blur-sm"
            onClick={() => onQuickView?.(product.id)}
          >
            <Eye className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="w-10 h-10 rounded-full bg-white/90 hover:bg-white text-gray-600 hover:text-green-600 shadow-lg backdrop-blur-sm"
            onClick={() => onShare?.(product.id)}
          >
            <Share2 className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="w-10 h-10 rounded-full bg-white/90 hover:bg-white text-gray-600 hover:text-purple-600 shadow-lg backdrop-blur-sm"
            onClick={() => onCompare?.(product.id)}
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>

        {/* Image Container */}
        <div className="relative aspect-square bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden group-hover:scale-105 transition-transform duration-500">
          <motion.img
            key={currentImageIndex}
            src={product.images[currentImageIndex]}
            alt={product.name}
            className="w-full h-full object-cover"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          />
          
          {/* Image Indicators */}
          {product.images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-1">
              {product.images.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-all duration-200 ${
                    index === currentImageIndex ? 'bg-white shadow-lg' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          )}

          {/* Stock Status */}
          {!product.inStock && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <span className="text-white font-semibold px-4 py-2 bg-red-500 rounded-full">Out of Stock</span>
            </div>
          )}

          {/* Low Stock Warning */}
          {product.inStock && product.stockCount && product.stockCount < 10 && (
            <div className="absolute bottom-4 left-4 bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-medium">
              Only {product.stockCount} left
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="p-6">
          {/* Category & Seller */}
          <div className="flex items-center justify-between mb-2">
            <Badge variant="secondary" className="text-xs">{product.category}</Badge>
            <span className="text-xs text-gray-500">by {product.seller}</span>
          </div>

          {/* Product Name */}
          <h3 className="font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-purple-600 transition-colors duration-200 text-lg">
            {product.name}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-2 mb-4">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < Math.floor(product.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm font-semibold text-gray-700">{product.rating}</span>
            <span className="text-sm text-gray-500">({product.reviews.toLocaleString()} reviews)</span>
          </div>

          {/* Price */}
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl font-bold text-gray-900">${product.price}</span>
            {product.originalPrice && (
              <span className="text-lg text-gray-500 line-through">${product.originalPrice}</span>
            )}
          </div>

          {/* Features */}
          <div className="flex gap-2 mb-6">
            {product.freeShipping && (
              <Badge variant="outline" className="text-xs text-green-600 border-green-200">
                Free Shipping
              </Badge>
            )}
            {product.fastDelivery && (
              <Badge variant="outline" className="text-xs text-blue-600 border-blue-200">
                Fast Delivery
              </Badge>
            )}
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <Button
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
              onClick={() => onAddToCart?.(product.id)}
              disabled={!product.inStock}
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              {product.inStock ? 'Add to Cart' : 'Sold Out'}
            </Button>
            
            <Button
              variant="outline"
              className="w-full border-purple-200 text-purple-600 hover:bg-purple-50 py-3 rounded-xl transition-all duration-300"
              onClick={() => onQuickView?.(product.id)}
            >
              Quick View
            </Button>
          </div>
        </div>

        {/* Hover Glow Effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-blue-500/0 to-indigo-500/0 group-hover:from-purple-500/5 group-hover:via-blue-500/5 group-hover:to-indigo-500/5 transition-all duration-500 pointer-events-none rounded-2xl" />
      </div>
    </motion.div>
  )
}