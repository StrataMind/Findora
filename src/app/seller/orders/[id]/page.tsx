'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import orderManager, { Order, OrderStatus, ShippingStatus, DeliveryPartner, TrackingEvent } from '@/lib/order-management'
import {
  ArrowLeft,
  Package,
  Truck,
  MessageSquare,
  Phone,
  Mail,
  MapPin,
  Calendar,
  CreditCard,
  Edit,
  Send,
  Plus,
  CheckCircle,
  Clock,
  AlertCircle,
  Download,
  Printer,
  RefreshCcw
} from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'

export default function SellerOrderDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [newMessage, setNewMessage] = useState('')
  const [showShippingDialog, setShowShippingDialog] = useState(false)
  const [shippingForm, setShippingForm] = useState({
    trackingId: '',
    deliveryPartner: 'delhivery' as DeliveryPartner,
    estimatedDeliveryDays: 3,
    shippingCost: 50,
    weight: 1
  })
  const [newTrackingEvent, setNewTrackingEvent] = useState({
    status: 'in_transit' as ShippingStatus,
    location: '',
    description: ''
  })

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
    } catch (error) {
      console.error('Failed to load order:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (newStatus: OrderStatus) => {
    if (!order) return
    
    try {
      await orderManager.updateOrderStatus(order.id, newStatus, session?.user?.id || '')
      setOrder({ ...order, status: newStatus })
    } catch (error) {
      console.error('Failed to update status:', error)
    }
  }

  const handleSendMessage = async () => {
    if (!order || !newMessage.trim()) return
    
    try {
      await orderManager.addCommunication(order.id, {
        from: 'seller',
        fromUserId: session?.user?.id || '',
        fromUserName: session?.user?.name || 'Seller',
        message: newMessage.trim()
      })
      
      setNewMessage('')
      loadOrder() // Refresh order to get updated communications
    } catch (error) {
      console.error('Failed to send message:', error)
    }
  }

  const handleAddShipping = async () => {
    if (!order) return
    
    try {
      const deliveryPartners = orderManager.getDeliveryPartners()
      const partner = deliveryPartners.find(p => p.id === shippingForm.deliveryPartner)
      
      await orderManager.addShippingInfo(order.id, {
        trackingId: shippingForm.trackingId,
        deliveryPartner: shippingForm.deliveryPartner,
        expectedDeliveryDate: new Date(Date.now() + shippingForm.estimatedDeliveryDays * 24 * 60 * 60 * 1000),
        trackingUrl: partner?.trackingUrl + shippingForm.trackingId || '',
        currentStatus: 'shipped',
        shippedDate: new Date(),
        estimatedDeliveryDays: shippingForm.estimatedDeliveryDays,
        shippingCost: shippingForm.shippingCost,
        weight: shippingForm.weight
      })
      
      // Update order status to shipped
      await handleStatusUpdate('shipped')
      
      setShowShippingDialog(false)
      loadOrder()
    } catch (error) {
      console.error('Failed to add shipping info:', error)
    }
  }

  const handleAddTrackingEvent = async () => {
    if (!order || !newTrackingEvent.location || !newTrackingEvent.description) return
    
    try {
      await orderManager.addTrackingEvent(order.id, {
        timestamp: new Date(),
        status: newTrackingEvent.status,
        location: newTrackingEvent.location,
        description: newTrackingEvent.description,
        isDeliveryUpdate: ['delivered', 'delivery_failed'].includes(newTrackingEvent.status)
      })
      
      setNewTrackingEvent({
        status: 'in_transit',
        location: '',
        description: ''
      })
      
      loadOrder()
    } catch (error) {
      console.error('Failed to add tracking event:', error)
    }
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
          <Link href="/seller/orders">
            <Button>Back to Orders</Button>
          </Link>
        </div>
      </div>
    )
  }

  const statusInfo = orderManager.formatOrderStatus(order.status)

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <Link href="/seller/orders">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Order {order.orderNumber}</h1>
            <div className="flex items-center space-x-4 mt-2">
              <Badge className={`bg-${statusInfo.color}-100 text-${statusInfo.color}-800`}>
                {statusInfo.label}
              </Badge>
              <span className="text-gray-600">
                Placed on {format(order.createdAt, 'MMM dd, yyyy')}
              </span>
              {order.priority === 'high' && (
                <Badge variant="destructive">High Priority</Badge>
              )}
            </div>
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
          <Button variant="outline">
            <Printer className="w-4 h-4 mr-2" />
            Print
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Package className="w-5 h-5 mr-2" />
                Order Items ({order.items.length})
              </CardTitle>
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
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Order Summary */}
              <div className="border-t mt-6 pt-4">
                <div className="space-y-2">
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
              </div>
            </CardContent>
          </Card>

          {/* Shipping & Tracking */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  <Truck className="w-5 h-5 mr-2" />
                  Shipping & Tracking
                </CardTitle>
                {!order.shippingInfo && order.status === 'processing' && (
                  <Dialog open={showShippingDialog} onOpenChange={setShowShippingDialog}>
                    <DialogTrigger asChild>
                      <Button>Add Shipping Info</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add Shipping Information</DialogTitle>
                        <DialogDescription>
                          Add tracking details for this order
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="trackingId">Tracking ID</Label>
                          <Input
                            id="trackingId"
                            value={shippingForm.trackingId}
                            onChange={(e) => setShippingForm({ ...shippingForm, trackingId: e.target.value })}
                            placeholder="Enter tracking ID"
                          />
                        </div>
                        <div>
                          <Label htmlFor="deliveryPartner">Delivery Partner</Label>
                          <Select 
                            value={shippingForm.deliveryPartner} 
                            onValueChange={(value) => setShippingForm({ ...shippingForm, deliveryPartner: value as DeliveryPartner })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {orderManager.getDeliveryPartners().map((partner) => (
                                <SelectItem key={partner.id} value={partner.id}>
                                  {partner.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="estimatedDays">Est. Delivery Days</Label>
                            <Input
                              id="estimatedDays"
                              type="number"
                              value={shippingForm.estimatedDeliveryDays}
                              onChange={(e) => setShippingForm({ ...shippingForm, estimatedDeliveryDays: parseInt(e.target.value) })}
                            />
                          </div>
                          <div>
                            <Label htmlFor="weight">Weight (kg)</Label>
                            <Input
                              id="weight"
                              type="number"
                              step="0.1"
                              value={shippingForm.weight}
                              onChange={(e) => setShippingForm({ ...shippingForm, weight: parseFloat(e.target.value) })}
                            />
                          </div>
                        </div>
                        <Button onClick={handleAddShipping} className="w-full">
                          Add Shipping Info
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {order.shippingInfo ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Tracking ID</Label>
                      <p className="font-mono">{order.shippingInfo.trackingId}</p>
                    </div>
                    <div>
                      <Label>Delivery Partner</Label>
                      <p>{orderManager.getDeliveryPartners().find(p => p.id === order.shippingInfo!.deliveryPartner)?.name}</p>
                    </div>
                    <div>
                      <Label>Expected Delivery</Label>
                      <p>{format(order.shippingInfo.expectedDeliveryDate, 'MMM dd, yyyy')}</p>
                    </div>
                    <div>
                      <Label>Current Status</Label>
                      <Badge>{order.shippingInfo.currentStatus.replace('_', ' ')}</Badge>
                    </div>
                  </div>
                  
                  {/* Add Tracking Event */}
                  <div className="border-t pt-4">
                    <h4 className="font-semibold mb-3">Add Tracking Update</h4>
                    <div className="grid grid-cols-3 gap-3">
                      <Select 
                        value={newTrackingEvent.status} 
                        onValueChange={(value) => setNewTrackingEvent({ ...newTrackingEvent, status: value as ShippingStatus })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="shipped">Shipped</SelectItem>
                          <SelectItem value="in_transit">In Transit</SelectItem>
                          <SelectItem value="out_for_delivery">Out for Delivery</SelectItem>
                          <SelectItem value="delivered">Delivered</SelectItem>
                          <SelectItem value="delivery_failed">Delivery Failed</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input
                        placeholder="Location"
                        value={newTrackingEvent.location}
                        onChange={(e) => setNewTrackingEvent({ ...newTrackingEvent, location: e.target.value })}
                      />
                      <div className="flex space-x-2">
                        <Input
                          placeholder="Description"
                          value={newTrackingEvent.description}
                          onChange={(e) => setNewTrackingEvent({ ...newTrackingEvent, description: e.target.value })}
                          className="flex-1"
                        />
                        <Button onClick={handleAddTrackingEvent}>
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Truck className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No shipping information added yet</p>
                  <p className="text-sm">Add shipping details once the order is ready to ship</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Communications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageSquare className="w-5 h-5 mr-2" />
                Order Communications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.communications.length > 0 ? (
                  order.communications.map((comm, index) => (
                    <div key={index} className={`p-4 rounded-lg ${comm.from === 'seller' ? 'bg-blue-50 ml-8' : 'bg-gray-50 mr-8'}`}>
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-semibold">
                          {comm.from === 'seller' ? 'You' : comm.fromUserName}
                        </span>
                        <span className="text-sm text-gray-500">
                          {format(comm.timestamp, 'MMM dd, yyyy HH:mm')}
                        </span>
                      </div>
                      <p className="text-gray-700">{comm.message}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4">No communications yet</p>
                )}
                
                <div className="border-t pt-4">
                  <div className="flex space-x-2">
                    <Textarea
                      placeholder="Type your message to the customer..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      rows={3}
                      className="flex-1"
                    />
                    <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Order Status */}
          <Card>
            <CardHeader>
              <CardTitle>Order Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label>Current Status</Label>
                  <Select value={order.status} onValueChange={handleStatusUpdate}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="processing">Processing</SelectItem>
                      <SelectItem value="shipped">Shipped</SelectItem>
                      <SelectItem value="out_for_delivery">Out for Delivery</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Priority</Label>
                  <Badge variant={order.priority === 'high' ? 'destructive' : 'secondary'}>
                    {order.priority} Priority
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-gray-500" />
                <span>{order.customerEmail}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-gray-500" />
                <span>{order.customerPhone}</span>
              </div>
            </CardContent>
          </Card>

          {/* Shipping Address */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin className="w-4 h-4 mr-2" />
                Shipping Address
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm">
                <p className="font-semibold">{order.shippingAddress.name}</p>
                <p>{order.shippingAddress.addressLine1}</p>
                {order.shippingAddress.addressLine2 && <p>{order.shippingAddress.addressLine2}</p>}
                <p>{order.shippingAddress.city}, {order.shippingAddress.state}</p>
                <p>{order.shippingAddress.pincode}</p>
                <p>{order.shippingAddress.country}</p>
                <div className="mt-2 pt-2 border-t">
                  <p><strong>Phone:</strong> {order.shippingAddress.phone}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CreditCard className="w-4 h-4 mr-2" />
                Payment Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Status:</span>
                  <Badge variant={order.paymentStatus === 'paid' ? 'default' : 'destructive'}>
                    {order.paymentStatus}
                  </Badge>
                </div>
                {order.paymentId && (
                  <div className="flex justify-between">
                    <span>Payment ID:</span>
                    <span className="font-mono text-xs">{order.paymentId.substring(0, 20)}...</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Currency:</span>
                  <span>{order.currency}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}