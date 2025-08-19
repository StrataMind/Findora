'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { useWishlist } from '@/contexts/wishlist-context'
import { useCart } from '@/contexts/cart-context'
import Header from '@/components/navigation/header'
import { 
  Heart, 
  ShoppingCart, 
  X, 
  Share2, 
  Filter,
  Grid3X3,
  List,
  Package,
  ArrowLeft,
  AlertTriangle,
  Check,
  Star,
  TrendingUp
} from 'lucide-react'

export default function WishlistPage() {
  const { state: wishlistState, removeItem, clearWishlist, shareWishlist, getWishlistStats } = useWishlist()
  const { addItem: addToCart } = useCart()
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'price-low' | 'price-high' | 'name'>('newest')
  const [filterBy, setFilterBy] = useState<'all' | 'in-stock' | 'out-of-stock'>('all')

  const stats = getWishlistStats()

  // Sort and filter items
  const filteredItems = wishlistState.items
    .filter(item => {
      switch (filterBy) {
        case 'in-stock': return item.inStock
        case 'out-of-stock': return !item.inStock
        default: return true
      }
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest': return new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime()
        case 'oldest': return new Date(a.addedAt).getTime() - new Date(b.addedAt).getTime()
        case 'price-low': return a.price - b.price
        case 'price-high': return b.price - a.price
        case 'name': return a.name.localeCompare(b.name)
        default: return 0
      }
    })

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price)
  }

  const handleAddToCart = async (item: typeof wishlistState.items[0]) => {
    if (!item.inStock) {
      return
    }

    const cartItem = {
      id: `${item.productId}_default`,
      productId: item.productId,
      name: item.name,
      slug: item.slug,
      price: item.price,
      compareAtPrice: item.compareAtPrice,
      quantity: 1,
      maxQuantity: 10, // Would get from API in real app
      image: item.image,
      seller: item.seller
    }

    addToCart(cartItem)
    
    // Optional: Remove from wishlist after adding to cart
    // removeItem(item.productId)
  }

  const handleShare = async () => {
    await shareWishlist()
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (wishlistState.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Your wishlist is empty
            </h1>
            <p className="text-gray-600 mb-8">
              Save products you're interested in to easily find them later
            </p>
            
            <div className="space-y-4">
              <Link href="/products">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                  <Heart className="w-4 h-4 mr-2" />
                  Start Adding Products
                </Button>
              </Link>
              
              <div>
                <Link href="/" className="text-blue-600 hover:text-blue-800 font-medium">
                  ← Back to Home
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <Link href="/products">
              <Button variant="ghost" size="sm" className="text-gray-600">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Continue Shopping
              </Button>
            </Link>
          </div>
          
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Heart className="w-8 h-8 text-red-500 mr-3" />
                My Wishlist ({stats.totalItems})
              </h1>
              <p className="text-gray-600 mt-2">
                {stats.inStockItems} in stock • Total value: {formatPrice(stats.totalValue)}
              </p>
            </div>
            
            <div className="flex items-center space-x-3 mt-4 md:mt-0">
              <Button
                variant="outline"
                size="sm"
                onClick={handleShare}
                className="flex items-center space-x-2"
              >
                <Share2 className="w-4 h-4" />
                <span>Share</span>
              </Button>
              
              {wishlistState.items.length > 1 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearWishlist}
                  className="text-red-600 border-red-200 hover:bg-red-50"
                >
                  Clear All
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Filters & Controls */}
        <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <select
                  value={filterBy}
                  onChange={(e) => setFilterBy(e.target.value as any)}
                  className="text-sm border border-gray-300 rounded px-3 py-1 focus:border-blue-500 focus:outline-none"
                >
                  <option value="all">All Items</option>
                  <option value="in-stock">In Stock Only</option>
                  <option value="out-of-stock">Out of Stock</option>
                </select>
              </div>
              
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-gray-500" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="text-sm border border-gray-300 rounded px-3 py-1 focus:border-blue-500 focus:outline-none"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="name">Name A-Z</option>
                </select>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid3X3 className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Wishlist Items */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredItems.map((item) => (
              <div key={item.id} className="bg-white rounded-lg shadow-sm border overflow-hidden group hover:shadow-md transition-shadow">
                <div className="relative aspect-square">
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <Package className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                  
                  {/* Stock Status Badge */}
                  <div className="absolute top-2 left-2">
                    {item.inStock ? (
                      <span className="inline-flex items-center bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                        <Check className="w-3 h-3 mr-1" />
                        In Stock
                      </span>
                    ) : (
                      <span className="inline-flex items-center bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        Out of Stock
                      </span>
                    )}
                  </div>
                  
                  {/* Remove Button */}
                  <button
                    onClick={() => removeItem(item.productId)}
                    className="absolute top-2 right-2 p-1 bg-white/80 hover:bg-white rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
                
                <div className="p-4">
                  <Link href={`/products/${item.slug}`}>
                    <h3 className="font-medium text-gray-900 hover:text-blue-600 mb-2 line-clamp-2">
                      {item.name}
                    </h3>
                  </Link>
                  
                  <p className="text-sm text-gray-600 mb-2">
                    by {item.seller.businessName}
                  </p>
                  
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-gray-900">
                        {formatPrice(item.price)}
                      </span>
                      {item.compareAtPrice && item.compareAtPrice > item.price && (
                        <span className="text-sm text-gray-500 line-through">
                          {formatPrice(item.compareAtPrice)}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-xs text-gray-500 mb-3">
                    Added {formatDate(item.addedAt)}
                  </div>
                  
                  <Button
                    onClick={() => handleAddToCart(item)}
                    disabled={!item.inStock}
                    className="w-full"
                    size="sm"
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    {item.inStock ? 'Add to Cart' : 'Out of Stock'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            <div className="divide-y divide-gray-200">
              {filteredItems.map((item) => (
                <div key={item.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0 w-20 h-20 relative">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover rounded"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 rounded flex items-center justify-center">
                          <Package className="w-8 w-8 text-gray-400" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <Link href={`/products/${item.slug}`}>
                        <h3 className="font-medium text-gray-900 hover:text-blue-600 mb-1">
                          {item.name}
                        </h3>
                      </Link>
                      <p className="text-sm text-gray-600 mb-2">
                        by {item.seller.businessName}
                      </p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>Added {formatDate(item.addedAt)}</span>
                        {item.category && (
                          <span>{item.category.name}</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="text-center">
                        <div className="font-bold text-gray-900">
                          {formatPrice(item.price)}
                        </div>
                        {item.compareAtPrice && item.compareAtPrice > item.price && (
                          <div className="text-sm text-gray-500 line-through">
                            {formatPrice(item.compareAtPrice)}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {item.inStock ? (
                          <span className="inline-flex items-center bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                            <Check className="w-3 h-3 mr-1" />
                            In Stock
                          </span>
                        ) : (
                          <span className="inline-flex items-center bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            Out of Stock
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Button
                          onClick={() => handleAddToCart(item)}
                          disabled={!item.inStock}
                          size="sm"
                        >
                          <ShoppingCart className="w-4 h-4 mr-2" />
                          Add to Cart
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem(item.productId)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State for Filtered Results */}
        {filteredItems.length === 0 && wishlistState.items.length > 0 && (
          <div className="text-center py-12">
            <Filter className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No items match your filters
            </h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your filter settings
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setFilterBy('all')
                setSortBy('newest')
              }}
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}