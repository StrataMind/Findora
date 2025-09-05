'use client'
export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Search, 
  Package, 
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  ArrowLeft,
  Eye,
  Calendar,
  DollarSign
} from 'lucide-react'

interface Order {
  id: string
  orderNumber: string
  status: string
  total: number
  createdAt: string
  items: {
    id: string
    quantity: number
    price: number
    product: {
      id: string
      name: string
      slug: string
      images: { url: string; altText?: string }[]
    }
  }[]
}

const statusConfig = {
  PENDING: { 
    icon: Clock, 
    color: 'text-yellow-600 bg-yellow-100', 
    label: 'Pending' 
  },
  CONFIRMED: { 
    icon: CheckCircle, 
    color: 'text-blue-600 bg-blue-100', 
    label: 'Confirmed' 
  },
  PROCESSING: { 
    icon: Package, 
    color: 'text-purple-600 bg-purple-100', 
    label: 'Processing' 
  },
  SHIPPED: { 
    icon: Truck, 
    color: 'text-indigo-600 bg-indigo-100', 
    label: 'Shipped' 
  },
  DELIVERED: { 
    icon: CheckCircle, 
    color: 'text-green-600 bg-green-100', 
    label: 'Delivered' 
  },
  CANCELLED: { 
    icon: XCircle, 
    color: 'text-red-600 bg-red-100', 
    label: 'Cancelled' 
  }
}

export default function OrdersPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
      return
    }
    
    if (status === 'authenticated') {
      fetchOrders()
    }
  }, [status, router])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/orders')
      if (response.ok) {
        const data = await response.json()
        setOrders(data.orders || [])
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

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

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.items.some(item => 
                           item.product.name.toLowerCase().includes(searchTerm.toLowerCase())
                         )
    const matchesStatus = !statusFilter || order.status === statusFilter
    return matchesSearch && matchesStatus
  })

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center mb-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm" className="flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Dashboard
                </Button>
              </Link>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Order History</h1>
                <p className="text-gray-600 mt-2">Track and manage your orders</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="mb-8 flex flex-col sm:flex-row gap-4">
          <div className="flex-1 max-w-md relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="sm:w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">All Statuses</option>
              {Object.entries(statusConfig).map(([status, config]) => (
                <option key={status} value={status}>
                  {config.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Orders List */}
        {loading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, index) => (
              <div key={index} className="bg-white rounded-lg shadow animate-pulse">
                <div className="p-6 space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-32"></div>
                      <div className="h-4 bg-gray-200 rounded w-24"></div>
                    </div>
                    <div className="h-6 bg-gray-200 rounded w-20"></div>
                  </div>
                  <div className="border-t pt-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-gray-200 rounded"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded"></div>
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-12">
            <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {orders.length === 0 ? 'No orders yet' : 'No orders found'}
            </h3>
            <p className="text-gray-600 mb-4">
              {orders.length === 0 
                ? "You haven't placed any orders yet. Start shopping to see your orders here."
                : searchTerm || statusFilter 
                  ? 'No orders match your current filters.'
                  : 'No orders available.'
              }
            </p>
            {orders.length === 0 ? (
              <Link href="/products">
                <Button>Start Shopping</Button>
              </Link>
            ) : (
              <Button onClick={() => { setSearchTerm(''); setStatusFilter('') }}>
                Clear Filters
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {filteredOrders.map((order) => {
              const StatusIcon = statusConfig[order.status as keyof typeof statusConfig]?.icon || Package
              const statusStyle = statusConfig[order.status as keyof typeof statusConfig]?.color || 'text-gray-600 bg-gray-100'
              const statusLabel = statusConfig[order.status as keyof typeof statusConfig]?.label || order.status
              
              return (
                <div key={order.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
                  <div className="p-6">
                    {/* Order Header */}
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          Order #{order.orderNumber}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {formatDate(order.createdAt)}
                          </div>
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-4 w-4" />
                            {formatPrice(order.total)}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${statusStyle}`}>
                          <StatusIcon className="h-3 w-3" />
                          {statusLabel}
                        </span>
                        <Link href={`/orders/${order.id}`}>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-1" />
                            View Details
                          </Button>
                        </Link>
                      </div>
                    </div>
                    
                    {/* Order Items */}
                    <div className="border-t pt-4">
                      <div className="space-y-3">
                        {order.items.slice(0, 3).map((item) => (
                          <div key={item.id} className="flex items-center space-x-4">
                            <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                              {item.product.images.length > 0 ? (
                                <img
                                  src={item.product.images[0].url}
                                  alt={item.product.images[0].altText || item.product.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Package className="h-6 w-6 text-gray-400" />
                                </div>
                              )}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <Link 
                                href={`/products/${item.product.slug}`}
                                className="text-sm font-medium text-gray-900 hover:text-blue-600 transition-colors"
                              >
                                {item.product.name}
                              </Link>
                              <div className="text-sm text-gray-600 mt-1">
                                Quantity: {item.quantity} × {formatPrice(item.price)}
                              </div>
                            </div>
                            
                            <div className="text-sm font-medium text-gray-900">
                              {formatPrice(item.quantity * item.price)}
                            </div>
                          </div>
                        ))}
                        
                        {order.items.length > 3 && (
                          <div className="text-sm text-gray-600 text-center py-2">
                            +{order.items.length - 3} more item(s)
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}