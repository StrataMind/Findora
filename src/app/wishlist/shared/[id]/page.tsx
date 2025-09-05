'use client'
export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { useCart } from '@/contexts/cart-context'
import Header from '@/components/navigation/header'
import { 
  Heart, 
  ShoppingCart, 
  Share2, 
  Package,
  User,
  Calendar,
  ExternalLink,
  ArrowLeft
} from 'lucide-react'

interface SharedWishlistItem {
  productId: string
  name: string
  slug: string
  price: number
  image?: string
}

interface SharedWishlist {
  id: string
  items: SharedWishlistItem[]
  createdAt: string
}

export default function SharedWishlistPage() {
  const params = useParams()
  const wishlistId = params.id as string
  const { addItem: addToCart } = useCart()
  
  const [wishlist, setWishlist] = useState<SharedWishlist | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadSharedWishlist()
  }, [wishlistId])

  const loadSharedWishlist = async () => {
    try {
      setLoading(true)
      
      // For demo purposes, load from localStorage
      // In a real app, this would be an API call to fetch shared wishlist
      const stored = localStorage.getItem(`findora_shared_wishlist_${wishlistId}`)
      
      if (stored) {
        const data = JSON.parse(stored)
        setWishlist(data)
      } else {
        setError('Wishlist not found')
      }
    } catch (error) {
      console.error('Error loading shared wishlist:', error)
      setError('Failed to load wishlist')
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = (item: SharedWishlistItem) => {
    const cartItem = {
      id: `${item.productId}_default`,
      productId: item.productId,
      name: item.name,
      slug: item.slug,
      price: item.price,
      compareAtPrice: undefined,
      quantity: 1,
      maxQuantity: 10,
      image: item.image,
      seller: {
        id: 'unknown',
        businessName: 'Unknown Seller'
      }
    }

    addToCart(cartItem)
  }

  const handleShare = async () => {
    try {
      const shareUrl = window.location.href
      
      if (navigator.share) {
        await navigator.share({
          title: 'Shared Wishlist from Findora',
          text: `Check out this wishlist with ${wishlist?.items.length} products!`,
          url: shareUrl
        })
      } else {
        await navigator.clipboard.writeText(shareUrl)
        // You might want to show a toast here
        alert('Link copied to clipboard!')
      }
    } catch (error) {
      console.error('Error sharing:', error)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading wishlist...</p>
        </div>
      </div>
    )
  }

  if (error || !wishlist) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Wishlist not found
            </h1>
            <p className="text-gray-600 mb-8">
              This wishlist may have been removed or the link is invalid
            </p>
            
            <div className="space-y-4">
              <Link href="/products">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                  Browse Products
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
                Browse Products
              </Button>
            </Link>
          </div>
          
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Heart className="w-8 h-8 text-red-500 mr-3" />
                Shared Wishlist
              </h1>
              <div className="flex items-center space-x-4 mt-2 text-gray-600">
                <div className="flex items-center space-x-1">
                  <Package className="w-4 h-4" />
                  <span>{wishlist.items.length} items</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>Created {formatDate(wishlist.createdAt)}</span>
                </div>
              </div>
            </div>
            
            <div className="mt-4 md:mt-0">
              <Button
                variant="outline"
                onClick={handleShare}
                className="flex items-center space-x-2"
              >
                <Share2 className="w-4 h-4" />
                <span>Share This List</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Wishlist Items */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {wishlist.items.map((item) => (
            <div key={item.productId} className="bg-white rounded-lg shadow-sm border overflow-hidden group hover:shadow-md transition-shadow">
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
                
                {/* View Product Link */}
                <div className="absolute top-2 right-2">
                  <Link href={`/products/${item.slug}`}>
                    <Button
                      size="sm"
                      className="bg-white/90 text-gray-700 hover:bg-white shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <ExternalLink className="w-3 h-3 mr-1" />
                      View
                    </Button>
                  </Link>
                </div>
              </div>
              
              <div className="p-4">
                <Link href={`/products/${item.slug}`}>
                  <h3 className="font-medium text-gray-900 hover:text-blue-600 mb-2 line-clamp-2">
                    {item.name}
                  </h3>
                </Link>
                
                <div className="flex items-center justify-between mb-4">
                  <span className="font-bold text-gray-900">
                    {formatPrice(item.price)}
                  </span>
                </div>
                
                <div className="space-y-2">
                  <Button
                    onClick={() => handleAddToCart(item)}
                    className="w-full"
                    size="sm"
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Add to Cart
                  </Button>
                  
                  <Link href={`/products/${item.slug}`} className="block">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                    >
                      View Details
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Create Your Own Wishlist CTA */}
        <div className="mt-12 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-8 text-center">
          <Heart className="w-12 h-12 text-blue-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Love this wishlist?
          </h2>
          <p className="text-gray-600 mb-6">
            Create your own wishlist and share it with friends and family
          </p>
          <div className="space-y-3">
            <Link href="/auth/signup">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                Create Account
              </Button>
            </Link>
            <div>
              <Link href="/auth/signin" className="text-blue-600 hover:text-blue-800 font-medium">
                Already have an account? Sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}