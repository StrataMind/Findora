'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useCart } from '@/contexts/cart-context'
import { ShoppingCart, Check, Plus } from 'lucide-react'

interface AddToCartButtonProps {
  product: {
    id: string
    name: string
    price: number
    slug: string
    images?: Array<{ url: string }>
  }
  variant?: 'default' | 'outline' | 'secondary'
  size?: 'sm' | 'default' | 'lg'
  className?: string
  showIcon?: boolean
}

export function AddToCartButton({ 
  product, 
  variant = 'default', 
  size = 'default', 
  className = '',
  showIcon = true 
}: AddToCartButtonProps) {
  const { addItem, state } = useCart()
  const [justAdded, setJustAdded] = useState(false)

  const isInCart = state.items.some(item => item.id === product.id)

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault() // Prevent navigation if button is inside a Link
    e.stopPropagation()
    
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      slug: product.slug,
      image: product.images?.[0]?.url
    })

    setJustAdded(true)
    setTimeout(() => setJustAdded(false), 2000) // Reset after 2 seconds
  }

  if (justAdded) {
    return (
      <Button 
        variant="secondary" 
        size={size} 
        className={`${className} bg-green-100 text-green-800 border-green-200 pointer-events-none`}
      >
        {showIcon && <Check className="h-4 w-4 mr-2" />}
        Added!
      </Button>
    )
  }

  return (
    <Button 
      onClick={handleAddToCart}
      variant={variant}
      size={size}
      className={`${className} ${
        isInCart 
          ? 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200' 
          : ''
      }`}
    >
      {showIcon && (
        isInCart ? (
          <Plus className="h-4 w-4 mr-2" />
        ) : (
          <ShoppingCart className="h-4 w-4 mr-2" />
        )
      )}
      {isInCart ? 'Add More' : 'Add to Cart'}
    </Button>
  )
}