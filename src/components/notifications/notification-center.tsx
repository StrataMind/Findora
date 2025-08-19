'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import notificationService, { Notification, NotificationType } from '@/lib/notifications'
import {
  Bell,
  BellRing,
  Check,
  CheckCheck,
  Trash2,
  Settings,
  Filter,
  MoreHorizontal,
  ExternalLink,
  Package,
  CreditCard,
  Truck,
  ShoppingCart,
  Star,
  TrendingDown,
  AlertTriangle,
  User,
  RefreshCcw,
  X
} from 'lucide-react'
import Link from 'next/link'
import { formatDistance } from 'date-fns'

const notificationIcons = {
  order_confirmation: ShoppingCart,
  order_shipped: Truck,
  order_delivered: Package,
  order_cancelled: X,
  payment_success: CreditCard,
  payment_failed: AlertTriangle,
  seller_new_order: ShoppingCart,
  seller_low_inventory: Package,
  seller_review_received: Star,
  price_drop: TrendingDown,
  wishlist_back_in_stock: Bell,
  promotional: Star,
  security_alert: AlertTriangle,
  account_update: User
}

const notificationColors = {
  order_confirmation: 'text-green-600',
  order_shipped: 'text-blue-600',
  order_delivered: 'text-green-600',
  order_cancelled: 'text-red-600',
  payment_success: 'text-green-600',
  payment_failed: 'text-red-600',
  seller_new_order: 'text-green-600',
  seller_low_inventory: 'text-orange-600',
  seller_review_received: 'text-yellow-600',
  price_drop: 'text-purple-600',
  wishlist_back_in_stock: 'text-blue-600',
  promotional: 'text-pink-600',
  security_alert: 'text-red-600',
  account_update: 'text-blue-600'
}

interface NotificationCenterProps {
  trigger?: React.ReactNode
  showBadge?: boolean
}

export default function NotificationCenter({ trigger, showBadge = true }: NotificationCenterProps) {
  const { data: session } = useSession()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('all')
  const [typeFilter, setTypeFilter] = useState<NotificationType | 'all'>('all')

  useEffect(() => {
    if (session?.user) {
      loadNotifications()
    }
  }, [session, typeFilter])

  const loadNotifications = async () => {
    if (!session?.user?.id) return

    setIsLoading(true)
    try {
      const filters: any = {}
      if (typeFilter !== 'all') {
        filters.type = [typeFilter]
      }

      const result = await notificationService.getUserNotifications(session.user.id, filters)
      setNotifications(result.notifications)
      setUnreadCount(result.unreadCount)
    } catch (error) {
      console.error('Failed to load notifications:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const markAsRead = async (notificationId: string) => {
    if (!session?.user?.id) return

    try {
      await notificationService.markAsRead(notificationId, session.user.id)
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, isRead: true, readAt: new Date() } : n)
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
    }
  }

  const markAllAsRead = async () => {
    if (!session?.user?.id) return

    try {
      await notificationService.markAllAsRead(session.user.id)
      setNotifications(prev =>
        prev.map(n => ({ ...n, isRead: true, readAt: new Date() }))
      )
      setUnreadCount(0)
    } catch (error) {
      console.error('Failed to mark all as read:', error)
    }
  }

  const deleteNotification = async (notificationId: string) => {
    if (!session?.user?.id) return

    try {
      await notificationService.deleteNotification(notificationId, session.user.id)
      setNotifications(prev => prev.filter(n => n.id !== notificationId))
      setUnreadCount(prev => {
        const notification = notifications.find(n => n.id === notificationId)
        return notification && !notification.isRead ? prev - 1 : prev
      })
    } catch (error) {
      console.error('Failed to delete notification:', error)
    }
  }

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      markAsRead(notification.id)
    }
    
    if (notification.actionUrl) {
      window.open(notification.actionUrl, '_blank')
    }
  }

  const filteredNotifications = notifications.filter(notification => {
    if (activeTab === 'all') return true
    if (activeTab === 'unread') return !notification.isRead
    if (activeTab === 'orders') return ['order_confirmation', 'order_shipped', 'order_delivered', 'seller_new_order'].includes(notification.type)
    if (activeTab === 'promotions') return ['price_drop', 'wishlist_back_in_stock', 'promotional'].includes(notification.type)
    return true
  })

  const DefaultTrigger = () => (
    <Button variant="ghost" size="sm" className="relative">
      <Bell className="w-5 h-5" />
      {showBadge && unreadCount > 0 && (
        <Badge className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center p-0 bg-red-500 text-white text-xs">
          {unreadCount > 99 ? '99+' : unreadCount}
        </Badge>
      )}
    </Button>
  )

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || <DefaultTrigger />}
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[80vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center">
              <BellRing className="w-5 h-5 mr-2" />
              Notifications
              {unreadCount > 0 && (
                <Badge className="ml-2 bg-red-500 text-white">
                  {unreadCount}
                </Badge>
              )}
            </DialogTitle>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={loadNotifications}
                disabled={isLoading}
              >
                <RefreshCcw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
              {unreadCount > 0 && (
                <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                  <CheckCheck className="w-4 h-4" />
                </Button>
              )}
              <Link href="/profile/notifications">
                <Button variant="ghost" size="sm">
                  <Settings className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </DialogHeader>

        <div className="px-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="unread">
                Unread
                {unreadCount > 0 && (
                  <Badge className="ml-1 bg-red-500 text-white text-xs">
                    {unreadCount}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="orders">Orders</TabsTrigger>
              <TabsTrigger value="promotions">Deals</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="overflow-y-auto max-h-96 px-6 pb-6">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-2 text-sm">Loading notifications...</p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="text-center py-8">
              <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">No notifications</h3>
              <p className="text-gray-600 text-sm">
                {activeTab === 'unread' ? "You're all caught up!" : "No notifications to show"}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredNotifications.map((notification) => {
                const Icon = notificationIcons[notification.type] || Bell
                const iconColor = notificationColors[notification.type] || 'text-gray-600'
                
                return (
                  <div
                    key={notification.id}
                    className={`
                      p-3 rounded-lg border cursor-pointer transition-colors hover:bg-gray-50
                      ${notification.isRead ? 'bg-white border-gray-200' : 'bg-blue-50 border-blue-200'}
                    `}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${notification.isRead ? 'bg-gray-100' : 'bg-blue-100'}`}>
                        <Icon className={`w-4 h-4 ${iconColor}`} />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className={`text-sm font-semibold ${notification.isRead ? 'text-gray-900' : 'text-blue-900'} truncate`}>
                            {notification.title}
                          </h4>
                          <div className="flex items-center space-x-1">
                            {!notification.isRead && (
                              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                            )}
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                  <MoreHorizontal className="w-3 h-3" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                {!notification.isRead && (
                                  <DropdownMenuItem onClick={(e) => {
                                    e.stopPropagation()
                                    markAsRead(notification.id)
                                  }}>
                                    <Check className="w-4 h-4 mr-2" />
                                    Mark as Read
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem 
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    deleteNotification(notification.id)
                                  }}
                                  className="text-red-600"
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                        
                        <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                          {notification.message}
                        </p>
                        
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-gray-500">
                            {formatDistance(notification.createdAt, new Date(), { addSuffix: true })}
                          </span>
                          
                          {notification.priority === 'high' && (
                            <Badge variant="destructive" className="text-xs">
                              High Priority
                            </Badge>
                          )}
                        </div>
                        
                        {notification.actionUrl && notification.actionLabel && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="mt-2 h-7 text-xs"
                            onClick={(e) => {
                              e.stopPropagation()
                              window.open(notification.actionUrl, '_blank')
                            }}
                          >
                            {notification.actionLabel}
                            <ExternalLink className="w-3 h-3 ml-1" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* View All Link */}
        <div className="border-t p-4 text-center">
          <Link href="/profile/notifications">
            <Button variant="outline" className="w-full">
              View All Notifications
            </Button>
          </Link>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export { NotificationCenter }
export default NotificationCenter