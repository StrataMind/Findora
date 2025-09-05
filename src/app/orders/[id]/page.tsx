'use client'
export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import orderManager, { Order, TrackingEvent } from '@/lib/order-management'
import {
  ArrowLeft,
  Package,
  Truck,
  CheckCircle,
  Clock,
  MapPin,
  Calendar,
  CreditCard,
  Phone,
  Mail,
  ExternalLink,
  MessageSquare,
  Download,
  RefreshCcw,
  AlertCircle,
  Star
} from 'lucide-react'
import Link from 'next/link'
import { format, formatDistance } from 'date-fns'

const orderStatusSteps = [
  { key: 'payment_confirmed', label: 'Payment Confirmed', icon: CreditCard },
  { key: 'processing', label: 'Processing', icon: Package },
  { key: 'shipped', label: 'Shipped', icon: Truck },
  { key: 'out_for_delivery', label: 'Out for Delivery', icon: Truck },
  { key: 'delivered', label: 'Delivered', icon: CheckCircle }
]

export default function OrderTrackingPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [trackingEvents, setTrackingEvents] = useState<TrackingEvent[]>([])

  useEffect(() => {
    if (params.id) {
      loadOrder()
    }
  }, [params.id])

  const loadOrder = async () => {
    setLoading(true)
    try {
      const orderData = await orderManager.getOrderById(params.id as string)
      setOrder(orderData)
      
      // Generate mock tracking events for demo
      if (orderData?.shippingInfo) {
        setTrackingEvents(generateMockTrackingEvents(orderData.status))
      }
    } catch (error) {
      console.error('Failed to load order:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateMockTrackingEvents = (status: string): TrackingEvent[] => {
    const events: TrackingEvent[] = []
    const now = new Date()
    
    // Always add order placed event
    events.push({
      id: '1',
      timestamp: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
      status: 'preparing',
      location: 'Mumbai Warehouse',
      description: 'Order has been received and is being prepared',
      isDeliveryUpdate: false
    })
    
    if (['processing', 'shipped', 'out_for_delivery', 'delivered'].includes(status)) {
      events.push({
        id: '2',
        timestamp: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000),
        status: 'shipped',
        location: 'Mumbai Warehouse',
        description: 'Package has been picked up by courier partner',
        isDeliveryUpdate: false
      })
    }
    
    if (['shipped', 'out_for_delivery', 'delivered'].includes(status)) {
      events.push({
        id: '3',
        timestamp: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
        status: 'in_transit',
        location: 'Mumbai Processing Center',
        description: 'Package is in transit to destination city',
        isDeliveryUpdate: false
      })
      
      events.push({
        id: '4',
        timestamp: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
        status: 'in_transit',
        location: 'Delhi Processing Center',
        description: 'Package has reached destination city',
        isDeliveryUpdate: false
      })
    }
    
    if (['out_for_delivery', 'delivered'].includes(status)) {
      events.push({
        id: '5',
        timestamp: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
        status: 'out_for_delivery',
        location: 'Delhi Local Office',
        description: 'Package is out for delivery',
        isDeliveryUpdate: true
      })
    }
    
    if (status === 'delivered') {
      events.push({
        id: '6',
        timestamp: new Date(now.getTime() - 4 * 60 * 60 * 1000),
        status: 'delivered',
        location: 'Customer Address',
        description: 'Package has been delivered successfully',
        isDeliveryUpdate: true
      })
    }
    
    return events.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
  }

  const getCurrentStepIndex = (status: string) => {
    const statusMap: { [key: string]: number } = {
      'payment_confirmed': 0,
      'processing': 1,
      'shipped': 2,
      'out_for_delivery': 3,
      'delivered': 4
    }
    return statusMap[status] || 0
  }

  const getProgressPercentage = (status: string) => {
    const currentStep = getCurrentStepIndex(status)
    return ((currentStep + 1) / orderStatusSteps.length) * 100
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-4"></div>
          <div className="space-y-4">
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-48 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Order Not Found</h2>
          <p className="text-gray-600 mb-4">The order you're looking for doesn't exist or you don't have access to it.</p>
          <Link href="/profile">
            <Button>View My Orders</Button>
          </Link>
        </div>
      </div>
    )
  }

  const statusInfo = orderManager.formatOrderStatus(order.status)
  const currentStepIndex = getCurrentStepIndex(order.status)
  const progressPercentage = getProgressPercentage(order.status)

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <Link href="/profile">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Orders
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Track Order</h1>
            <p className="text-gray-600 mt-1">Order {order.orderNumber}</p>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <Button variant="outline" onClick={loadOrder}>
            <RefreshCcw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Invoice
          </Button>
        </div>
      </div>

      {/* Order Status Progress */}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <Package className="w-5 h-5 mr-2" />
              Order Status
            </CardTitle>
            <Badge className={`bg-${statusInfo.color}-100 text-${statusInfo.color}-800`}>
              {statusInfo.label}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Progress Bar */}
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Order Progress</span>
                <span className="text-sm text-gray-600">{Math.round(progressPercentage)}% Complete</span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
            </div>

            {/* Status Steps */}
            <div className="flex justify-between">
              {orderStatusSteps.map((step, index) => {
                const StepIcon = step.icon
                const isCompleted = index <= currentStepIndex
                const isCurrent = index === currentStepIndex
                
                return (
                  <div key={step.key} className="flex flex-col items-center text-center">
                    <div className={`
                      w-12 h-12 rounded-full flex items-center justify-center mb-2
                      ${isCompleted 
                        ? 'bg-green-100 text-green-600 border-2 border-green-600' 
                        : 'bg-gray-100 text-gray-400 border-2 border-gray-300'
                      }
                      ${isCurrent && 'ring-4 ring-green-100'}
                    `}>
                      <StepIcon className="w-5 h-5" />
                    </div>
                    <span className={`text-xs font-medium ${isCompleted ? 'text-green-600' : 'text-gray-500'}`}>
                      {step.label}
                    </span>
                  </div>
                )
              })}
            </div>

            {/* Expected Delivery */}
            {order.estimatedDeliveryDate && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="font-semibold text-blue-900">Expected Delivery</p>
                    <p className="text-blue-700">
                      {format(order.estimatedDeliveryDate, 'EEEE, MMMM dd, yyyy')}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tracking Information */}
          {order.shippingInfo && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Truck className="w-5 h-5 mr-2" />
                  Shipping Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Tracking ID</p>
                    <p className="font-mono text-lg">{order.shippingInfo.trackingId}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Delivery Partner</p>
                    <p>{orderManager.getDeliveryPartners().find(p => p.id === order.shippingInfo!.deliveryPartner)?.name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Shipped Date</p>
                    <p>{order.shippingInfo.shippedDate ? format(order.shippingInfo.shippedDate, 'MMM dd, yyyy') : 'Not shipped yet'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Weight</p>
                    <p>{order.shippingInfo.weight} kg</p>
                  </div>
                </div>

                {order.shippingInfo.trackingUrl && (
                  <Button variant="outline" asChild>
                    <a href={order.shippingInfo.trackingUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Track on Carrier Website
                    </a>
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          {/* Tracking Events Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Tracking Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              {trackingEvents.length > 0 ? (
                <div className="relative">
                  <div className="absolute left-6 top-4 bottom-4 w-0.5 bg-gray-200"></div>
                  <div className="space-y-6">
                    {trackingEvents.map((event, index) => (
                      <div key={event.id} className="relative flex items-start space-x-4">
                        <div className={`
                          w-12 h-12 rounded-full flex items-center justify-center z-10
                          ${event.isDeliveryUpdate 
                            ? 'bg-green-100 text-green-600 border-2 border-green-600' 
                            : 'bg-blue-100 text-blue-600 border-2 border-blue-600'
                          }
                        `}>
                          {event.status === 'delivered' ? (
                            <CheckCircle className="w-5 h-5" />
                          ) : event.status === 'out_for_delivery' ? (
                            <Truck className="w-5 h-5" />
                          ) : (
                            <Package className="w-5 h-5" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-gray-900">
                              {event.description}
                            </h3>
                            <Badge variant={event.isDeliveryUpdate ? 'default' : 'secondary'}>
                              {event.status.replace('_', ' ')}
                            </Badge>
                          </div>
                          <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                            <div className="flex items-center space-x-1">
                              <MapPin className="w-4 h-4" />
                              <span>{event.location}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Clock className="w-4 h-4" />
                              <span>{format(event.timestamp, 'MMM dd, yyyy HH:mm')}</span>
                            </div>
                          </div>
                          {event.courierRemarks && (
                            <p className="text-sm text-gray-600 mt-2 italic">
                              "{event.courierRemarks}"
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Clock className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No tracking information available yet</p>
                  <p className="text-sm">Tracking details will appear once your order ships</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle>Order Items ({order.items.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.items.map((item, index) => (
                  <div key={index} className="flex items-center space-x-4 p-4 border rounded-lg">
                    <img
                      src={item.productImage}
                      alt={item.productName}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{item.productName}</h3>
                      <p className="text-sm text-gray-600">SKU: {item.productSku}</p>
                      <p className="text-sm text-gray-600">Sold by: {item.sellerName}</p>
                      {item.attributes && (
                        <div className="flex space-x-2 mt-1">
                          {Object.entries(item.attributes).map(([key, value]) => (
                            <span key={key} className="text-xs bg-gray-100 px-2 py-1 rounded">
                              {key}: {value}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">₹{item.unitPrice} × {item.quantity}</p>
                      <p className="text-lg font-bold text-gray-900">₹{item.totalPrice}</p>
                      {order.status === 'delivered' && (
                        <Button size="sm" variant="outline" className="mt-2">
                          <Star className="w-4 h-4 mr-1" />
                          Review
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Order Date:</span>
                  <span>{format(order.createdAt, 'MMM dd, yyyy')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>₹{order.subtotal}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping:</span>
                  <span>₹{order.shippingCost}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax:</span>
                  <span>₹{order.taxAmount}</span>
                </div>
                {order.discountAmount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount:</span>
                    <span>-₹{order.discountAmount}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>Total:</span>
                  <span>₹{order.totalAmount}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Delivery Address */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin className="w-4 h-4 mr-2" />
                Delivery Address
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm">
                <p className="font-semibold">{order.shippingAddress.name}</p>
                <p>{order.shippingAddress.addressLine1}</p>
                {order.shippingAddress.addressLine2 && <p>{order.shippingAddress.addressLine2}</p>}
                <p>{order.shippingAddress.city}, {order.shippingAddress.state}</p>
                <p>{order.shippingAddress.pincode}</p>
                <div className="mt-2 pt-2 border-t">
                  <p><strong>Phone:</strong> {order.shippingAddress.phone}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Support */}
          <Card>
            <CardHeader>
              <CardTitle>Need Help?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full">
                <MessageSquare className="w-4 h-4 mr-2" />
                Contact Seller
              </Button>
              <Button variant="outline" className="w-full">
                <Phone className="w-4 h-4 mr-2" />
                Customer Support
              </Button>
              <div className="text-center text-sm text-gray-600">
                <p>Questions about your order?</p>
                <p>We're here to help 24/7</p>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          {order.status !== 'delivered' && order.status !== 'cancelled' && (
            <Card>
              <CardHeader>
                <CardTitle>Order Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {order.status === 'processing' && (
                  <Button variant="outline" className="w-full text-red-600">
                    Cancel Order
                  </Button>
                )}
                {(['shipped', 'out_for_delivery'].includes(order.status)) && (
                  <Button variant="outline" className="w-full">
                    Modify Delivery
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}