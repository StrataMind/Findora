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