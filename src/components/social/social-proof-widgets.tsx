'use client'

import { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  Eye,
  ShoppingCart,
  Users,
  TrendingUp,
  Fire,
  Star,
  Clock,
  MapPin,
  CheckCircle,
  Zap,
  Crown,
  Heart,
  Timer,
  AlertCircle
} from 'lucide-react'
import { formatDistance } from 'date-fns'

interface ViewerData {
  currentViewers: number
  totalViews: number
  peakViewers: number
  timeframe: string
}

interface PurchaseData {
  customerName: string
  location: string
  productName: string
  timeAgo: string
  verified: boolean
}

interface TrendingData {
  istrending: boolean
  trendScore: number
  rank: number
  category: string
  timeframe: string
}

interface SocialProofData {
  viewers: ViewerData
  recentPurchases: PurchaseData[]
  trending: TrendingData
  stockLevel: number
  ratingData: {
    averageRating: number
    totalReviews: number
    recentRating: number
  }
  urgencyData: {
    limitedStock: boolean
    timeLeft?: Date
    saleEndTime?: Date
    flashSale: boolean
  }
}

// Live Viewers Widget
export function LiveViewersWidget({ data, className = '' }: { data: ViewerData; className?: string }) {
  const [currentCount, setCurrentCount] = useState(data.currentViewers)
  
  useEffect(() => {
    // Simulate real-time viewer count changes
    const interval = setInterval(() => {
      const change = Math.floor(Math.random() * 3) - 1 // -1, 0, or 1
      setCurrentCount(prev => Math.max(1, Math.min(prev + change, data.peakViewers)))
    }, 5000 + Math.random() * 10000) // Random interval between 5-15 seconds

    return () => clearInterval(interval)
  }, [data.peakViewers])

  return (
    <div className={`flex items-center space-x-2 bg-blue-50 text-blue-800 px-3 py-2 rounded-lg border border-blue-200 ${className}`}>
      <div className="flex items-center space-x-1">
        <Eye className="w-4 h-4" />
        <span className="font-medium">{currentCount}</span>
      </div>
      <span className="text-sm">
        {currentCount === 1 ? 'person is' : 'people are'} viewing this
      </span>
      {currentCount >= 10 && (
        <Badge variant="destructive" className="text-xs animate-pulse">
          Popular
        </Badge>
      )}
    </div>
  )
}

// Recent Purchases Widget
export function RecentPurchasesWidget({ data, className = '' }: { data: PurchaseData[]; className?: string }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (data.length === 0) return

    const showNotification = () => {
      setIsVisible(true)
      setTimeout(() => setIsVisible(false), 4000) // Show for 4 seconds
    }

    const rotateNotifications = () => {
      setCurrentIndex(prev => (prev + 1) % data.length)
      showNotification()
    }

    // Show first notification immediately
    showNotification()
    
    // Then rotate every 8-12 seconds
    const interval = setInterval(rotateNotifications, 8000 + Math.random() * 4000)
    return () => clearInterval(interval)
  }, [data])

  if (!data.length || !isVisible) return null

  const purchase = data[currentIndex]

  return (
    <div className={`fixed bottom-4 left-4 z-50 ${className}`}>
      <Card className="bg-white shadow-lg border-l-4 border-l-green-500 animate-slide-up">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-4 h-4 text-green-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-sm">{purchase.customerName}</span>
                {purchase.verified && (
                  <Badge variant="outline" className="text-xs">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Verified
                  </Badge>
                )}
              </div>
              <p className="text-xs text-gray-600">
                from {purchase.location}
              </p>
              <p className="text-sm font-medium text-gray-900 mt-1">
                purchased {purchase.productName}
              </p>
              <div className="flex items-center space-x-1 text-xs text-gray-500 mt-1">
                <Clock className="w-3 h-3" />
                <span>{purchase.timeAgo}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Trending Badge Widget
export function TrendingBadgeWidget({ data, className = '' }: { data: TrendingData; className?: string }) {
  if (!data.istrending) return null

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white animate-pulse">
        <Fire className="w-3 h-3 mr-1" />
        Trending #{data.rank}
      </Badge>
      {data.trendScore > 80 && (
        <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
          <Crown className="w-3 h-3 mr-1" />
          Hot
        </Badge>
      )}
    </div>
  )
}

// Stock Level Widget
export function StockLevelWidget({ stockLevel, className = '' }: { stockLevel: number; className?: string }) {
  const getStockStatus = () => {
    if (stockLevel <= 5) return { color: 'red', label: 'Almost Gone', urgent: true }
    if (stockLevel <= 10) return { color: 'orange', label: 'Low Stock', urgent: false }
    if (stockLevel <= 20) return { color: 'yellow', label: 'Limited Stock', urgent: false }
    return { color: 'green', label: 'In Stock', urgent: false }
  }

  const status = getStockStatus()

  return (
    <div className={`flex items-center justify-between p-3 rounded-lg border ${className}`}>
      <div className="flex items-center space-x-2">
        <div className={`w-2 h-2 rounded-full bg-${status.color}-500 ${status.urgent ? 'animate-pulse' : ''}`} />
        <span className="text-sm font-medium">{status.label}</span>
      </div>
      <div className="flex items-center space-x-1">
        <Package className="w-4 h-4 text-gray-500" />
        <span className="text-sm font-bold">{stockLevel} left</span>
      </div>
    </div>
  )
}

// Rating Showcase Widget
export function RatingShowcaseWidget({ data, className = '' }: { 
  data: { averageRating: number; totalReviews: number; recentRating: number }
  className?: string 
}) {
  return (
    <div className={`flex items-center space-x-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200 ${className}`}>
      <div className="flex items-center space-x-1">
        {Array.from({ length: 5 }, (_, i) => (
          <Star
            key={i}
            className={`w-4 h-4 ${
              i < Math.floor(data.averageRating)
                ? 'fill-yellow-400 text-yellow-400'
                : i < data.averageRating
                ? 'fill-yellow-200 text-yellow-400'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
      <div className="flex items-center space-x-2">
        <span className="font-bold text-lg">{data.averageRating.toFixed(1)}</span>
        <span className="text-sm text-gray-600">
          ({data.totalReviews.toLocaleString()} reviews)
        </span>
      </div>
      {data.recentRating >= 4.5 && (
        <Badge className="bg-green-100 text-green-800">
          Recently Loved
        </Badge>
      )}
    </div>
  )
}

// Urgency Timer Widget
export function UrgencyTimerWidget({ data, className = '' }: { 
  data: { timeLeft?: Date; saleEndTime?: Date; flashSale: boolean; limitedStock: boolean }
  className?: string 
}) {
  const [timeLeft, setTimeLeft] = useState<string>('')
  const [isUrgent, setIsUrgent] = useState(false)

  useEffect(() => {
    if (!data.timeLeft && !data.saleEndTime) return

    const targetTime = data.timeLeft || data.saleEndTime!
    
    const updateTimer = () => {
      const now = new Date().getTime()
      const distance = targetTime.getTime() - now

      if (distance > 0) {
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
        const seconds = Math.floor((distance % (1000 * 60)) / 1000)
        
        setTimeLeft(`${hours}h ${minutes}m ${seconds}s`)
        setIsUrgent(distance < 3600000) // Less than 1 hour
      } else {
        setTimeLeft('Expired')
      }
    }

    updateTimer()
    const interval = setInterval(updateTimer, 1000)
    return () => clearInterval(interval)
  }, [data.timeLeft, data.saleEndTime])

  if (!timeLeft || timeLeft === 'Expired') return null

  return (
    <div className={`p-3 rounded-lg border ${
      data.flashSale 
        ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white' 
        : 'bg-orange-50 border-orange-200 text-orange-900'
    } ${isUrgent ? 'animate-pulse' : ''} ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Timer className="w-4 h-4" />
          <span className="font-semibold text-sm">
            {data.flashSale ? 'Flash Sale Ends' : 'Limited Time'}
          </span>
        </div>
        <div className="font-mono font-bold">
          {timeLeft}
        </div>
      </div>
      {data.limitedStock && (
        <div className="flex items-center space-x-1 mt-2">
          <AlertCircle className="w-3 h-3" />
          <span className="text-xs">Limited stock available</span>
        </div>
      )}
    </div>
  )
}

// Visitor Counter Widget
export function VisitorCounterWidget({ data, className = '' }: { data: ViewerData; className?: string }) {
  return (
    <div className={`flex items-center space-x-2 text-sm text-gray-600 ${className}`}>
      <Users className="w-4 h-4" />
      <span>{data.totalViews.toLocaleString()} people viewed this {data.timeframe}</span>
      {data.currentViewers > data.totalViews * 0.1 && (
        <Badge variant="secondary" className="text-xs">
          High Interest
        </Badge>
      )}
    </div>
  )
}

// Social Activity Feed
export function SocialActivityFeed({ activities, className = '' }: { 
  activities: Array<{
    type: 'purchase' | 'review' | 'wishlist' | 'share'
    user: string
    action: string
    timeAgo: string
    location?: string
  }>
  className?: string 
}) {
  const [visibleActivities, setVisibleActivities] = useState(3)

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'purchase': return <ShoppingCart className="w-4 h-4 text-green-600" />
      case 'review': return <Star className="w-4 h-4 text-yellow-600" />
      case 'wishlist': return <Heart className="w-4 h-4 text-red-600" />
      case 'share': return <Share2 className="w-4 h-4 text-blue-600" />
      default: return <CheckCircle className="w-4 h-4 text-gray-600" />
    }
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <h4 className="font-semibold text-sm text-gray-900 flex items-center">
        <TrendingUp className="w-4 h-4 mr-2" />
        Recent Activity
      </h4>
      <div className="space-y-2">
        {activities.slice(0, visibleActivities).map((activity, index) => (
          <div key={index} className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg">
            {getActivityIcon(activity.type)}
            <div className="flex-1 text-sm">
              <span className="font-medium">{activity.user}</span>
              <span className="text-gray-600"> {activity.action}</span>
              {activity.location && (
                <span className="text-gray-500"> from {activity.location}</span>
              )}
            </div>
            <span className="text-xs text-gray-500">{activity.timeAgo}</span>
          </div>
        ))}
      </div>
      {activities.length > visibleActivities && (
        <button
          onClick={() => setVisibleActivities(prev => prev + 3)}
          className="text-xs text-blue-600 hover:text-blue-800 font-medium"
        >
          Show more activity
        </button>
      )}
    </div>
  )
}

// Comprehensive Social Proof Container
export function SocialProofContainer({ data, className = '' }: { 
  data: SocialProofData
  className?: string 
}) {
  return (
    <div className={`space-y-4 ${className}`}>
      <LiveViewersWidget data={data.viewers} />
      <TrendingBadgeWidget data={data.trending} />
      <RatingShowcaseWidget data={data.ratingData} />
      <StockLevelWidget stockLevel={data.stockLevel} />
      <UrgencyTimerWidget data={data.urgencyData} />
      <VisitorCounterWidget data={data.viewers} />
    </div>
  )
}

// Social Proof Hook for easy integration
export function useSocialProof(productId: string) {
  const [data, setData] = useState<SocialProofData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate API call
    const mockData: SocialProofData = {
      viewers: {
        currentViewers: Math.floor(Math.random() * 25) + 5,
        totalViews: Math.floor(Math.random() * 1000) + 100,
        peakViewers: 45,
        timeframe: 'today'
      },
      recentPurchases: [
        {
          customerName: 'Rajesh K.',
          location: 'Mumbai, India',
          productName: 'Premium Headphones',
          timeAgo: '2 minutes ago',
          verified: true
        },
        {
          customerName: 'Priya S.',
          location: 'Delhi, India',
          productName: 'Smart Watch',
          timeAgo: '5 minutes ago',
          verified: true
        },
        {
          customerName: 'Amit R.',
          location: 'Bangalore, India',
          productName: 'Wireless Speaker',
          timeAgo: '8 minutes ago',
          verified: false
        }
      ],
      trending: {
        istrending: Math.random() > 0.3,
        trendScore: Math.floor(Math.random() * 100),
        rank: Math.floor(Math.random() * 10) + 1,
        category: 'Electronics',
        timeframe: 'this week'
      },
      stockLevel: Math.floor(Math.random() * 50) + 1,
      ratingData: {
        averageRating: 4.2 + Math.random() * 0.7,
        totalReviews: Math.floor(Math.random() * 500) + 50,
        recentRating: 4.5 + Math.random() * 0.5
      },
      urgencyData: {
        limitedStock: Math.random() > 0.5,
        timeLeft: Math.random() > 0.5 ? new Date(Date.now() + Math.random() * 24 * 60 * 60 * 1000) : undefined,
        flashSale: Math.random() > 0.7,
        saleEndTime: Math.random() > 0.3 ? new Date(Date.now() + Math.random() * 72 * 60 * 60 * 1000) : undefined
      }
    }

    setTimeout(() => {
      setData(mockData)
      setLoading(false)
    }, 1000)
  }, [productId])

  return { data, loading }
}

export {
  LiveViewersWidget,
  RecentPurchasesWidget,
  TrendingBadgeWidget,
  StockLevelWidget,
  RatingShowcaseWidget,
  UrgencyTimerWidget,
  VisitorCounterWidget,
  SocialActivityFeed,
  SocialProofContainer
}

export default SocialProofContainer