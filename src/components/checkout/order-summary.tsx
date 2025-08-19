'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Package, Truck, Zap, Clock, Tag, Shield } from 'lucide-react'

interface CartItem {
  id: string
  productId: string
  name: string
  slug: string
  price: number
  compareAtPrice?: number
  quantity: number
  maxQuantity: number
  image?: string
  seller: {
    id: string
    businessName: string
  }
}

interface OrderSummaryProps {
  items: CartItem[]
  shippingMethod?: string
  onUpdateShipping?: (method: string) => void
}

const shippingMethods = [
  {
    id: 'standard',
    name: 'Standard Shipping',
    description: '5-7 business days',
    price: 5.99,
    icon: Truck
  },
  {
    id: 'express',
    name: 'Express Shipping',
    description: '2-3 business days',
    price: 12.99,
    icon: Zap
  },
  {
    id: 'overnight',
    name: 'Overnight Shipping',
    description: 'Next business day',
    price: 24.99,
    icon: Clock
  }
]

export default function OrderSummary({ 
  items, 
  shippingMethod = 'standard',
  onUpdateShipping 
}: OrderSummaryProps) {
  const [promoCode, setPromoCode] = useState('')
  const [promoApplied, setPromoApplied] = useState(false)
  const [promoDiscount, setPromoDiscount] = useState(0)

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price)
  }

  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const selectedShipping = shippingMethods.find(method => method.id === shippingMethod)
  const shippingCost = selectedShipping?.price || 5.99
  const taxRate = 0.08 // 8% tax
  const tax = subtotal * taxRate
  const discount = promoDiscount
  const total = subtotal + shippingCost + tax - discount

  const handlePromoCode = () => {
    // Simple promo code logic for demo
    if (promoCode.toUpperCase() === 'SAVE10') {
      setPromoDiscount(subtotal * 0.1) // 10% off
      setPromoApplied(true)
    } else if (promoCode.toUpperCase() === 'FREESHIP') {
      setPromoDiscount(shippingCost)
      setPromoApplied(true)
    } else {
      setPromoApplied(false)
      setPromoDiscount(0)
    }
  }

  const removePromoCode = () => {
    setPromoCode('')
    setPromoApplied(false)
    setPromoDiscount(0)
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6 sticky top-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
      
      {/* Order Items */}
      <div className="space-y-4 mb-6">
        {items.map((item) => (
          <div key={item.id} className="flex items-center space-x-3">
            <div className="relative">
              {item.image ? (
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-12 h-12 object-cover rounded-lg"
                />
              ) : (
                <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                  <Package className="w-6 h-6 text-gray-400" />
                </div>
              )}
              <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {item.quantity}
              </span>
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 truncate">{item.name}</p>
              <p className="text-sm text-gray-600">{item.seller.businessName}</p>
              {item.compareAtPrice && item.compareAtPrice > item.price && (
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-500 line-through">
                    {formatPrice(item.compareAtPrice)}
                  </span>
                  <span className="text-xs bg-red-100 text-red-800 px-1 rounded">
                    Save {formatPrice(item.compareAtPrice - item.price)}
                  </span>
                </div>
              )}
            </div>
            
            <div className="text-right">
              <p className="font-medium text-gray-900">
                {formatPrice(item.price * item.quantity)}
              </p>
              {item.quantity > 1 && (
                <p className="text-sm text-gray-600">
                  {formatPrice(item.price)} each
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Promo Code */}
      <div className="mb-6">
        <div className="flex space-x-2">
          <div className="flex-1">
            <input
              type="text"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value)}
              placeholder="Promo code"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={promoApplied}
            />
          </div>
          {!promoApplied ? (
            <Button 
              onClick={handlePromoCode}
              variant="outline" 
              size="sm"
              disabled={!promoCode.trim()}
            >
              Apply
            </Button>
          ) : (
            <Button 
              onClick={removePromoCode}
              variant="outline" 
              size="sm"
            >
              Remove
            </Button>
          )}
        </div>
        
        {promoApplied && (
          <div className="mt-2 flex items-center space-x-2 text-green-600">
            <Tag className="w-4 h-4" />
            <span className="text-sm font-medium">
              Promo code applied: {promoCode.toUpperCase()}
            </span>
          </div>
        )}
        
        <div className="mt-2 text-xs text-gray-500">
          Try: SAVE10 (10% off) or FREESHIP (free shipping)
        </div>
      </div>

      {/* Shipping Options */}
      {onUpdateShipping && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Shipping Method
          </label>
          <Select value={shippingMethod} onValueChange={onUpdateShipping}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {shippingMethods.map((method) => {
                const Icon = method.icon
                return (
                  <SelectItem key={method.id} value={method.id}>
                    <div className="flex items-center space-x-2">
                      <Icon className="w-4 h-4" />
                      <span>{method.name}</span>
                      <span className="text-gray-500">({method.description})</span>
                      <span className="font-medium">{formatPrice(method.price)}</span>
                    </div>
                  </SelectItem>
                )
              })}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Order Totals */}
      <div className="border-t border-gray-200 pt-4 space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Subtotal ({items.length} items)</span>
          <span className="font-medium text-gray-900">{formatPrice(subtotal)}</span>
        </div>
        
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Shipping</span>
          <span className="font-medium text-gray-900">{formatPrice(shippingCost)}</span>
        </div>
        
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Tax</span>
          <span className="font-medium text-gray-900">{formatPrice(tax)}</span>
        </div>
        
        {discount > 0 && (
          <div className="flex justify-between text-sm text-green-600">
            <span>Discount</span>
            <span className="font-medium">-{formatPrice(discount)}</span>
          </div>
        )}
        
        <div className="border-t border-gray-200 pt-3">
          <div className="flex justify-between">
            <span className="text-base font-medium text-gray-900">Total</span>
            <span className="text-lg font-bold text-gray-900">{formatPrice(total)}</span>
          </div>
        </div>
      </div>

      {/* Security Badge */}
      <div className="mt-6 flex items-center justify-center space-x-2 text-sm text-gray-600">
        <Shield className="w-4 h-4" />
        <span>Secure checkout protected by SSL</span>
      </div>

      {/* Estimated Delivery */}
      {selectedShipping && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <div className="flex items-center space-x-2">
            <selectedShipping.icon className="w-4 h-4 text-blue-600" />
            <div>
              <p className="text-sm font-medium text-blue-900">
                Estimated Delivery
              </p>
              <p className="text-xs text-blue-700">
                {selectedShipping.description}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}