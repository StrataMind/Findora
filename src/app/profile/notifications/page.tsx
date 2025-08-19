'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import notificationService, { NotificationPreferences, NotificationType } from '@/lib/notifications'
import { usePushNotifications } from '@/lib/push-notifications'
import {
  Bell,
  BellRing,
  Mail,
  Smartphone,
  MessageSquare,
  Settings,
  CheckCircle,
  XCircle,
  Clock,
  Globe,
  Volume2,
  VolumeX,
  Shield,
  Trash2
} from 'lucide-react'
import { toast } from 'sonner'

const notificationTypeLabels: Record<NotificationType, { label: string; description: string; category: string }> = {
  order_confirmation: { 
    label: 'Order Confirmation', 
    description: 'When your order is confirmed and payment is processed',
    category: 'Orders'
  },
  order_shipped: { 
    label: 'Order Shipped', 
    description: 'When your order is shipped and tracking is available',
    category: 'Orders'
  },
  order_delivered: { 
    label: 'Order Delivered', 
    description: 'When your order has been delivered successfully',
    category: 'Orders'
  },
  order_cancelled: { 
    label: 'Order Cancelled', 
    description: 'When an order is cancelled or refunded',
    category: 'Orders'
  },
  payment_success: { 
    label: 'Payment Success', 
    description: 'When a payment is processed successfully',
    category: 'Payments'
  },
  payment_failed: { 
    label: 'Payment Failed', 
    description: 'When a payment fails and requires action',
    category: 'Payments'
  },
  seller_new_order: { 
    label: 'New Order (Seller)', 
    description: 'When you receive a new order as a seller',
    category: 'Seller'
  },
  seller_low_inventory: { 
    label: 'Low Inventory (Seller)', 
    description: 'When product inventory falls below threshold',
    category: 'Seller'
  },
  seller_review_received: { 
    label: 'New Review (Seller)', 
    description: 'When someone leaves a review for your product',
    category: 'Seller'
  },
  price_drop: { 
    label: 'Price Drop', 
    description: 'When items in your wishlist go on sale',
    category: 'Deals'
  },
  wishlist_back_in_stock: { 
    label: 'Back in Stock', 
    description: 'When wishlist items become available again',
    category: 'Deals'
  },
  promotional: { 
    label: 'Promotional', 
    description: 'Marketing emails and special offers',
    category: 'Marketing'
  },
  security_alert: { 
    label: 'Security Alerts', 
    description: 'Important security notifications for your account',
    category: 'Security'
  },
  account_update: { 
    label: 'Account Updates', 
    description: 'Changes to your account settings or profile',
    category: 'Account'
  }
}

export default function NotificationPreferencesPage() {
  const { data: session } = useSession()
  const pushNotifications = usePushNotifications()
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [pushEnabled, setPushEnabled] = useState(false)
  const [pushSupported, setPushSupported] = useState(false)

  useEffect(() => {
    if (session?.user) {
      loadPreferences()
      checkPushSupport()
    }
  }, [session])

  const loadPreferences = async () => {
    if (!session?.user?.id) return

    setLoading(true)
    try {
      const userPreferences = await notificationService.getUserPreferences(session.user.id)
      setPreferences(userPreferences)
    } catch (error) {
      console.error('Failed to load preferences:', error)
      toast.error('Failed to load notification preferences')
    } finally {
      setLoading(false)
    }
  }

  const checkPushSupport = async () => {
    setPushSupported(pushNotifications.isSupported)
    
    if (pushNotifications.isSupported) {
      const permission = pushNotifications.getPermissionStatus()
      const subscription = await pushNotifications.getCurrentSubscription()
      setPushEnabled(permission === 'granted' && !!subscription)
    }
  }

  const savePreferences = async () => {
    if (!session?.user?.id || !preferences) return

    setSaving(true)
    try {
      await notificationService.updateUserPreferences(
        session.user.id,
        preferences.preferences,
        preferences.globalSettings
      )
      toast.success('Notification preferences saved successfully')
    } catch (error) {
      console.error('Failed to save preferences:', error)
      toast.error('Failed to save preferences')
    } finally {
      setSaving(false)
    }
  }

  const toggleNotificationType = (type: NotificationType, enabled: boolean) => {
    if (!preferences) return

    setPreferences({
      ...preferences,
      preferences: {
        ...preferences.preferences,
        [type]: {
          ...preferences.preferences[type],
          enabled
        }
      }
    })
  }

  const toggleChannel = (type: NotificationType, channel: 'email' | 'push') => {
    if (!preferences) return

    const currentChannels = preferences.preferences[type].channels
    const hasChannel = currentChannels.includes(channel)
    
    const newChannels = hasChannel 
      ? currentChannels.filter(c => c !== channel)
      : [...currentChannels, channel]

    setPreferences({
      ...preferences,
      preferences: {
        ...preferences.preferences,
        [type]: {
          ...preferences.preferences[type],
          channels: newChannels
        }
      }
    })
  }

  const updateGlobalSetting = (key: keyof NotificationPreferences['globalSettings'], value: any) => {
    if (!preferences) return

    setPreferences({
      ...preferences,
      globalSettings: {
        ...preferences.globalSettings,
        [key]: value
      }
    })
  }

  const enablePushNotifications = async () => {
    if (!session?.user?.id) return

    try {
      const permission = await pushNotifications.requestPermission()
      
      if (permission === 'granted') {
        const subscription = await pushNotifications.subscribe(session.user.id)
        
        if (subscription) {
          setPushEnabled(true)
          updateGlobalSetting('pushEnabled', true)
          toast.success('Push notifications enabled successfully')
        } else {
          toast.error('Failed to enable push notifications')
        }
      } else {
        toast.error('Push notification permission was denied')
      }
    } catch (error) {
      console.error('Failed to enable push notifications:', error)
      toast.error('Failed to enable push notifications')
    }
  }

  const disablePushNotifications = async () => {
    if (!session?.user?.id) return

    try {
      await pushNotifications.unsubscribe(session.user.id)
      setPushEnabled(false)
      updateGlobalSetting('pushEnabled', false)
      toast.success('Push notifications disabled')
    } catch (error) {
      console.error('Failed to disable push notifications:', error)
      toast.error('Failed to disable push notifications')
    }
  }

  const groupedNotifications = Object.entries(notificationTypeLabels).reduce((groups, [type, info]) => {
    const category = info.category
    if (!groups[category]) {
      groups[category] = []
    }
    groups[category].push({ type: type as NotificationType, ...info })
    return groups
  }, {} as Record<string, Array<{ type: NotificationType; label: string; description: string; category: string }>>)

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

  if (!preferences) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Failed to Load Preferences</h2>
          <p className="text-gray-600 mb-4">We couldn't load your notification preferences.</p>
          <Button onClick={loadPreferences}>Try Again</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Notification Preferences</h1>
          <p className="text-gray-600 mt-2">Manage how and when you receive notifications</p>
        </div>
        <Button onClick={savePreferences} disabled={saving}>
          {saving ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              Saving...
            </>
          ) : (
            <>
              <CheckCircle className="w-4 h-4 mr-2" />
              Save Changes
            </>
          )}
        </Button>
      </div>

      <Tabs defaultValue="notifications" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="notifications">Notification Types</TabsTrigger>
          <TabsTrigger value="channels">Delivery Channels</TabsTrigger>
          <TabsTrigger value="settings">General Settings</TabsTrigger>
        </TabsList>

        {/* Notification Types */}
        <TabsContent value="notifications" className="space-y-6">
          {Object.entries(groupedNotifications).map(([category, notifications]) => (
            <Card key={category}>
              <CardHeader>
                <CardTitle className="flex items-center">
                  {category === 'Orders' && <Bell className="w-5 h-5 mr-2" />}
                  {category === 'Payments' && <CheckCircle className="w-5 h-5 mr-2" />}
                  {category === 'Seller' && <Settings className="w-5 h-5 mr-2" />}
                  {category === 'Deals' && <BellRing className="w-5 h-5 mr-2" />}
                  {category === 'Marketing' && <Mail className="w-5 h-5 mr-2" />}
                  {category === 'Security' && <Shield className="w-5 h-5 mr-2" />}
                  {category === 'Account' && <Settings className="w-5 h-5 mr-2" />}
                  {category}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {notifications.map(({ type, label, description }) => {
                  const typePrefs = preferences.preferences[type]
                  return (
                    <div key={type} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center space-x-2">
                            <Switch
                              checked={typePrefs.enabled}
                              onCheckedChange={(enabled) => toggleNotificationType(type, enabled)}
                            />
                            <div>
                              <Label className="font-semibold">{label}</Label>
                              <p className="text-sm text-gray-600">{description}</p>
                            </div>
                          </div>
                        </div>
                        
                        {typePrefs.enabled && (
                          <div className="flex items-center space-x-4 mt-3">
                            <div className="flex items-center space-x-2">
                              <Switch
                                checked={typePrefs.channels.includes('email')}
                                onCheckedChange={() => toggleChannel(type, 'email')}
                                disabled={!preferences.globalSettings.emailEnabled}
                              />
                              <Mail className="w-4 h-4 text-gray-500" />
                              <span className="text-sm">Email</span>
                            </div>
                            
                            {pushSupported && (
                              <div className="flex items-center space-x-2">
                                <Switch
                                  checked={typePrefs.channels.includes('push')}
                                  onCheckedChange={() => toggleChannel(type, 'push')}
                                  disabled={!preferences.globalSettings.pushEnabled}
                                />
                                <Smartphone className="w-4 h-4 text-gray-500" />
                                <span className="text-sm">Push</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Delivery Channels */}
        <TabsContent value="channels" className="space-y-6">
          {/* Email Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Mail className="w-5 h-5 mr-2" />
                Email Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="font-semibold">Enable Email Notifications</Label>
                  <p className="text-sm text-gray-600">Receive notifications via email</p>
                </div>
                <Switch
                  checked={preferences.globalSettings.emailEnabled}
                  onCheckedChange={(enabled) => updateGlobalSetting('emailEnabled', enabled)}
                />
              </div>
              
              <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded">
                <p><strong>Email Address:</strong> {session?.user?.email}</p>
                <p className="mt-1">Change your email address in account settings</p>
              </div>
            </CardContent>
          </Card>

          {/* Push Notifications */}
          {pushSupported && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Smartphone className="w-5 h-5 mr-2" />
                  Push Notifications
                  {pushEnabled ? (
                    <Badge className="ml-2 bg-green-100 text-green-800">Enabled</Badge>
                  ) : (
                    <Badge className="ml-2 bg-gray-100 text-gray-800">Disabled</Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="font-semibold">Enable Push Notifications</Label>
                    <p className="text-sm text-gray-600">Receive real-time notifications in your browser</p>
                  </div>
                  <Switch
                    checked={pushEnabled}
                    onCheckedChange={(enabled) => 
                      enabled ? enablePushNotifications() : disablePushNotifications()
                    }
                  />
                </div>
                
                {!pushEnabled && (
                  <div className="text-sm text-gray-600 bg-yellow-50 border border-yellow-200 p-3 rounded">
                    <p>💡 Enable push notifications to receive instant alerts for important events like order updates and new messages.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* SMS Settings (Future Feature) */}
          <Card className="opacity-60">
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageSquare className="w-5 h-5 mr-2" />
                SMS Notifications
                <Badge className="ml-2 bg-gray-100 text-gray-600">Coming Soon</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="font-semibold">Enable SMS Notifications</Label>
                  <p className="text-sm text-gray-600">Receive important notifications via text message</p>
                </div>
                <Switch disabled />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* General Settings */}
        <TabsContent value="settings" className="space-y-6">
          {/* Do Not Disturb */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="w-5 h-5 mr-2" />
                Do Not Disturb
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="dndStart">Start Time</Label>
                  <Input
                    id="dndStart"
                    type="time"
                    value={preferences.globalSettings.doNotDisturbStart || ''}
                    onChange={(e) => updateGlobalSetting('doNotDisturbStart', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="dndEnd">End Time</Label>
                  <Input
                    id="dndEnd"
                    type="time"
                    value={preferences.globalSettings.doNotDisturbEnd || ''}
                    onChange={(e) => updateGlobalSetting('doNotDisturbEnd', e.target.value)}
                  />
                </div>
              </div>
              <p className="text-sm text-gray-600">
                During these hours, only urgent notifications (like security alerts) will be delivered.
              </p>
            </CardContent>
          </Card>

          {/* Timezone */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Globe className="w-5 h-5 mr-2" />
                Timezone
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Select
                value={preferences.globalSettings.timezone}
                onValueChange={(value) => updateGlobalSetting('timezone', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Asia/Kolkata">Asia/Kolkata (IST)</SelectItem>
                  <SelectItem value="America/New_York">America/New_York (EST)</SelectItem>
                  <SelectItem value="Europe/London">Europe/London (GMT)</SelectItem>
                  <SelectItem value="Asia/Tokyo">Asia/Tokyo (JST)</SelectItem>
                  <SelectItem value="Australia/Sydney">Australia/Sydney (AEST)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-gray-600 mt-2">
                Used for do not disturb and notification scheduling
              </p>
            </CardContent>
          </Card>

          {/* Sound Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Volume2 className="w-5 h-5 mr-2" />
                Sound & Vibration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="font-semibold">Notification Sound</Label>
                  <p className="text-sm text-gray-600">Play sound for push notifications</p>
                </div>
                <Switch defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label className="font-semibold">Vibration</Label>
                  <p className="text-sm text-gray-600">Vibrate for push notifications (mobile only)</p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}