/**
 * Notification System
 * 
 * This module provides comprehensive notification management including
 * in-app notifications, email preferences, and push notifications.
 */

export type NotificationType = 
  | 'order_confirmation'
  | 'order_shipped'
  | 'order_delivered'
  | 'order_cancelled'
  | 'payment_success'
  | 'payment_failed'
  | 'seller_new_order'
  | 'seller_low_inventory'
  | 'seller_review_received'
  | 'price_drop'
  | 'wishlist_back_in_stock'
  | 'promotional'
  | 'security_alert'
  | 'account_update'

export type NotificationChannel = 'in_app' | 'email' | 'push' | 'sms'

export type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent'

export interface NotificationPreferences {
  userId: string
  preferences: {
    [K in NotificationType]: {
      enabled: boolean
      channels: NotificationChannel[]
    }
  }
  globalSettings: {
    emailEnabled: boolean
    pushEnabled: boolean
    smsEnabled: boolean
    doNotDisturbStart?: string // HH:mm format
    doNotDisturbEnd?: string // HH:mm format
    timezone: string
  }
  updatedAt: Date
}

export interface Notification {
  id: string
  userId: string
  type: NotificationType
  title: string
  message: string
  data?: Record<string, any>
  priority: NotificationPriority
  channels: NotificationChannel[]
  isRead: boolean
  isDelivered: boolean
  createdAt: Date
  readAt?: Date
  deliveredAt?: Date
  expiresAt?: Date
  actionUrl?: string
  actionLabel?: string
  imageUrl?: string
  groupKey?: string // For grouping related notifications
}

export interface EmailTemplate {
  subject: string
  htmlContent: string
  textContent: string
  templateVariables: Record<string, any>
}

export interface PushNotificationPayload {
  title: string
  body: string
  icon?: string
  badge?: string
  image?: string
  data?: Record<string, any>
  actions?: {
    action: string
    title: string
    icon?: string
  }[]
  tag?: string
  requireInteraction?: boolean
  silent?: boolean
}

class NotificationService {
  private defaultPreferences: NotificationPreferences['preferences'] = {
    order_confirmation: { enabled: true, channels: ['in_app', 'email'] },
    order_shipped: { enabled: true, channels: ['in_app', 'email', 'push'] },
    order_delivered: { enabled: true, channels: ['in_app', 'email', 'push'] },
    order_cancelled: { enabled: true, channels: ['in_app', 'email'] },
    payment_success: { enabled: true, channels: ['in_app', 'email'] },
    payment_failed: { enabled: true, channels: ['in_app', 'email', 'push'] },
    seller_new_order: { enabled: true, channels: ['in_app', 'email', 'push'] },
    seller_low_inventory: { enabled: true, channels: ['in_app', 'email'] },
    seller_review_received: { enabled: true, channels: ['in_app', 'email'] },
    price_drop: { enabled: true, channels: ['in_app', 'push'] },
    wishlist_back_in_stock: { enabled: true, channels: ['in_app', 'email', 'push'] },
    promotional: { enabled: false, channels: ['email'] },
    security_alert: { enabled: true, channels: ['in_app', 'email', 'push'] },
    account_update: { enabled: true, channels: ['in_app', 'email'] }
  }

  /**
   * Send notification to user
   */
  async sendNotification(notification: Omit<Notification, 'id' | 'isRead' | 'isDelivered' | 'createdAt'>): Promise<string> {
    const notificationId = this.generateNotificationId()
    
    const fullNotification: Notification = {
      ...notification,
      id: notificationId,
      isRead: false,
      isDelivered: false,
      createdAt: new Date()
    }

    // Get user preferences
    const preferences = await this.getUserPreferences(notification.userId)
    const typePreferences = preferences.preferences[notification.type]

    if (!typePreferences.enabled) {
      console.log(`Notification ${notification.type} disabled for user ${notification.userId}`)
      return notificationId
    }

    // Check do not disturb
    if (this.isDoNotDisturbTime(preferences.globalSettings)) {
      if (notification.priority !== 'urgent') {
        console.log(`Notification delayed due to do not disturb for user ${notification.userId}`)
        // TODO: Schedule for later delivery
        return notificationId
      }
    }

    // Send through enabled channels
    const enabledChannels = notification.channels.filter(channel => 
      typePreferences.channels.includes(channel) && this.isChannelEnabled(channel, preferences.globalSettings)
    )

    await Promise.all(
      enabledChannels.map(channel => this.sendToChannel(fullNotification, channel))
    )

    // Store notification in database
    await this.storeNotification(fullNotification)

    console.log(`Notification sent: ${notificationId} to user ${notification.userId} via ${enabledChannels.join(', ')}`)
    return notificationId
  }

  /**
   * Send bulk notifications
   */
  async sendBulkNotifications(
    userIds: string[],
    notification: Omit<Notification, 'id' | 'userId' | 'isRead' | 'isDelivered' | 'createdAt'>
  ): Promise<string[]> {
    const results = await Promise.all(
      userIds.map(userId => 
        this.sendNotification({ ...notification, userId })
      )
    )
    return results
  }

  /**
   * Get user notifications
   */
  async getUserNotifications(
    userId: string,
    filters?: {
      type?: NotificationType[]
      isRead?: boolean
      limit?: number
      offset?: number
    }
  ): Promise<{ notifications: Notification[]; total: number; unreadCount: number }> {
    // TODO: Implement actual database query
    const mockNotifications = this.generateMockNotifications(userId)
    
    let filtered = mockNotifications
    
    if (filters?.type) {
      filtered = filtered.filter(n => filters.type!.includes(n.type))
    }
    
    if (filters?.isRead !== undefined) {
      filtered = filtered.filter(n => n.isRead === filters.isRead)
    }

    const total = filtered.length
    const unreadCount = filtered.filter(n => !n.isRead).length
    const limit = filters?.limit || 20
    const offset = filters?.offset || 0

    return {
      notifications: filtered.slice(offset, offset + limit),
      total,
      unreadCount
    }
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string, userId: string): Promise<boolean> {
    console.log(`Marking notification ${notificationId} as read for user ${userId}`)
    // TODO: Implement actual database update
    return true
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(userId: string): Promise<boolean> {
    console.log(`Marking all notifications as read for user ${userId}`)
    // TODO: Implement actual database update
    return true
  }

  /**
   * Delete notification
   */
  async deleteNotification(notificationId: string, userId: string): Promise<boolean> {
    console.log(`Deleting notification ${notificationId} for user ${userId}`)
    // TODO: Implement actual database deletion
    return true
  }

  /**
   * Get user notification preferences
   */
  async getUserPreferences(userId: string): Promise<NotificationPreferences> {
    // TODO: Implement actual database query
    return {
      userId,
      preferences: this.defaultPreferences,
      globalSettings: {
        emailEnabled: true,
        pushEnabled: true,
        smsEnabled: false,
        timezone: 'Asia/Kolkata'
      },
      updatedAt: new Date()
    }
  }

  /**
   * Update user notification preferences
   */
  async updateUserPreferences(
    userId: string,
    preferences: Partial<NotificationPreferences['preferences']>,
    globalSettings?: Partial<NotificationPreferences['globalSettings']>
  ): Promise<boolean> {
    console.log(`Updating preferences for user ${userId}:`, { preferences, globalSettings })
    // TODO: Implement actual database update
    return true
  }

  /**
   * Send email notification
   */
  async sendEmail(
    to: string,
    template: EmailTemplate,
    priority: NotificationPriority = 'medium'
  ): Promise<boolean> {
    console.log(`Sending email to ${to}:`, {
      subject: template.subject,
      priority,
      timestamp: new Date()
    })

    // TODO: Integrate with actual email service (SendGrid, SES, etc.)
    /*
    const emailService = new EmailService()
    const result = await emailService.send({
      to,
      subject: template.subject,
      html: template.htmlContent,
      text: template.textContent,
      priority
    })
    return result.success
    */

    return true
  }

  /**
   * Send push notification
   */
  async sendPushNotification(
    userId: string,
    payload: PushNotificationPayload
  ): Promise<boolean> {
    console.log(`Sending push notification to user ${userId}:`, payload)

    // TODO: Integrate with push notification service (FCM, etc.)
    /*
    const pushService = new PushNotificationService()
    const result = await pushService.send(userId, payload)
    return result.success
    */

    return true
  }

  /**
   * Send SMS notification
   */
  async sendSMS(
    phoneNumber: string,
    message: string,
    priority: NotificationPriority = 'medium'
  ): Promise<boolean> {
    console.log(`Sending SMS to ${phoneNumber}:`, { message, priority })

    // TODO: Integrate with SMS service (Twilio, etc.)
    /*
    const smsService = new SMSService()
    const result = await smsService.send({
      to: phoneNumber,
      message,
      priority
    })
    return result.success
    */

    return true
  }

  /**
   * Create notification templates for different types
   */
  createNotificationTemplate(
    type: NotificationType,
    data: Record<string, any>
  ): { title: string; message: string; actionUrl?: string; actionLabel?: string } {
    const templates = {
      order_confirmation: {
        title: 'Order Confirmed! 🎉',
        message: `Your order ${data.orderNumber} has been confirmed for ₹${data.amount}`,
        actionUrl: `/orders/${data.orderId}`,
        actionLabel: 'View Order'
      },
      order_shipped: {
        title: 'Order Shipped 📦',
        message: `Your order ${data.orderNumber} has been shipped via ${data.carrier}`,
        actionUrl: `/orders/${data.orderId}`,
        actionLabel: 'Track Package'
      },
      order_delivered: {
        title: 'Order Delivered! ✅',
        message: `Your order ${data.orderNumber} has been delivered successfully`,
        actionUrl: `/orders/${data.orderId}`,
        actionLabel: 'Leave Review'
      },
      seller_new_order: {
        title: 'New Order Received! 💰',
        message: `New order ${data.orderNumber} worth ₹${data.amount} from ${data.customerName}`,
        actionUrl: `/seller/orders/${data.orderId}`,
        actionLabel: 'Process Order'
      },
      payment_success: {
        title: 'Payment Successful 💳',
        message: `Payment of ₹${data.amount} processed successfully for order ${data.orderNumber}`,
        actionUrl: `/orders/${data.orderId}`,
        actionLabel: 'View Order'
      },
      payment_failed: {
        title: 'Payment Failed ❌',
        message: `Payment failed for order ${data.orderNumber}. Please try again.`,
        actionUrl: `/orders/${data.orderId}/payment`,
        actionLabel: 'Retry Payment'
      },
      seller_low_inventory: {
        title: 'Low Inventory Alert ⚠️',
        message: `${data.productName} is running low (${data.quantity} left)`,
        actionUrl: `/seller/products/${data.productId}`,
        actionLabel: 'Update Stock'
      },
      wishlist_back_in_stock: {
        title: 'Back in Stock! 🔔',
        message: `${data.productName} from your wishlist is now available`,
        actionUrl: `/products/${data.productSlug}`,
        actionLabel: 'Buy Now'
      },
      price_drop: {
        title: 'Price Drop Alert 💸',
        message: `${data.productName} price dropped to ₹${data.newPrice} (${data.discount}% off)`,
        actionUrl: `/products/${data.productSlug}`,
        actionLabel: 'Buy Now'
      },
      security_alert: {
        title: 'Security Alert 🔐',
        message: data.message,
        actionUrl: '/profile/security',
        actionLabel: 'Review Security'
      }
    }

    return templates[type] || {
      title: 'Notification',
      message: data.message || 'You have a new notification',
      actionUrl: data.actionUrl
    }
  }

  /**
   * Create email template for notification type
   */
  createEmailTemplate(type: NotificationType, data: Record<string, any>): EmailTemplate {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://findora.com'
    
    switch (type) {
      case 'order_confirmation':
        return {
          subject: `Order Confirmed - ${data.orderNumber}`,
          htmlContent: `<!-- Order confirmation email will be rendered by React component -->`,
          textContent: `Your order ${data.orderNumber} has been confirmed for ₹${data.amount}. Track your order at ${baseUrl}/orders/${data.orderId}`,
          templateVariables: data
        }

      case 'order_shipped':
        return {
          subject: `Order Shipped - ${data.orderNumber}`,
          htmlContent: `<!-- Shipping notification email will be rendered by React component -->`,
          textContent: `Your order ${data.orderNumber} has been shipped via ${data.carrier}. Tracking ID: ${data.trackingId}. Track at ${baseUrl}/orders/${data.orderId}`,
          templateVariables: data
        }

      case 'seller_new_order':
        return {
          subject: `New Order Received - ${data.orderNumber}`,
          htmlContent: `<!-- Seller new order email will be rendered by React component -->`,
          textContent: `You have a new order ${data.orderNumber} worth ₹${data.amount} from ${data.customerName}. Process at ${baseUrl}/seller/orders/${data.orderId}`,
          templateVariables: data
        }

      case 'payment_failed':
        return {
          subject: `Payment Failed - Action Required`,
          htmlContent: this.createSimpleEmailHTML(
            'Payment Failed',
            `Your payment for order ${data.orderNumber} could not be processed. Please update your payment method and try again.`,
            `${baseUrl}/orders/${data.orderId}/payment`,
            'Retry Payment'
          ),
          textContent: `Payment failed for order ${data.orderNumber}. Retry at ${baseUrl}/orders/${data.orderId}/payment`,
          templateVariables: data
        }

      case 'wishlist_back_in_stock':
        return {
          subject: `Back in Stock - ${data.productName}`,
          htmlContent: this.createSimpleEmailHTML(
            'Back in Stock! 🎉',
            `Great news! ${data.productName} from your wishlist is now available. Get it before it's gone again!`,
            `${baseUrl}/products/${data.productSlug}`,
            'Buy Now'
          ),
          textContent: `${data.productName} is back in stock! Buy now at ${baseUrl}/products/${data.productSlug}`,
          templateVariables: data
        }

      default:
        return {
          subject: data.subject || 'Notification from Findora',
          htmlContent: this.createSimpleEmailHTML(
            data.title || 'Notification',
            data.message,
            data.actionUrl,
            data.actionLabel
          ),
          textContent: data.message,
          templateVariables: data
        }
    }
  }

  /**
   * Create push notification payload
   */
  createPushPayload(type: NotificationType, data: Record<string, any>): PushNotificationPayload {
    const template = this.createNotificationTemplate(type, data)
    
    return {
      title: template.title,
      body: template.message,
      icon: '/favicon-192x192.png',
      badge: '/favicon-192x192.png',
      data: {
        type,
        actionUrl: template.actionUrl,
        ...data
      },
      actions: template.actionUrl ? [{
        action: 'view',
        title: template.actionLabel || 'View',
        icon: '/favicon-192x192.png'
      }] : undefined,
      tag: type,
      requireInteraction: ['payment_failed', 'security_alert'].includes(type)
    }
  }

  /**
   * Register push subscription
   */
  async registerPushSubscription(
    userId: string,
    subscription: PushSubscription
  ): Promise<boolean> {
    console.log(`Registering push subscription for user ${userId}`)
    // TODO: Store subscription in database
    return true
  }

  /**
   * Unregister push subscription
   */
  async unregisterPushSubscription(
    userId: string,
    endpoint: string
  ): Promise<boolean> {
    console.log(`Unregistering push subscription for user ${userId}`)
    // TODO: Remove subscription from database
    return true
  }

  /**
   * Send notification to channel
   */
  private async sendToChannel(notification: Notification, channel: NotificationChannel): Promise<boolean> {
    try {
      switch (channel) {
        case 'in_app':
          return await this.storeNotification(notification)

        case 'email':
          const emailTemplate = this.createEmailTemplate(notification.type, notification.data || {})
          return await this.sendEmail(
            notification.data?.email || '',
            emailTemplate,
            notification.priority
          )

        case 'push':
          const pushPayload = this.createPushPayload(notification.type, notification.data || {})
          return await this.sendPushNotification(notification.userId, pushPayload)

        case 'sms':
          return await this.sendSMS(
            notification.data?.phone || '',
            notification.message,
            notification.priority
          )

        default:
          console.warn(`Unsupported notification channel: ${channel}`)
          return false
      }
    } catch (error) {
      console.error(`Failed to send notification via ${channel}:`, error)
      return false
    }
  }

  /**
   * Store notification in database
   */
  private async storeNotification(notification: Notification): Promise<boolean> {
    console.log(`Storing notification:`, {
      id: notification.id,
      userId: notification.userId,
      type: notification.type,
      title: notification.title
    })
    // TODO: Implement actual database storage
    return true
  }

  /**
   * Check if channel is enabled in global settings
   */
  private isChannelEnabled(channel: NotificationChannel, settings: NotificationPreferences['globalSettings']): boolean {
    switch (channel) {
      case 'email': return settings.emailEnabled
      case 'push': return settings.pushEnabled
      case 'sms': return settings.smsEnabled
      case 'in_app': return true // Always enabled
      default: return false
    }
  }

  /**
   * Check if current time is in do not disturb period
   */
  private isDoNotDisturbTime(settings: NotificationPreferences['globalSettings']): boolean {
    if (!settings.doNotDisturbStart || !settings.doNotDisturbEnd) return false

    const now = new Date()
    const currentTime = now.getHours() * 60 + now.getMinutes()
    
    const [startHour, startMin] = settings.doNotDisturbStart.split(':').map(Number)
    const [endHour, endMin] = settings.doNotDisturbEnd.split(':').map(Number)
    
    const startTime = startHour * 60 + startMin
    const endTime = endHour * 60 + endMin

    if (startTime <= endTime) {
      return currentTime >= startTime && currentTime <= endTime
    } else {
      // Crosses midnight
      return currentTime >= startTime || currentTime <= endTime
    }
  }

  /**
   * Generate unique notification ID
   */
  private generateNotificationId(): string {
    return `notif_${Date.now()}_${Math.random().toString(36).substring(2)}`
  }

  /**
   * Create simple HTML email template
   */
  private createSimpleEmailHTML(
    title: string,
    message: string,
    actionUrl?: string,
    actionLabel?: string
  ): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${title} - Findora</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f8fafc; margin: 0; padding: 20px;">
          <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="background-color: #3b82f6; color: white; padding: 20px; text-align: center;">
              <h1 style="margin: 0; font-size: 24px;">Findora</h1>
            </div>
            <div style="padding: 30px;">
              <h2 style="color: #1e293b; margin-bottom: 16px;">${title}</h2>
              <p style="margin-bottom: 24px; font-size: 16px;">${message}</p>
              ${actionUrl ? `
                <div style="text-align: center; margin: 32px 0;">
                  <a href="${actionUrl}" style="
                    display: inline-block;
                    background-color: #3b82f6;
                    color: white;
                    padding: 12px 24px;
                    border-radius: 6px;
                    text-decoration: none;
                    font-weight: 500;
                  ">${actionLabel || 'Take Action'}</a>
                </div>
              ` : ''}
            </div>
            <div style="background-color: #f1f5f9; padding: 20px; text-align: center; color: #64748b; font-size: 14px;">
              <p>© 2024 Findora. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `
  }

  /**
   * Generate mock notifications for development
   */
  private generateMockNotifications(userId: string): Notification[] {
    const types: NotificationType[] = [
      'order_confirmation',
      'order_shipped',
      'seller_new_order',
      'wishlist_back_in_stock',
      'price_drop'
    ]

    return Array.from({ length: 15 }, (_, i) => {
      const type = types[Math.floor(Math.random() * types.length)]
      const template = this.createNotificationTemplate(type, {
        orderNumber: `ORD${String(i + 1).padStart(6, '0')}`,
        amount: Math.floor(Math.random() * 5000) + 500,
        productName: ['Premium Headphones', 'Smart Watch', 'Laptop'][Math.floor(Math.random() * 3)]
      })

      return {
        id: `notif_${i + 1}`,
        userId,
        type,
        title: template.title,
        message: template.message,
        priority: Math.random() > 0.8 ? 'high' : 'medium',
        channels: ['in_app', 'email'],
        isRead: Math.random() > 0.3,
        isDelivered: true,
        createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
        actionUrl: template.actionUrl,
        actionLabel: template.actionLabel
      }
    }).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  }
}

// Export singleton instance
export const notificationService = new NotificationService()
export default notificationService