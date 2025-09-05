'use client'
export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useCart } from '@/contexts/cart-context'
import Header from '@/components/navigation/header'
import CheckoutSteps from '@/components/checkout/checkout-steps'
import ShippingForm from '@/components/checkout/shipping-form'
import PaymentForm from '@/components/checkout/payment-form'
import OrderSummary from '@/components/checkout/order-summary'
import OrderComplete from '@/components/checkout/order-complete'
import { Button } from '@/components/ui/button'
import { ArrowLeft, ShoppingCart, Lock } from 'lucide-react'

export type CheckoutStep = 'shipping' | 'payment' | 'review' | 'complete'

export interface ShippingData {
  firstName: string
  lastName: string
  email: string
  phone: string
  address: string
  address2?: string
  city: string
  state: string
  zipCode: string
  country: string
  shippingMethod: 'standard' | 'express' | 'overnight'
}

export interface PaymentData {
  method: 'card' | 'paypal' | 'apple_pay' | 'google_pay'
  cardNumber?: string
  expiryDate?: string
  cvv?: string
  cardholderName?: string
  billingAddress?: {
    sameAsShipping: boolean
    address?: string
    city?: string
    state?: string
    zipCode?: string
    country?: string
  }
}

export interface OrderData {
  id: string
  orderNumber: string
  items: any[]
  subtotal: number
  shipping: number
  tax: number
  total: number
  shippingData: ShippingData
  paymentData: PaymentData
  status: 'processing' | 'confirmed' | 'shipped' | 'delivered'
  createdAt: string
  estimatedDelivery: string
}

export default function CheckoutPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const { items, getTotalPrice, getTotalItems, clearCart } = useCart()
  
  const [currentStep, setCurrentStep] = useState<CheckoutStep>('shipping')
  const [shippingData, setShippingData] = useState<ShippingData | null>(null)
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null)
  const [orderData, setOrderData] = useState<OrderData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Redirect to cart if empty
  useEffect(() => {
    if (items.length === 0 && currentStep !== 'complete') {
      router.push('/cart')
    }
  }, [items, currentStep, router])

  // Redirect to sign in if not authenticated
  useEffect(() => {
    if (!session) {
      router.push('/auth/signin?callbackUrl=/checkout')
    }
  }, [session, router])

  const handleStepComplete = (step: CheckoutStep, data: any) => {
    switch (step) {
      case 'shipping':
        setShippingData(data)
        setCurrentStep('payment')
        break
      case 'payment':
        setPaymentData(data)
        setCurrentStep('review')
        break
      case 'review':
        handlePlaceOrder()
        break
    }
  }

  const handleStepBack = () => {
    switch (currentStep) {
      case 'payment':
        setCurrentStep('shipping')
        break
      case 'review':
        setCurrentStep('payment')
        break
    }
  }

  const handlePlaceOrder = async () => {
    if (!shippingData || !paymentData) return

    setLoading(true)
    setError('')

    try {
      // Calculate totals
      const subtotal = getTotalPrice()
      const shippingCost = calculateShippingCost(shippingData.shippingMethod)
      const tax = subtotal * 0.08 // 8% tax rate
      const total = subtotal + shippingCost + tax

      // In a real app, this would make an API call to create the order
      const newOrder: OrderData = {
        id: `order_${Date.now()}`,
        orderNumber: `FND-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        items: items.map(item => ({
          id: item.id,
          productId: item.productId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
          seller: item.seller
        })),
        subtotal,
        shipping: shippingCost,
        tax,
        total,
        shippingData,
        paymentData,
        status: 'processing',
        createdAt: new Date().toISOString(),
        estimatedDelivery: calculateEstimatedDelivery(shippingData.shippingMethod)
      }

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Store order in localStorage (in real app, would be saved to database)
      const existingOrders = JSON.parse(localStorage.getItem('findora_orders') || '[]')
      existingOrders.unshift(newOrder)
      localStorage.setItem('findora_orders', JSON.stringify(existingOrders))

      setOrderData(newOrder)
      setCurrentStep('complete')
      clearCart()

    } catch (error) {
      console.error('Order placement error:', error)
      setError('Failed to place order. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const calculateShippingCost = (method: string) => {
    switch (method) {
      case 'standard':
        return 5.99
      case 'express':
        return 12.99
      case 'overnight':
        return 24.99
      default:
        return 5.99
    }
  }

  const calculateEstimatedDelivery = (method: string) => {
    const today = new Date()
    let deliveryDate = new Date(today)
    
    switch (method) {
      case 'standard':
        deliveryDate.setDate(today.getDate() + 5)
        break
      case 'express':
        deliveryDate.setDate(today.getDate() + 2)
        break
      case 'overnight':
        deliveryDate.setDate(today.getDate() + 1)
        break
    }
    
    return deliveryDate.toISOString()
  }

  if (!session) {
    return null // Will redirect to sign in
  }

  if (items.length === 0 && currentStep !== 'complete') {
    return null // Will redirect to cart
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => router.back()}
                className="text-gray-600"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div className="h-6 w-px bg-gray-300" />
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <ShoppingCart className="w-6 h-6 mr-3" />
                Checkout
              </h1>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Lock className="w-4 h-4" />
              <span>Secure Checkout</span>
            </div>
          </div>
          
          <CheckoutSteps currentStep={currentStep} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-8">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 mb-6">
                {error}
              </div>
            )}

            {currentStep === 'shipping' && (
              <ShippingForm
                initialData={shippingData}
                onComplete={(data) => handleStepComplete('shipping', data)}
                loading={loading}
              />
            )}

            {currentStep === 'payment' && shippingData && (
              <PaymentForm
                shippingData={shippingData}
                initialData={paymentData}
                onComplete={(data) => handleStepComplete('payment', data)}
                onBack={handleStepBack}
                loading={loading}
              />
            )}

            {currentStep === 'review' && shippingData && paymentData && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Review Your Order</h2>
                
                {/* Order Items */}
                <div className="space-y-4 mb-6">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center space-x-4 py-4 border-b border-gray-200">
                      {item.image && (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                      )}
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{item.name}</h3>
                        <p className="text-gray-600">Qty: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">
                          ${(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Shipping Info Summary */}
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-2">Shipping Address</h3>
                  <p className="text-gray-600">
                    {shippingData.firstName} {shippingData.lastName}<br />
                    {shippingData.address}<br />
                    {shippingData.address2 && `${shippingData.address2}<br />`}
                    {shippingData.city}, {shippingData.state} {shippingData.zipCode}<br />
                    {shippingData.country}
                  </p>
                </div>

                {/* Payment Info Summary */}
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-2">Payment Method</h3>
                  <p className="text-gray-600 capitalize">
                    {paymentData.method.replace('_', ' ')}
                    {paymentData.cardNumber && ` ending in ****${paymentData.cardNumber.slice(-4)}`}
                  </p>
                </div>

                <div className="flex justify-between">
                  <Button variant="outline" onClick={handleStepBack}>
                    Back to Payment
                  </Button>
                  <Button
                    onClick={() => handleStepComplete('review', null)}
                    disabled={loading}
                    size="lg"
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {loading ? 'Placing Order...' : 'Place Order'}
                  </Button>
                </div>
              </div>
            )}

            {currentStep === 'complete' && orderData && (
              <OrderComplete order={orderData} />
            )}
          </div>

          {/* Order Summary Sidebar */}
          {currentStep !== 'complete' && (
            <div className="lg:col-span-4">
              <OrderSummary
                items={items}
                shippingMethod={shippingData?.shippingMethod}
                onUpdateShipping={(method) => {
                  if (shippingData) {
                    setShippingData({ ...shippingData, shippingMethod: method })
                  }
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}