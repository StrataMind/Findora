'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { useCart } from '@/contexts/cart-context'
import QuantitySelector from '@/components/ui/quantity-selector'
import { ShoppingCart, Check, AlertTriangle, Package } from 'lucide-react'
import { toast } from 'sonner'

interface Product {
  id: string
  name: string
  slug: string
  price: number
  compareAtPrice?: number
  inventory: number
  status: 'DRAFT' | 'ACTIVE' | 'INACTIVE' | 'OUT_OF_STOCK'
  images: { id: string; url: string; altText?: string }[]
  seller: {
    id: string
    businessName: string
  }
}

interface AddToCartButtonProps {
  product: Product
  variant?: 'default' | 'outline' | 'secondary'
  size?: 'sm' | 'md' | 'lg'
  showQuantitySelector?: boolean
  disabled?: boolean
  className?: string
}

export default function AddToCartButton({
  product,
  variant = 'default',
  size = 'md',
  showQuantitySelector = true,
  disabled = false,
  className = ''
}: AddToCartButtonProps) {
  const { addItem, openCart } = useCart()
  const { quantity: cartQuantity, isInCart } = useCartItem(product.id)
  const [selectedQuantity, setSelectedQuantity] = useState(1)
  const [isAdding, setIsAdding] = useState(false)
  const [stockValidated, setStockValidated] = useState(true)

  // Available stock = total inventory - already in cart
  const availableStock = Math.max(0, product.inventory - cartQuantity)
  const isOutOfStock = product.status === 'OUT_OF_STOCK' || availableStock === 0
  const isLowStock = availableStock > 0 && availableStock <= 5
  const isInactive = product.status === 'INACTIVE' || product.status === 'DRAFT'

  useEffect(() => {
    // Validate stock when component mounts or stock changes
    const validateStock = async () => {
      try {
        // In a real app, you might want to fetch current stock from API
        // const response = await fetch(`/api/products/${product.id}/stock`)
        // const { available } = await response.json()
        
        setStockValidated(true)
      } catch (error) {
        console.error('Stock validation failed:', error)
        setStockValidated(false)
        toast.error('Unable to verify product availability')
      }
    }

    validateStock()
  }, [product.id, product.inventory])

  useEffect(() => {
    // Adjust selected quantity if it exceeds available stock
    if (selectedQuantity > availableStock) {
      setSelectedQuantity(Math.max(1, availableStock))
    }
  }, [availableStock, selectedQuantity])

  const handleAddToCart = async () => {
    if (isOutOfStock || !stockValidated || isInactive) return

    setIsAdding(true)

    try {
      // Create cart item
      const cartItem = {
        id: `${product.id}_default`, // Use variant ID in real app
        productId: product.id,
        name: product.name,
        slug: product.slug,
        price: product.price,
        compareAtPrice: product.compareAtPrice,
        quantity: selectedQuantity,
        maxQuantity: availableStock,
        image: product.images[0]?.url,
        seller: product.seller
      }

      addItem(cartItem)

      // Track add to cart event
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'add_to_cart', {
          currency: 'USD',
          value: product.price * selectedQuantity,
          items: [{
            item_id: product.id,
            item_name: product.name,
            quantity: selectedQuantity,
            price: product.price
          }]
        })
      }

    } catch (error) {
      console.error('Failed to add item to cart:', error)
      toast.error('Failed to add item to cart. Please try again.')
    } finally {
      setIsAdding(false)
    }
  }

  const handleBuyNow = async () => {
    await handleAddToCart()
    openCart()
  }

  if (isInactive) {
    return (
      <div className={`flex flex-col space-y-2 ${className}`}>
        <Button
          disabled={true}
          variant="outline"
          size={size}
          className="w-full cursor-not-allowed opacity-50"
        >
          <Package className="w-4 h-4 mr-2" />
          Unavailable
        </Button>
        <p className="text-sm text-gray-500 text-center">
          This product is currently unavailable
        </p>
      </div>
    )
  }

  if (isOutOfStock) {
    return (
      <div className={`flex flex-col space-y-2 ${className}`}>
        <Button
          disabled={true}
          variant="outline"
          size={size}
          className="w-full cursor-not-allowed opacity-50"
        >
          <AlertTriangle className="w-4 h-4 mr-2" />
          Out of Stock
        </Button>
        <p className="text-sm text-gray-500 text-center">
          Currently unavailable
        </p>
      </div>
    )
  }

  return (
    <div className={`flex flex-col space-y-3 ${className}`}>
      {/* Stock Status */}
      {isLowStock && (
        <div className="bg-amber-50 border border-amber-200 rounded-md p-3">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span className="text-sm font-medium text-amber-800">
              Only {availableStock} left in stock!
            </span>
          </div>
        </div>
      )}

      {isInCart && cartQuantity > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Check className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">
                {cartQuantity} in cart
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={openCart}
              className="text-blue-600 hover:text-blue-800 p-0 h-auto"
            >
              View Cart
            </Button>
          </div>
        </div>
      )}

      {/* Quantity Selector */}
      {showQuantitySelector && availableStock > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Quantity
          </label>
          <QuantitySelector
            value={selectedQuantity}
            onChange={setSelectedQuantity}
            min={1}
            max={availableStock}
            disabled={isAdding}
            stockLabel={`${availableStock} available`}
            size={size === 'lg' ? 'lg' : 'md'}
          />
        </div>
      )}

      {/* Add to Cart Button */}
      <div className="grid grid-cols-1 gap-2">
        <Button
          onClick={handleAddToCart}
          disabled={disabled || isAdding || isOutOfStock || !stockValidated}
          variant={variant}
          size={size}
          className="w-full"
        >
          {isAdding ? (
            <>
              <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Adding...
            </>
          ) : (
            <>
              <ShoppingCart className="w-4 h-4 mr-2" />
              Add to Cart
              {showQuantitySelector && selectedQuantity > 1 && (
                <span className="ml-1">({selectedQuantity})</span>
              )}
            </>
          )}
        </Button>

        {/* Buy Now Button for larger sizes */}
        {size === 'lg' && (
          <Button
            onClick={handleBuyNow}
            disabled={disabled || isAdding || isOutOfStock || !stockValidated}
            variant="outline"
            size={size}
            className="w-full"
          >
            Buy Now
          </Button>
        )}
      </div>

      {/* Additional Info */}
      {!isOutOfStock && !isInactive && (
        <div className="text-xs text-gray-500 text-center space-y-1">
          <div>
            Free shipping on orders over $50
          </div>
          {stockValidated && (
            <div className="flex items-center justify-center space-x-1">
              <Check className="w-3 h-3 text-green-600" />
              <span className="text-green-600">In stock and ready to ship</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}