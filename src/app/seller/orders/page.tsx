'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import orderManager, { Order, OrderStatus, OrderStats } from '@/lib/order-management'
import {
  Package,
  Clock,
  Truck,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  MessageSquare,
  Download,
  RefreshCcw,
  TrendingUp,
  Users,
  DollarSign,
  ShoppingCart,
  AlertCircle
} from 'lucide-react'
import Link from 'next/link'
import { formatDistance } from 'date-fns'

const statusIcons = {
  pending_payment: Clock,
  payment_confirmed: CheckCircle,
  processing: Package,
  shipped: Truck,
  out_for_delivery: Truck,
  delivered: CheckCircle,
  cancelled: XCircle,
  refund_requested: AlertCircle,
  refunded: CheckCircle
}

export default function SellerOrdersPage() {
  const { data: session } = useSession()
  const [orders, setOrders] = useState<Order[]>([])
  const [stats, setStats] = useState<OrderStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all')
  const [activeTab, setActiveTab] = useState('all')

  useEffect(() => {
    loadOrders()
    loadStats()
  }, [searchQuery, statusFilter])

  const loadOrders = async () => {
    setLoading(true)
    try {
      const filters: any = {}
      
      if (statusFilter !== 'all') {
        filters.status = [statusFilter]
      }
      
      if (searchQuery.trim()) {
        filters.search = searchQuery.trim()
      }

      const result = await orderManager.getSellerOrders('seller123', filters)
      setOrders(result.orders)
    } catch (error) {
      console.error('Failed to load orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      const orderStats = await orderManager.getOrderStats('seller123')
      setStats(orderStats)
    } catch (error) {
      console.error('Failed to load stats:', error)
    }
  }

  const handleStatusUpdate = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await orderManager.updateOrderStatus(orderId, newStatus, session?.user?.id || '')
      loadOrders() // Refresh orders
    } catch (error) {
      console.error('Failed to update order status:', error)
    }
  }

  const getStatusBadgeColor = (status: OrderStatus) => {
    const colors = {
      pending_payment: 'bg-orange-100 text-orange-800',
      payment_confirmed: 'bg-green-100 text-green-800',
      processing: 'bg-blue-100 text-blue-800',
      shipped: 'bg-purple-100 text-purple-800',
      out_for_delivery: 'bg-indigo-100 text-indigo-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      refund_requested: 'bg-yellow-100 text-yellow-800',
      refunded: 'bg-gray-100 text-gray-800'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const filteredOrders = orders.filter(order => {
    if (activeTab === 'all') return true
    if (activeTab === 'pending') return ['pending_payment', 'payment_confirmed'].includes(order.status)
    if (activeTab === 'processing') return order.status === 'processing'
    if (activeTab === 'shipped') return ['shipped', 'out_for_delivery'].includes(order.status)
    if (activeTab === 'completed') return order.status === 'delivered'
    if (activeTab === 'issues') return ['cancelled', 'refund_requested', 'refunded'].includes(order.status)
    return true
  })

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Order Management</h1>
          <p className="text-gray-600 mt-2">Manage and track all your orders</p>
        </div>
        <div className="flex space-x-4">
          <Button variant="outline" onClick={loadOrders}>
            <RefreshCcw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Orders</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
                </div>
                <ShoppingCart className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">₹{stats.totalRevenue.toLocaleString()}</p>
                </div>
                <DollarSign className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg Order Value</p>
                  <p className="text-2xl font-bold text-gray-900">₹{stats.averageOrderValue}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Orders</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.pendingOrders}</p>
                </div>
                <Clock className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="search">Search Orders</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Search by order number, customer name, or product..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="w-full lg:w-48">
              <Label htmlFor="status">Filter by Status</Label>
              <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as OrderStatus | 'all')}>
                <SelectTrigger>
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending_payment">Pending Payment</SelectItem>
                  <SelectItem value="payment_confirmed">Payment Confirmed</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="out_for_delivery">Out for Delivery</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="all">All ({orders.length})</TabsTrigger>
              <TabsTrigger value="pending">Pending ({orders.filter(o => ['pending_payment', 'payment_confirmed'].includes(o.status)).length})</TabsTrigger>
              <TabsTrigger value="processing">Processing ({orders.filter(o => o.status === 'processing').length})</TabsTrigger>
              <TabsTrigger value="shipped">Shipped ({orders.filter(o => ['shipped', 'out_for_delivery'].includes(o.status)).length})</TabsTrigger>
              <TabsTrigger value="completed">Completed ({orders.filter(o => o.status === 'delivered').length})</TabsTrigger>
              <TabsTrigger value="issues">Issues ({orders.filter(o => ['cancelled', 'refund_requested', 'refunded'].includes(o.status)).length})</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-2">Loading orders...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-8">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No orders found</h3>
              <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((order) => {
                const StatusIcon = statusIcons[order.status]
                const statusInfo = orderManager.formatOrderStatus(order.status)
                
                return (
                  <div key={order.id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <StatusIcon className="w-5 h-5 text-gray-600" />
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="font-semibold text-gray-900">{order.orderNumber}</h3>
                            <Badge className={getStatusBadgeColor(order.status)}>
                              {statusInfo.label}
                            </Badge>
                            {order.priority === 'high' && (
                              <Badge variant="destructive">High Priority</Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">
                            {order.customerName} • {order.items.length} item(s) • ₹{order.totalAmount}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatDistance(order.createdAt, new Date(), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Select
                          value={order.status}
                          onValueChange={(value) => handleStatusUpdate(order.id, value as OrderStatus)}
                        >
                          <SelectTrigger className="w-40">
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
                        
                        <Link href={`/seller/orders/${order.id}`}>
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                        </Link>
                        
                        <Button variant="outline" size="sm">
                          <MessageSquare className="w-4 h-4 mr-1" />
                          Message
                        </Button>
                      </div>
                    </div>
                    
                    {/* Order Items Preview */}
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <div className="flex flex-wrap gap-2">
                        {order.items.slice(0, 3).map((item, idx) => (
                          <span key={idx} className="text-xs bg-gray-100 px-2 py-1 rounded">
                            {item.quantity}x {item.productName}
                          </span>
                        ))}
                        {order.items.length > 3 && (
                          <span className="text-xs text-gray-500">
                            +{order.items.length - 3} more items
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}