'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  X, 
  Heart, 
  ShoppingCart, 
  Star, 
  Plus, 
  Minus, 
  Share2, 
  ArrowRight,
  Truck,
  Shield,
  RotateCcw,
  Eye
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useWishlist } from '@/contexts/wishlist-context'
import { useCart } from '@/contexts/cart-context'

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
  description?: string
}

interface ProductQuickViewProps {
  product: Product | null
  isOpen: boolean
  onClose: () => void
}

export function ProductQuickView({ product, isOpen, onClose }: ProductQuickViewProps) {
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = useWishlist()
  const { dispatch: cartDispatch } = useCart()
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [quantity, setQuantity] = useState(1)

  if (!product) return null

  const isWishlisted = isInWishlist(product.id)
  const totalPrice = product.price * quantity

  const handleWishlistClick = () => {
    if (isWishlisted) {
      removeFromWishlist(product.id)
    } else {
      addToWishlist({
        id: `wishlist_${product.id}`,
        productId: product.id,
        name: product.name,
        slug: product.name.toLowerCase().replace(/\s+/g, '-'),
        price: product.price,
        compareAtPrice: product.originalPrice,
        image: product.images[0],
        inStock: product.inStock,
        seller: {
          id: 'seller_1',
          businessName: product.seller
        }
      })
    }
  }

  const handleAddToCart = () => {
    cartDispatch({
      type: 'ADD_ITEM',
      payload: {
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.images[0],
        quantity
      }
    })
    onClose()
  }

  const renderStars = (rating: number) => (
    <div className="flex items-center">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className={`w-4 h-4 ${
            i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
          }`}
        />
      ))}
    </div>
  )

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full mx-4 p-0 bg-gradient-to-br from-slate-50 to-white border-0 shadow-2xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col lg:flex-row max-h-[90vh] overflow-hidden"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-50 w-10 h-10 bg-white/90 hover:bg-white rounded-full shadow-lg backdrop-blur-sm transition-all duration-200 flex items-center justify-center text-gray-600 hover:text-gray-800"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Image Section */}
          <div className="lg:w-1/2 relative bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="aspect-square relative">
              <motion.img
                key={selectedImageIndex}
                src={product.images[selectedImageIndex]}
                alt={product.name}
                className="w-full h-full object-cover"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              />

              {/* Wishlist Button */}
              <motion.button
                className={`absolute top-4 right-4 w-12 h-12 rounded-full shadow-lg backdrop-blur-sm transition-all duration-300 ${
                  isWishlisted 
                    ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-red-500/25' 
                    : 'bg-white/90 hover:bg-white text-gray-600 hover:text-red-500'
                }`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleWishlistClick}
              >
                <Heart className={`w-6 h-6 ${isWishlisted ? 'fill-current' : ''}`} />
              </motion.button>

              {/* Badge */}
              {product.badge && (
                <div className="absolute top-4 left-4 px-3 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full text-sm font-bold shadow-lg">
                  {product.badge.charAt(0).toUpperCase() + product.badge.slice(1)}
                </div>
              )}
            </div>

            {/* Image Thumbnails */}
            {product.images.length > 1 && (
              <div className="flex gap-2 p-4 overflow-x-auto">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                      index === selectedImageIndex ? 'border-amber-500 shadow-lg' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} view ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="lg:w-1/2 p-6 lg:p-8 flex flex-col justify-between overflow-y-auto">
            <div className="space-y-6">
              {/* Category & Seller */}
              <div className="flex items-center justify-between">
                <Badge variant="secondary" className="text-sm">{product.category}</Badge>
                <span className="text-sm text-gray-500">by {product.seller}</span>
              </div>

              {/* Product Name */}
              <h1 className="text-3xl font-bold text-gray-900 leading-tight">
                {product.name}
              </h1>

              {/* Rating */}
              <div className="flex items-center gap-3">
                {renderStars(product.rating)}
                <span className="font-semibold text-gray-700">{product.rating}</span>
                <span className="text-gray-500">({product.reviews.toLocaleString()} reviews)</span>
              </div>

              {/* Price */}
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <span className="text-3xl font-bold text-gray-900">${product.price}</span>
                  {product.originalPrice && (
                    <>
                      <span className="text-xl text-gray-500 line-through">${product.originalPrice}</span>
                      <Badge className="bg-gradient-to-r from-red-500 to-pink-500 text-white">
                        {product.discount}% OFF
                      </Badge>
                    </>
                  )}
                </div>
                {quantity > 1 && (
                  <div className="text-lg text-gray-600">
                    Total: <span className="font-semibold">${totalPrice.toFixed(2)}</span>
                  </div>
                )}
              </div>

              {/* Description */}
              {product.description && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                  <p className="text-gray-600 leading-relaxed">{product.description}</p>
                </div>
              )}

              {/* Features */}
              <div className="flex flex-wrap gap-3">
                {product.freeShipping && (
                  <div className="flex items-center gap-2 px-3 py-2 bg-green-50 text-green-700 rounded-full text-sm">
                    <Truck className="w-4 h-4" />
                    Free Shipping
                  </div>
                )}
                {product.fastDelivery && (
                  <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 rounded-full text-sm">
                    <RotateCcw className="w-4 h-4" />
                    Fast Delivery
                  </div>
                )}
                <div className="flex items-center gap-2 px-3 py-2 bg-purple-50 text-purple-700 rounded-full text-sm">
                  <Shield className="w-4 h-4" />
                  Secure Payment
                </div>
              </div>

              {/* Stock Status */}
              <div className="space-y-2">
                {product.inStock ? (
                  <div className="flex items-center gap-2 text-green-600">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="font-medium">In Stock</span>
                    {product.stockCount && product.stockCount < 10 && (
                      <span className="text-orange-600 font-medium">
                        (Only {product.stockCount} left!)
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-red-600">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span className="font-medium">Out of Stock</span>
                  </div>
                )}
              </div>

              {/* Quantity Selector */}
              <div className="flex items-center gap-4">
                <span className="font-medium text-gray-700">Quantity:</span>
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 hover:bg-gray-100 transition-colors"
                    disabled={quantity <= 1}
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-4 py-2 border-x border-gray-300 min-w-[60px] text-center font-semibold">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-2 hover:bg-gray-100 transition-colors"
                    disabled={!product.inStock}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-4 pt-6 border-t border-gray-200">
              <Button
                onClick={handleAddToCart}
                disabled={!product.inStock}
                className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                {product.inStock ? `Add ${quantity} to Cart` : 'Out of Stock'}
              </Button>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1 border-amber-200 text-amber-600 hover:bg-amber-50 py-3 rounded-xl transition-all duration-300"
                  onClick={() => {
                    // Navigate to full product page
                    window.location.href = `/products/${product.id}`
                  }}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View Details
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 border-gray-200 text-gray-600 hover:bg-gray-50 py-3 rounded-xl transition-all duration-300"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  )
}