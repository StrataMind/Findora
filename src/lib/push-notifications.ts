/**
 * Push Notification Support Framework
 * 
 * This module provides browser push notification functionality
 * with service worker integration and FCM support.
 */

export interface PushSubscriptionData {
  endpoint: string
  keys: {
    p256dh: string
    auth: string
  }
}

export interface NotificationOptions {
  title: string
  body: string
  icon?: string
  badge?: string
  image?: string
  data?: any
  actions?: {
    action: string
    title: string
    icon?: string
  }[]
  tag?: string
  renotify?: boolean
  requireInteraction?: boolean
  silent?: boolean
  timestamp?: number
  vibrate?: number[]
}

class PushNotificationManager {
  private vapidPublicKey: string = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ''
  private serviceWorkerRegistration: ServiceWorkerRegistration | null = null

  /**
   * Check if push notifications are supported
   */
  isSupported(): boolean {
    return (
      'serviceWorker' in navigator &&
      'PushManager' in window &&
      'Notification' in window
    )
  }

  /**
   * Check current notification permission
   */
  getPermissionStatus(): NotificationPermission {
    return Notification.permission
  }

  /**
   * Request notification permission
   */
  async requestPermission(): Promise<NotificationPermission> {
    if (!this.isSupported()) {
      throw new Error('Push notifications are not supported in this browser')
    }

    const permission = await Notification.requestPermission()
    
    if (permission === 'granted') {
      console.log('Push notification permission granted')
    } else if (permission === 'denied') {
      console.warn('Push notification permission denied')
    } else {
      console.log('Push notification permission dismissed')
    }

    return permission
  }

  /**
   * Register service worker
   */
  async registerServiceWorker(): Promise<ServiceWorkerRegistration> {
    if (!this.isSupported()) {
      throw new Error('Service workers are not supported')
    }

    try {
      this.serviceWorkerRegistration = await navigator.serviceWorker.register('/sw.js')
      console.log('Service worker registered successfully')
      return this.serviceWorkerRegistration
    } catch (error) {
      console.error('Service worker registration failed:', error)
      throw error
    }
  }

  /**
   * Get or create push subscription
   */
  async subscribeToPush(userId: string): Promise<PushSubscription | null> {
    if (!this.serviceWorkerRegistration) {
      this.serviceWorkerRegistration = await this.registerServiceWorker()
    }

    if (this.getPermissionStatus() !== 'granted') {
      const permission = await this.requestPermission()
      if (permission !== 'granted') {
        return null
      }
    }

    try {
      const subscription = await this.serviceWorkerRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(this.vapidPublicKey)
      })

      // Send subscription to server
      await this.sendSubscriptionToServer(subscription, userId)
      
      console.log('Push subscription successful:', subscription.endpoint)
      return subscription
    } catch (error) {
      console.error('Push subscription failed:', error)
      return null
    }
  }

  /**
   * Unsubscribe from push notifications
   */
  async unsubscribeFromPush(userId: string): Promise<boolean> {
    try {
      if (!this.serviceWorkerRegistration) {
        this.serviceWorkerRegistration = await navigator.serviceWorker.getRegistration()
      }

      if (!this.serviceWorkerRegistration) {
        return true // Already unsubscribed
      }

      const subscription = await this.serviceWorkerRegistration.pushManager.getSubscription()
      
      if (subscription) {
        await subscription.unsubscribe()
        await this.removeSubscriptionFromServer(subscription.endpoint, userId)
        console.log('Push unsubscription successful')
      }

      return true
    } catch (error) {
      console.error('Push unsubscription failed:', error)
      return false
    }
  }

  /**
   * Get current push subscription
   */
  async getCurrentSubscription(): Promise<PushSubscription | null> {
    if (!this.serviceWorkerRegistration) {
      this.serviceWorkerRegistration = await navigator.serviceWorker.getRegistration()
    }

    if (!this.serviceWorkerRegistration) {
      return null
    }

    return await this.serviceWorkerRegistration.pushManager.getSubscription()
  }

  /**
   * Show local notification
   */
  async showNotification(options: NotificationOptions): Promise<void> {
    if (!this.serviceWorkerRegistration) {
      // Fallback to browser notification
      if (this.getPermissionStatus() === 'granted') {
        new Notification(options.title, {
          body: options.body,
          icon: options.icon || '/favicon-192x192.png',
          badge: options.badge || '/favicon-192x192.png',
          image: options.image,
          data: options.data,
          tag: options.tag,
          renotify: options.renotify,
          requireInteraction: options.requireInteraction,
          silent: options.silent,
          timestamp: options.timestamp,
          vibrate: options.vibrate
        })
      }
      return
    }

    await this.serviceWorkerRegistration.showNotification(options.title, {
      body: options.body,
      icon: options.icon || '/favicon-192x192.png',
      badge: options.badge || '/favicon-192x192.png',
      image: options.image,
      data: options.data,
      actions: options.actions,
      tag: options.tag,
      renotify: options.renotify,
      requireInteraction: options.requireInteraction,
      silent: options.silent,
      timestamp: options.timestamp || Date.now(),
      vibrate: options.vibrate
    })
  }

  /**
   * Send subscription to server
   */
  private async sendSubscriptionToServer(subscription: PushSubscription, userId: string): Promise<void> {
    const subscriptionData: PushSubscriptionData = {
      endpoint: subscription.endpoint,
      keys: {
        p256dh: this.arrayBufferToBase64(subscription.getKey('p256dh')!),
        auth: this.arrayBufferToBase64(subscription.getKey('auth')!)
      }
    }

    const response = await fetch('/api/notifications/subscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userId,
        subscription: subscriptionData
      })
    })

    if (!response.ok) {
      throw new Error('Failed to send subscription to server')
    }
  }

  /**
   * Remove subscription from server
   */
  private async removeSubscriptionFromServer(endpoint: string, userId: string): Promise<void> {
    const response = await fetch('/api/notifications/unsubscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userId,
        endpoint
      })
    })

    if (!response.ok) {
      throw new Error('Failed to remove subscription from server')
    }
  }

  /**
   * Convert VAPID key to Uint8Array
   */
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4)
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/')

    const rawData = window.atob(base64)
    const outputArray = new Uint8Array(rawData.length)

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i)
    }
    return outputArray
  }

  /**
   * Convert ArrayBuffer to base64
   */
  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer)
    let binary = ''
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i])
    }
    return window.btoa(binary)
  }
}

// Service Worker Code Generator
export const generateServiceWorkerCode = (): string => {
  return `
// Findora Push Notification Service Worker
const CACHE_NAME = 'findora-notifications-v1'

self.addEventListener('install', (event) => {
  console.log('Service worker installing...')
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  console.log('Service worker activating...')
  event.waitUntil(self.clients.claim())
})

self.addEventListener('push', (event) => {
  console.log('Push event received:', event)

  if (!event.data) {
    console.log('Push event had no data')
    return
  }

  let data
  try {
    data = event.data.json()
  } catch (e) {
    console.error('Failed to parse push data:', e)
    data = {
      title: 'Findora',
      body: event.data.text() || 'You have a new notification',
      icon: '/favicon-192x192.png'
    }
  }

  const options = {
    body: data.body,
    icon: data.icon || '/favicon-192x192.png',
    badge: data.badge || '/favicon-192x192.png',
    image: data.image,
    data: data.data,
    actions: data.actions,
    tag: data.tag,
    renotify: data.renotify || false,
    requireInteraction: data.requireInteraction || false,
    silent: data.silent || false,
    timestamp: data.timestamp || Date.now(),
    vibrate: data.vibrate
  }

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  )
})

self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event)
  
  event.notification.close()

  const data = event.notification.data || {}
  let urlToOpen = data.actionUrl || '/'

  // Handle action clicks
  if (event.action) {
    switch (event.action) {
      case 'view':
        urlToOpen = data.actionUrl || '/'
        break
      case 'dismiss':
        return // Just close the notification
      default:
        urlToOpen = data.actionUrl || '/'
    }
  }

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Try to focus existing window
      for (const client of clientList) {
        if (client.url.includes(new URL(urlToOpen).pathname) && 'focus' in client) {
          return client.focus()
        }
      }
      
      // Open new window if no existing window found
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen)
      }
    })
  )
})

self.addEventListener('notificationclose', (event) => {
  console.log('Notification closed:', event.notification.tag)
  
  // Track notification close events
  const data = event.notification.data || {}
  if (data.trackClose) {
    fetch('/api/notifications/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'close',
        notificationId: data.id,
        timestamp: Date.now()
      })
    }).catch(console.error)
  }
})

// Background sync for offline notifications
self.addEventListener('sync', (event) => {
  if (event.tag === 'notification-sync') {
    event.waitUntil(syncNotifications())
  }
})

async function syncNotifications() {
  try {
    // Sync pending notifications when back online
    const response = await fetch('/api/notifications/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    })
    
    if (response.ok) {
      const pendingNotifications = await response.json()
      
      for (const notification of pendingNotifications) {
        await self.registration.showNotification(notification.title, notification.options)
      }
    }
  } catch (error) {
    console.error('Failed to sync notifications:', error)
  }
}
`
}

// Hook for React components
export const usePushNotifications = () => {
  const pushManager = new PushNotificationManager()

  return {
    isSupported: pushManager.isSupported(),
    getPermissionStatus: () => pushManager.getPermissionStatus(),
    requestPermission: () => pushManager.requestPermission(),
    subscribe: (userId: string) => pushManager.subscribeToPush(userId),
    unsubscribe: (userId: string) => pushManager.unsubscribeFromPush(userId),
    getCurrentSubscription: () => pushManager.getCurrentSubscription(),
    showNotification: (options: NotificationOptions) => pushManager.showNotification(options)
  }
}

// Export singleton instance
export const pushNotificationManager = new PushNotificationManager()
export default pushNotificationManager