'use client'
export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/navigation/header'
import AddToCartButton from '@/components/product/add-to-cart-button'
import { useCart } from '@/contexts/cart-context'
import { Button } from '@/components/ui/button'
import { ShoppingCart, Package } from 'lucide-react'

const sampleProducts = [
  {
    id: '1',
    name: 'Premium Wireless Headphones',
    slug: 'premium-wireless-headphones',
    price: 199.99,
    compareAtPrice: 249.99,
    inventory: 25,
    status: 'ACTIVE' as const,
    images: [{ id: '1', url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400', altText: 'Headphones' }],
    seller: {
      id: 'seller1',
      businessName: 'Audio Pro Store'
    }
  },
  {
    id: '2',
    name: 'Smartphone Case - Black',
    slug: 'smartphone-case-black',
    price: 29.99,
    compareAtPrice: 39.99,
    inventory: 3,
    status: 'ACTIVE' as const,
    images: [{ id: '2', url: 'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=400', altText: 'Phone Case' }],
    seller: {
      id: 'seller2',
      businessName: 'Mobile Accessories Co'
    }
  },
  {
    id: '3',
    name: 'Bluetooth Speaker - Out of Stock',
    slug: 'bluetooth-speaker',
    price: 79.99,
    inventory: 0,
    status: 'OUT_OF_STOCK' as const,
    images: [{ id: '3', url: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400', altText: 'Speaker' }],
    seller: {
      id: 'seller3',
      businessName: 'Sound Solutions'
    }
  },
  {
    id: '4',
    name: 'Wireless Mouse',
    slug: 'wireless-mouse',
    price: 45.99,
    inventory: 50,
    status: 'ACTIVE' as const,
    images: [{ id: '4', url: 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=400', altText: 'Mouse' }],
    seller: {
      id: 'seller4',
      businessName: 'Tech Essentials'
    }
  }
]

export default function CartDemoPage() {
  const router = useRouter()
  const { state, clearCart } = useCart()
  const [selectedProduct, setSelectedProduct] = useState(0)

  // Calculate free shipping progress (assuming free shipping at $50)
  const freeShippingThreshold = 50
  const freeShippingProgress = Math.min(100, (state.totalPrice / freeShippingThreshold) * 100)

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            🛒 Shopping Cart Demo
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            Test the complete shopping cart functionality with sample products below.
          </p>
          
          {/* Cart Status */}
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <ShoppingCart className="w-6 h-6 mr-2" />
                Cart Status
              </h2>
              <div className="flex items-center space-x-4">
                <Button onClick={() => router.push('/cart')} variant="outline">
                  Open Cart ({state.totalItems})
                </Button>
                {state.items.length > 0 && (
                  <Button onClick={clearCart} variant="outline" className="text-red-600">
                    Clear Cart
                  </Button>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{state.totalItems}</div>
                <div className="text-sm text-gray-600">Items in Cart</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{formatPrice(state.subtotal)}</div>
                <div className="text-sm text-gray-600">Subtotal</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{formatPrice(state.totalPrice)}</div>
                <div className="text-sm text-gray-600">Total</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {freeShippingProgress.qualified ? 'FREE' : formatPrice(freeShippingProgress.remaining)}
                </div>
                <div className="text-sm text-gray-600">
                  {freeShippingProgress.qualified ? 'Shipping' : 'To Free Shipping'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {sampleProducts.map((product, index) => (
            <div
              key={product.id}
              className={`bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6 ${
                selectedProduct === index ? 'ring-2 ring-blue-500' : ''
              }`}
              onClick={() => setSelectedProduct(index)}
            >
              <div className="aspect-square overflow-hidden rounded-lg mb-4 bg-gray-100">
                {product.images[0] ? (
                  <img
                    src={product.images[0].url}
                    alt={product.images[0].altText}
                    className="w-full h-full object-cover hover:scale-105 transition-transform"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="h-12 w-12 text-gray-400" />
                  </div>
                )}
              </div>
              
              <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                {product.name}
              </h3>
              
              <div className="flex items-center space-x-2 mb-4">
                <span className="text-lg font-bold text-gray-900">
                  {formatPrice(product.price)}
                </span>
                {product.compareAtPrice && (
                  <span className="text-sm text-gray-500 line-through">
                    {formatPrice(product.compareAtPrice)}
                  </span>
                )}
              </div>
              
              <div className="text-sm text-gray-600 mb-4">
                by {product.seller.businessName}
              </div>
              
              <AddToCartButton
                product={product}
                size="sm"
                showQuantitySelector={false}
              />
            </div>
          ))}
        </div>

        {/* Selected Product Details */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Product Details - {sampleProducts[selectedProduct].name}
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <div className="aspect-square overflow-hidden rounded-lg mb-4 bg-gray-100">
                <img
                  src={sampleProducts[selectedProduct].images[0]?.url}
                  alt={sampleProducts[selectedProduct].images[0]?.altText}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {sampleProducts[selectedProduct].name}
                </h3>
                <p className="text-gray-600 mb-4">
                  by {sampleProducts[selectedProduct].seller.businessName}
                </p>
                
                <div className="flex items-center space-x-4 mb-6">
                  <span className="text-3xl font-bold text-gray-900">
                    {formatPrice(sampleProducts[selectedProduct].price)}
                  </span>
                  {sampleProducts[selectedProduct].compareAtPrice && (
                    <span className="text-xl text-gray-500 line-through">
                      {formatPrice(sampleProducts[selectedProduct].compareAtPrice)}
                    </span>
                  )}
                </div>
                
                <div className="text-sm text-gray-600 mb-6">
                  {sampleProducts[selectedProduct].inventory > 0
                    ? `${sampleProducts[selectedProduct].inventory} available`
                    : 'Out of stock'
                  }
                </div>
              </div>
              
              <AddToCartButton
                product={sampleProducts[selectedProduct]}
                size="lg"
                showQuantitySelector={true}
              />
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">Cart Features Demonstrated:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>✅ Real-time quantity updates</li>
                  <li>✅ Stock validation & limits</li>
                  <li>✅ Cart persistence (localStorage)</li>
                  <li>✅ Toast notifications</li>
                  <li>✅ Free shipping progress</li>
                  <li>✅ Price calculations (tax, shipping, discount)</li>
                  <li>✅ Responsive cart sidebar</li>
                  <li>✅ Full cart page with checkout flow</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}