'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { OrderData } from '@/app/checkout/page'
import { 
  CheckCircle, 
  Download, 
  Mail, 
  Package, 
  Truck, 
  CreditCard,
  Calendar,
  MapPin,
  Phone,
  ExternalLink,
  ArrowRight
} from 'lucide-react'

interface OrderCompleteProps {
  order: OrderData
}

export default function OrderComplete({ order }: OrderCompleteProps) {
  
  useEffect(() => {
    // Track order completion for analytics
    if (typeof window !== 'undefined') {
      // In a real app, you'd send this to your analytics service
      console.log('Order completed:', order.id)
    }
  }, [order.id])

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

  const getEstimatedDeliveryDate = () => {
    return new Date(order.estimatedDelivery).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const downloadReceipt = () => {
    // In a real app, this would generate and download a PDF receipt
    const receiptData = {
      orderNumber: order.orderNumber,
      date: order.createdAt,
      items: order.items,
      total: order.total,
      shippingAddress: order.shippingData
    }
    
    const blob = new Blob([JSON.stringify(receiptData, null, 2)], 
      { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `receipt-${order.orderNumber}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Success Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
        <p className="text-lg text-gray-600 mb-2">
          Thank you for your purchase. Your order has been successfully placed.
        </p>
        <p className="text-sm text-gray-500">
          Order #{order.orderNumber} • Placed on {formatDate(order.createdAt)}
        </p>
      </div>

      {/* Order Status */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-8 h-8 bg-green-600 rounded-full">
              <Package className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-medium text-green-900">Order Processing</h3>
              <p className="text-sm text-green-700">
                We're preparing your items for shipment
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-green-900">
              Estimated Delivery
            </p>
            <p className="text-lg font-bold text-green-600">
              {getEstimatedDeliveryDate()}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Order Items */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Package className="w-5 h-5 mr-2" />
            Order Items
          </h2>
          
          <div className="space-y-4">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center space-x-4 py-3 border-b border-gray-200 last:border-b-0">
                {item.image && (
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-12 h-12 object-cover rounded-lg"
                  />
                )}
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{item.name}</h3>
                  <p className="text-sm text-gray-600">{item.seller.businessName}</p>
                  <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">
                    {formatPrice(item.price * item.quantity)}
                  </p>
                  {item.quantity > 1 && (
                    <p className="text-sm text-gray-500">
                      {formatPrice(item.price)} each
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-200 pt-4 mt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal</span>
              <span>{formatPrice(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Shipping</span>
              <span>{formatPrice(order.shipping)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Tax</span>
              <span>{formatPrice(order.tax)}</span>
            </div>
            <div className="flex justify-between font-medium text-lg border-t pt-2">
              <span>Total</span>
              <span>{formatPrice(order.total)}</span>
            </div>
          </div>
        </div>

        {/* Order Details */}
        <div className="space-y-6">
          {/* Shipping Address */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <MapPin className="w-5 h-5 mr-2" />
              Shipping Address
            </h3>
            <div className="text-gray-600">
              <p className="font-medium text-gray-900">
                {order.shippingData.firstName} {order.shippingData.lastName}
              </p>
              <p>{order.shippingData.address}</p>
              {order.shippingData.address2 && <p>{order.shippingData.address2}</p>}
              <p>
                {order.shippingData.city}, {order.shippingData.state} {order.shippingData.zipCode}
              </p>
              <p>{order.shippingData.country}</p>
              <div className="flex items-center space-x-4 mt-3 pt-3 border-t text-sm">
                <div className="flex items-center space-x-1">
                  <Mail className="w-4 h-4" />
                  <span>{order.shippingData.email}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Phone className="w-4 h-4" />
                  <span>{order.shippingData.phone}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <CreditCard className="w-5 h-5 mr-2" />
              Payment Method
            </h3>
            <div className="text-gray-600">
              <p className="font-medium text-gray-900 capitalize">
                {order.paymentData.method.replace('_', ' ')}
              </p>
              {order.paymentData.cardNumber && (
                <p>Card ending in ****{order.paymentData.cardNumber.slice(-4)}</p>
              )}
            </div>
          </div>

          {/* Delivery Method */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Truck className="w-5 h-5 mr-2" />
              Delivery Method
            </h3>
            <div className="text-gray-600">
              <p className="font-medium text-gray-900 capitalize">
                {order.shippingData.shippingMethod.replace('_', ' ')} Shipping
              </p>
              <p>Estimated delivery: {getEstimatedDeliveryDate()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
        <Button onClick={downloadReceipt} variant="outline" className="flex items-center">
          <Download className="w-4 h-4 mr-2" />
          Download Receipt
        </Button>
        
        <Link href="/account/orders">
          <Button variant="outline" className="flex items-center">
            <Calendar className="w-4 h-4 mr-2" />
            View Order History
          </Button>
        </Link>
        
        <Link href="/products">
          <Button className="flex items-center bg-blue-600 hover:bg-blue-700">
            Continue Shopping
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </div>

      {/* Support Info */}
      <div className="mt-8 text-center p-6 bg-gray-50 rounded-lg">
        <h3 className="font-medium text-gray-900 mb-2">Need Help?</h3>
        <p className="text-gray-600 mb-4">
          We're here to help! If you have any questions about your order, please don't hesitate to contact us.
        </p>
        <div className="flex flex-col sm:flex-row gap-2 justify-center">
          <Button variant="outline" size="sm">
            <Mail className="w-4 h-4 mr-2" />
            Email Support
          </Button>
          <Button variant="outline" size="sm">
            <Phone className="w-4 h-4 mr-2" />
            Call Support
          </Button>
          <Link href="/help">
            <Button variant="outline" size="sm">
              <ExternalLink className="w-4 h-4 mr-2" />
              Help Center
            </Button>
          </Link>
        </div>
      </div>

      {/* Email Confirmation Notice */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center space-x-3">
          <Mail className="w-5 h-5 text-blue-600" />
          <div>
            <p className="text-sm font-medium text-blue-900">
              Confirmation email sent
            </p>
            <p className="text-sm text-blue-700">
              We've sent order details and tracking information to {order.shippingData.email}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}