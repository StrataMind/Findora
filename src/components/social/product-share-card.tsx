'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import html2canvas from 'html2canvas'
import {
  Download,
  Image as ImageIcon,
  Palette,
  Type,
  Star,
  TrendingUp,
  Zap,
  Gift,
  Crown,
  Heart,
  Share2,
  Copy,
  Smartphone
} from 'lucide-react'
import { toast } from 'sonner'

interface Product {
  id: string
  name: string
  price: number
  originalPrice?: number
  rating: number
  reviewCount: number
  image: string
  seller: string
  discount?: number
  badges?: string[]
  category: string
}

interface ProductShareCardProps {
  product: Product
  customText?: string
  referralCode?: string
  brandLogo?: string
  onShare?: (format: string, method: string) => void
}

const cardThemes = [
  {
    id: 'modern',
    name: 'Modern',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    textColor: 'white'
  },
  {
    id: 'minimal',
    name: 'Minimal',
    background: '#ffffff',
    textColor: '#1f2937',
    border: '2px solid #e5e7eb'
  },
  {
    id: 'vibrant',
    name: 'Vibrant',
    background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    textColor: 'white'
  },
  {
    id: 'elegant',
    name: 'Elegant',
    background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    textColor: 'white'
  },
  {
    id: 'warm',
    name: 'Warm',
    background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    textColor: 'white'
  },
  {
    id: 'dark',
    name: 'Dark',
    background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
    textColor: 'white'
  }
]

const cardSizes = [
  { id: 'square', name: 'Square (1:1)', width: 500, height: 500, platform: 'Instagram' },
  { id: 'story', name: 'Story (9:16)', width: 500, height: 888, platform: 'Instagram/Facebook' },
  { id: 'landscape', name: 'Landscape (16:9)', width: 800, height: 450, platform: 'Facebook/Twitter' },
  { id: 'portrait', name: 'Portrait (4:5)', width: 500, height: 625, platform: 'Pinterest' }
]

export default function ProductShareCard({ 
  product, 
  customText, 
  referralCode, 
  brandLogo,
  onShare 
}: ProductShareCardProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedTheme, setSelectedTheme] = useState(cardThemes[0])
  const [selectedSize, setSelectedSize] = useState(cardSizes[0])
  const [customMessage, setCustomMessage] = useState(customText || `Check out this amazing ${product.name}!`)
  const [showBrandLogo, setShowBrandLogo] = useState(true)
  const [showPrice, setShowPrice] = useState(true)
  const [showRating, setShowRating] = useState(true)
  const [showDiscount, setShowDiscount] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  const formatPrice = (price: number) => {
    return `₹${price.toLocaleString()}`
  }

  const calculateDiscount = () => {
    if (!product.originalPrice || product.originalPrice <= product.price) return 0
    return Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
  }

  const generateShareCard = async (format: 'png' | 'jpg' = 'png') => {
    if (!cardRef.current) return

    setIsGenerating(true)
    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: null,
        scale: 2,
        logging: false,
        useCORS: true,
        allowTaint: true,
        width: selectedSize.width,
        height: selectedSize.height
      })

      const dataURL = canvas.toDataURL(`image/${format}`, 0.9)
      
      // Create download link
      const link = document.createElement('a')
      link.download = `${product.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_share_card.${format}`
      link.href = dataURL
      link.click()

      onShare?.(format, 'download')
      toast.success(`Share card downloaded as ${format.toUpperCase()}`)
    } catch (error) {
      console.error('Failed to generate share card:', error)
      toast.error('Failed to generate share card')
    } finally {
      setIsGenerating(false)
    }
  }

  const copyToClipboard = async () => {
    if (!cardRef.current) return

    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: null,
        scale: 2,
        logging: false
      })

      canvas.toBlob(async (blob) => {
        if (blob) {
          try {
            await navigator.clipboard.write([
              new ClipboardItem({ 'image/png': blob })
            ])
            onShare?.('png', 'clipboard')
            toast.success('Share card copied to clipboard!')
          } catch (error) {
            console.error('Failed to copy to clipboard:', error)
            toast.error('Failed to copy to clipboard')
          }
        }
      })
    } catch (error) {
      console.error('Failed to copy share card:', error)
      toast.error('Failed to copy share card')
    }
  }

  const shareToSocial = async (platform: string) => {
    await generateShareCard('jpg')
    
    let shareUrl = ''
    const text = `${customMessage} ${referralCode ? `Use code: ${referralCode}` : ''}`
    
    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/dialog/share?app_id=YOUR_APP_ID&href=${encodeURIComponent(window.location.href)}&quote=${encodeURIComponent(text)}`
        break
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(window.location.href)}`
        break
      case 'instagram':
        toast.info('Save the image and share it on Instagram!')
        return
    }

    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400')
      onShare?.('jpg', platform)
    }
  }

  const ShareCardPreview = () => (
    <div
      ref={cardRef}
      className="relative overflow-hidden rounded-lg shadow-2xl"
      style={{
        width: `${selectedSize.width}px`,
        height: `${selectedSize.height}px`,
        background: selectedTheme.background,
        color: selectedTheme.textColor,
        border: selectedTheme.border || 'none'
      }}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full -translate-y-16 translate-x-16" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full translate-y-12 -translate-x-12" />
      </div>

      {/* Main Content */}
      <div className="relative h-full flex flex-col p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          {showBrandLogo && (
            <div className="flex items-center space-x-2">
              {brandLogo ? (
                <img src={brandLogo} alt="Brand" className="w-8 h-8 rounded" />
              ) : (
                <div className="w-8 h-8 bg-white bg-opacity-20 rounded flex items-center justify-center">
                  <Crown className="w-4 h-4" />
                </div>
              )}
              <span className="font-bold text-lg">Findora</span>
            </div>
          )}
          
          {product.badges && product.badges.length > 0 && (
            <div className="flex space-x-1">
              {product.badges.slice(0, 2).map((badge, index) => (
                <Badge key={index} variant="secondary" className="text-xs bg-white bg-opacity-20">
                  {badge}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Product Image */}
        <div className="flex-1 flex items-center justify-center mb-4">
          <div className="relative">
            <img
              src={product.image}
              alt={product.name}
              className="w-48 h-48 object-cover rounded-lg shadow-lg"
              style={{ maxWidth: selectedSize.width * 0.4 }}
            />
            
            {/* Floating Elements */}
            {showDiscount && calculateDiscount() > 0 && (
              <div className="absolute -top-2 -right-2 bg-red-500 text-white px-2 py-1 rounded-full text-sm font-bold">
                -{calculateDiscount()}%
              </div>
            )}
            
            {showRating && (
              <div className="absolute -bottom-2 -left-2 bg-white bg-opacity-90 rounded-full px-2 py-1 flex items-center space-x-1">
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                <span className="text-xs font-bold text-gray-900">{product.rating}</span>
              </div>
            )}
          </div>
        </div>

        {/* Product Info */}
        <div className="text-center space-y-2">
          <h3 className="font-bold text-xl leading-tight line-clamp-2">
            {product.name}
          </h3>
          
          <div className="text-sm opacity-80">
            by {product.seller}
          </div>
          
          {showPrice && (
            <div className="space-y-1">
              <div className="text-2xl font-bold">
                {formatPrice(product.price)}
              </div>
              {product.originalPrice && product.originalPrice > product.price && (
                <div className="text-sm line-through opacity-60">
                  {formatPrice(product.originalPrice)}
                </div>
              )}
            </div>
          )}
          
          {customMessage && (
            <div className="text-sm italic bg-white bg-opacity-20 rounded-lg p-2 mt-3">
              "{customMessage}"
            </div>
          )}
          
          {referralCode && (
            <div className="text-xs font-mono bg-white bg-opacity-20 rounded px-2 py-1 inline-block mt-2">
              Code: {referralCode}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-4 pt-4 border-t border-white border-opacity-20 text-center">
          <div className="text-xs opacity-60">
            Visit findora.com to shop now
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-4 right-4 opacity-20">
        <Heart className="w-6 h-6" />
      </div>
      <div className="absolute bottom-4 left-4 opacity-20">
        <Zap className="w-5 h-5" />
      </div>
    </div>
  )

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="space-x-2">
          <ImageIcon className="w-4 h-4" />
          <span>Create Share Card</span>
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <ImageIcon className="w-5 h-5 mr-2" />
            Create Social Share Card
          </DialogTitle>
          <DialogDescription>
            Design a beautiful card to share {product.name} on social media
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Controls */}
          <div className="space-y-6">
            {/* Size Selection */}
            <div>
              <Label className="text-sm font-semibold">Card Size</Label>
              <Select 
                value={selectedSize.id} 
                onValueChange={(value) => {
                  const size = cardSizes.find(s => s.id === value)
                  if (size) setSelectedSize(size)
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {cardSizes.map((size) => (
                    <SelectItem key={size.id} value={size.id}>
                      <div className="flex items-center justify-between w-full">
                        <span>{size.name}</span>
                        <Badge variant="secondary" className="ml-2 text-xs">
                          {size.platform}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Theme Selection */}
            <div>
              <Label className="text-sm font-semibold">Theme</Label>
              <div className="grid grid-cols-3 gap-2 mt-2">
                {cardThemes.map((theme) => (
                  <button
                    key={theme.id}
                    onClick={() => setSelectedTheme(theme)}
                    className={`p-3 rounded-lg border-2 text-xs font-medium transition-all ${
                      selectedTheme.id === theme.id 
                        ? 'border-blue-500 ring-2 ring-blue-200' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    style={{ 
                      background: theme.background,
                      color: theme.textColor
                    }}
                  >
                    {theme.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Message */}
            <div>
              <Label htmlFor="customMessage" className="text-sm font-semibold">
                Custom Message
              </Label>
              <Input
                id="customMessage"
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                placeholder="Add your personal message..."
                className="mt-1"
              />
            </div>

            {/* Display Options */}
            <div>
              <Label className="text-sm font-semibold">Show/Hide Elements</Label>
              <div className="grid grid-cols-2 gap-3 mt-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="showPrice"
                    checked={showPrice}
                    onChange={(e) => setShowPrice(e.target.checked)}
                    className="rounded"
                  />
                  <label htmlFor="showPrice" className="text-sm">Price</label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="showRating"
                    checked={showRating}
                    onChange={(e) => setShowRating(e.target.checked)}
                    className="rounded"
                  />
                  <label htmlFor="showRating" className="text-sm">Rating</label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="showDiscount"
                    checked={showDiscount}
                    onChange={(e) => setShowDiscount(e.target.checked)}
                    className="rounded"
                  />
                  <label htmlFor="showDiscount" className="text-sm">Discount</label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="showBrandLogo"
                    checked={showBrandLogo}
                    onChange={(e) => setShowBrandLogo(e.target.checked)}
                    className="rounded"
                  />
                  <label htmlFor="showBrandLogo" className="text-sm">Brand Logo</label>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <Button
                  onClick={() => generateShareCard('png')}
                  disabled={isGenerating}
                  className="w-full"
                >
                  <Download className="w-4 h-4 mr-2" />
                  {isGenerating ? 'Generating...' : 'Download PNG'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => generateShareCard('jpg')}
                  disabled={isGenerating}
                  className="w-full"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download JPG
                </Button>
              </div>
              
              <Button
                variant="outline"
                onClick={copyToClipboard}
                className="w-full"
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy to Clipboard
              </Button>

              <div className="grid grid-cols-3 gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => shareToSocial('facebook')}
                  className="text-blue-600 border-blue-200"
                >
                  Facebook
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => shareToSocial('twitter')}
                  className="text-sky-600 border-sky-200"
                >
                  Twitter
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => shareToSocial('instagram')}
                  className="text-pink-600 border-pink-200"
                >
                  Instagram
                </Button>
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="flex items-center justify-center bg-gray-50 rounded-lg p-4">
            <div className="transform scale-75 origin-center">
              <ShareCardPreview />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export { ProductShareCard }
export default ProductShareCard