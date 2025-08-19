'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  Share2,
  Copy,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  MessageCircle,
  Mail,
  Link,
  Check,
  Download,
  QrCode,
  Gift,
  TrendingUp
} from 'lucide-react'
import { toast } from 'sonner'

interface ShareData {
  url: string
  title: string
  description: string
  image?: string
  hashtags?: string[]
  via?: string
  price?: number
  currency?: string
  discount?: number
  referralCode?: string
}

interface ShareButtonsProps {
  shareData: ShareData
  variant?: 'default' | 'compact' | 'floating'
  showReferral?: boolean
  onShare?: (platform: string, referralUsed: boolean) => void
  className?: string
}

const socialPlatforms = [
  {
    id: 'facebook',
    name: 'Facebook',
    icon: Facebook,
    color: 'bg-blue-600 hover:bg-blue-700',
    description: 'Share with friends and family'
  },
  {
    id: 'twitter',
    name: 'Twitter',
    icon: Twitter,
    color: 'bg-sky-500 hover:bg-sky-600',
    description: 'Tweet to your followers'
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    icon: Linkedin,
    color: 'bg-blue-700 hover:bg-blue-800',
    description: 'Share with professional network'
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp',
    icon: MessageCircle,
    color: 'bg-green-600 hover:bg-green-700',
    description: 'Send to WhatsApp contacts'
  },
  {
    id: 'email',
    name: 'Email',
    icon: Mail,
    color: 'bg-gray-600 hover:bg-gray-700',
    description: 'Send via email'
  },
  {
    id: 'copy',
    name: 'Copy Link',
    icon: Copy,
    color: 'bg-gray-800 hover:bg-gray-900',
    description: 'Copy link to clipboard'
  }
]

export default function ShareButtons({ 
  shareData, 
  variant = 'default', 
  showReferral = false,
  onShare,
  className = '' 
}: ShareButtonsProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [customMessage, setCustomMessage] = useState('')
  const [includeReferral, setIncludeReferral] = useState(false)
  const [copied, setCopied] = useState(false)

  const generateShareUrl = (platform: string, useReferral: boolean = false) => {
    let baseUrl = shareData.url
    
    if (useReferral && shareData.referralCode) {
      const separator = shareData.url.includes('?') ? '&' : '?'
      baseUrl = `${shareData.url}${separator}ref=${shareData.referralCode}`
    }

    const encodedUrl = encodeURIComponent(baseUrl)
    const encodedTitle = encodeURIComponent(shareData.title)
    const encodedDescription = encodeURIComponent(shareData.description)
    const hashtags = shareData.hashtags ? shareData.hashtags.join(',') : 'findora,shopping,deals'

    switch (platform) {
      case 'facebook':
        return `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedTitle} - ${encodedDescription}`
      
      case 'twitter':
        const twitterText = `${shareData.title} - ${shareData.description}`
        const via = shareData.via || 'Findora'
        return `https://twitter.com/intent/tweet?text=${encodeURIComponent(twitterText)}&url=${encodedUrl}&hashtags=${hashtags}&via=${via}`
      
      case 'linkedin':
        return `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}&title=${encodedTitle}&summary=${encodedDescription}`
      
      case 'whatsapp':
        const whatsappText = `${shareData.title}\n\n${shareData.description}\n\n${baseUrl}`
        return `https://wa.me/?text=${encodeURIComponent(whatsappText)}`
      
      case 'email':
        const subject = `Check out: ${shareData.title}`
        const body = `Hi,\n\nI thought you might be interested in this:\n\n${shareData.title}\n${shareData.description}\n\n${baseUrl}\n\nBest regards`
        return `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
      
      default:
        return baseUrl
    }
  }

  const handleShare = async (platform: string) => {
    const useReferral = includeReferral && shareData.referralCode
    const shareUrl = generateShareUrl(platform, useReferral)

    try {
      if (platform === 'copy') {
        await navigator.clipboard.writeText(shareUrl)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
        toast.success('Link copied to clipboard!')
      } else if (platform === 'native' && navigator.share) {
        await navigator.share({
          title: shareData.title,
          text: shareData.description,
          url: shareData.url
        })
      } else {
        window.open(shareUrl, '_blank', 'width=600,height=400,scrollbars=yes,resizable=yes')
      }

      // Track share event
      onShare?.(platform, useReferral)
      
      // Close dialog after sharing
      if (platform !== 'copy') {
        setIsOpen(false)
      }

    } catch (error) {
      console.error('Share failed:', error)
      toast.error('Failed to share. Please try again.')
    }
  }

  const formatPrice = () => {
    if (!shareData.price) return ''
    const symbol = shareData.currency === 'USD' ? '$' : shareData.currency === 'EUR' ? '€' : '₹'
    return `${symbol}${shareData.price.toLocaleString()}`
  }

  const generateQRCode = () => {
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(shareData.url)}`
    return qrUrl
  }

  // Compact variant (just share icon)
  if (variant === 'compact') {
    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="sm" className={className}>
            <Share2 className="w-4 h-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Share this item</DialogTitle>
            <DialogDescription>Choose how you'd like to share</DialogDescription>
          </DialogHeader>
          <ShareContent />
        </DialogContent>
      </Dialog>
    )
  }

  // Floating variant
  if (variant === 'floating') {
    return (
      <div className={`fixed right-4 top-1/2 -translate-y-1/2 z-50 ${className}`}>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-full w-12 h-12 shadow-lg">
              <Share2 className="w-5 h-5" />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Share this item</DialogTitle>
              <DialogDescription>Choose how you'd like to share</DialogDescription>
            </DialogHeader>
            <ShareContent />
          </DialogContent>
        </Dialog>
      </div>
    )
  }

  const ShareContent = () => (
    <div className="space-y-6">
      {/* Product Preview */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            {shareData.image && (
              <img 
                src={shareData.image} 
                alt={shareData.title}
                className="w-16 h-16 object-cover rounded-lg"
              />
            )}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm truncate">{shareData.title}</h3>
              <p className="text-xs text-gray-600 line-clamp-2">{shareData.description}</p>
              {shareData.price && (
                <div className="flex items-center space-x-2 mt-1">
                  <span className="font-bold text-green-600">{formatPrice()}</span>
                  {shareData.discount && (
                    <Badge variant="destructive" className="text-xs">
                      {shareData.discount}% OFF
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Referral Options */}
      {showReferral && shareData.referralCode && (
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border">
          <div className="flex items-center space-x-2 mb-2">
            <Gift className="w-4 h-4 text-purple-600" />
            <h4 className="font-semibold text-purple-900">Earn Rewards</h4>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="referral"
              checked={includeReferral}
              onChange={(e) => setIncludeReferral(e.target.checked)}
              className="rounded"
            />
            <label htmlFor="referral" className="text-sm text-purple-800">
              Include my referral code and earn rewards when friends purchase
            </label>
          </div>
          {includeReferral && (
            <div className="mt-2 p-2 bg-white rounded border">
              <span className="text-xs text-gray-600">Referral Code: </span>
              <code className="text-xs font-mono font-bold">{shareData.referralCode}</code>
            </div>
          )}
        </div>
      )}

      {/* Share Platforms */}
      <div className="grid grid-cols-2 gap-3">
        {socialPlatforms.map((platform) => {
          const Icon = platform.icon
          return (
            <Button
              key={platform.id}
              variant="outline"
              className={`flex items-center justify-center space-x-2 p-3 h-auto ${
                platform.id === 'copy' && copied ? 'bg-green-50 border-green-300' : ''
              }`}
              onClick={() => handleShare(platform.id)}
            >
              {platform.id === 'copy' && copied ? (
                <Check className="w-4 h-4 text-green-600" />
              ) : (
                <Icon className="w-4 h-4" />
              )}
              <span className="text-sm font-medium">
                {platform.id === 'copy' && copied ? 'Copied!' : platform.name}
              </span>
            </Button>
          )
        })}
      </div>

      {/* Native Share (if available) */}
      {navigator.share && (
        <Button
          variant="outline"
          className="w-full"
          onClick={() => handleShare('native')}
        >
          <Share2 className="w-4 h-4 mr-2" />
          More Options
        </Button>
      )}

      {/* Advanced Options */}
      <details className="text-sm">
        <summary className="cursor-pointer font-medium text-gray-700 hover:text-gray-900">
          Advanced Options
        </summary>
        <div className="mt-3 space-y-3">
          {/* Custom Message */}
          <div>
            <Label htmlFor="message" className="text-xs">Custom Message (Optional)</Label>
            <Textarea
              id="message"
              placeholder="Add your personal message..."
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              rows={2}
              className="text-xs"
            />
          </div>

          {/* QR Code */}
          <div className="text-center">
            <p className="text-xs text-gray-600 mb-2">Share via QR Code</p>
            <img 
              src={generateQRCode()} 
              alt="QR Code" 
              className="w-24 h-24 mx-auto border rounded"
            />
            <Button
              variant="ghost"
              size="sm"
              className="mt-1 text-xs"
              onClick={() => {
                const link = document.createElement('a')
                link.href = generateQRCode()
                link.download = `${shareData.title}-qr.png`
                link.click()
              }}
            >
              <Download className="w-3 h-3 mr-1" />
              Download QR
            </Button>
          </div>

          {/* Direct Link */}
          <div>
            <Label htmlFor="directLink" className="text-xs">Direct Link</Label>
            <div className="flex space-x-1">
              <Input
                id="directLink"
                value={generateShareUrl('copy', includeReferral)}
                readOnly
                className="text-xs"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleShare('copy')}
              >
                <Copy className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </div>
      </details>
    </div>
  )

  // Default variant (full dialog)
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className={className}>
          <Share2 className="w-4 h-4 mr-2" />
          Share
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Share2 className="w-5 h-5 mr-2" />
            Share this item
          </DialogTitle>
          <DialogDescription>
            Share with friends and earn rewards
          </DialogDescription>
        </DialogHeader>
        <ShareContent />
      </DialogContent>
    </Dialog>
  )
}

// Quick Share Buttons (for product pages)
export function QuickShareButtons({ shareData, onShare, className = '' }: ShareButtonsProps) {
  const quickPlatforms = ['facebook', 'twitter', 'whatsapp', 'copy']
  
  const handleQuickShare = async (platform: string) => {
    const shareUrl = shareData.url
    let targetUrl = ''

    switch (platform) {
      case 'facebook':
        targetUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`
        break
      case 'twitter':
        targetUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareData.title)}`
        break
      case 'whatsapp':
        targetUrl = `https://wa.me/?text=${encodeURIComponent(`${shareData.title} - ${shareUrl}`)}`
        break
      case 'copy':
        try {
          await navigator.clipboard.writeText(shareUrl)
          toast.success('Link copied!')
          onShare?.(platform, false)
          return
        } catch (error) {
          toast.error('Failed to copy link')
          return
        }
    }

    if (targetUrl) {
      window.open(targetUrl, '_blank', 'width=600,height=400')
      onShare?.(platform, false)
    }
  }

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {quickPlatforms.map((platform) => {
        const platformData = socialPlatforms.find(p => p.id === platform)
        if (!platformData) return null
        
        const Icon = platformData.icon
        return (
          <Button
            key={platform}
            variant="ghost"
            size="sm"
            onClick={() => handleQuickShare(platform)}
            className="hover:bg-gray-100 rounded-full w-8 h-8 p-0"
            title={`Share on ${platformData.name}`}
          >
            <Icon className="w-4 h-4" />
          </Button>
        )
      })}
    </div>
  )
}

export { ShareButtons }
export default ShareButtons