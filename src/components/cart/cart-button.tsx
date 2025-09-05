'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useCart } from '@/contexts/cart-context'
import { ShoppingCart, ShoppingBag } from 'lucide-react'

export function CartButton() {
  const { state } = useCart()

  return (
    <Link href="/cart">
      <Button 
        variant="outline" 
        size="sm" 
        className="relative flex items-center gap-2 hover:bg-blue-50 border-blue-200"
      >
        <ShoppingCart className="h-4 w-4" />
        <span className="hidden sm:inline">Cart</span>
        {state.totalItems > 0 && (
          <Badge 
            variant="default" 
            className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-blue-600 hover:bg-blue-700"
          >
            {state.totalItems > 99 ? '99+' : state.totalItems}
          </Badge>
        )}
      </Button>
    </Link>
  )
}

export function CartButtonLarge() {
  const { state } = useCart()

  return (
    <Link href="/cart">
      <Button className="relative flex items-center gap-3 bg-blue-600 hover:bg-blue-700 px-6">
        <ShoppingBag className="h-5 w-5" />
        <div className="flex flex-col items-start">
          <span className="font-medium">
            {state.totalItems === 0 ? 'Your Cart' : `Cart (${state.totalItems})`}
          </span>
          {state.totalPrice > 0 && (
            <span className="text-xs text-blue-100">
              ${state.totalPrice.toFixed(2)}
            </span>
          )}
        </div>
        {state.totalItems > 0 && (
          <Badge 
            variant="secondary" 
            className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 flex items-center justify-center text-xs bg-orange-500 text-white hover:bg-orange-600"
          >
            {state.totalItems > 99 ? '99+' : state.totalItems}
          </Badge>
        )}
      </Button>
    </Link>
  )
}