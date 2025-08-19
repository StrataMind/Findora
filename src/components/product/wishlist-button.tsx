'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useWishlist, useWishlistItem } from '@/contexts/wishlist-context'
import { Heart } from 'lucide-react'

interface Product {
  id: string
  name: string
  slug: string
  price: number
  compareAtPrice?: number
  inventory: number
  images: { id: string; url: string; altText?: string }[]
  seller: {
    id: string
    businessName: string
  }
  category?: {
    id: string
    name: string
  }
}

interface WishlistButtonProps {
  product: Product
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  showText?: boolean
  className?: string
}

export default function WishlistButton({
  product,
  variant = 'ghost',
  size = 'md',
  showText = true,
  className = ''
}: WishlistButtonProps) {
  const { addItem, removeItem } = useWishlist()
  const { isInWishlist } = useWishlistItem(product.id)
  const [isLoading, setIsLoading] = useState(false)

  const handleToggleWishlist = async () => {
    setIsLoading(true)
    
    try {
      if (isInWishlist) {
        removeItem(product.id)
      } else {
        const wishlistItem = {
          id: `wishlist_${product.id}`,
          productId: product.id,
          name: product.name,
          slug: product.slug,
          price: product.price,
          compareAtPrice: product.compareAtPrice,
          image: product.images[0]?.url,
          inStock: product.inventory > 0,
          seller: product.seller,
          category: product.category
        }
        
        addItem(wishlistItem)
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const buttonText = isInWishlist 
    ? (showText ? 'Remove from Wishlist' : '')
    : (showText ? 'Add to Wishlist' : '')

  return (
    <Button
      onClick={handleToggleWishlist}
      disabled={isLoading}
      variant={isInWishlist ? 'default' : variant}
      size={size}
      className={`transition-all duration-200 ${
        isInWishlist 
          ? 'bg-red-500 hover:bg-red-600 text-white' 
          : 'hover:text-red-500 hover:border-red-300'
      } ${className}`}
    >
      <Heart 
        className={`w-4 h-4 ${showText ? 'mr-2' : ''} ${
          isInWishlist ? 'fill-current' : ''
        } ${isLoading ? 'animate-pulse' : ''}`} 
      />
      {showText && buttonText}
    </Button>
  )
}