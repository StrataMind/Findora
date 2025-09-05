'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import ShareButtons from '@/components/social/share-buttons'
import referralSystem, { ReferralStats, ReferralTier } from '@/lib/referral-system'
import {
  Gift,
  Copy,
  Users,
  DollarSign,
  TrendingUp,
  Eye,
  Share2,
  Crown,
  Star,
  Calendar,
  Link as LinkIcon,
  ExternalLink,
  Download,
  RefreshCcw,
  Trophy,
  Target,
  Zap
} from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'

const tierColors = {
  bronze: 'bg-amber-600',
  silver: 'bg-gray-400',
  gold: 'bg-yellow-500',
  platinum: 'bg-purple-600',
  diamond: 'bg-blue-600'
}

const tierRequirements = {
  bronze: { earnings: 0, referrals: 0 },
  silver: { earnings: 500, referrals: 10 },
  gold: { earnings: 2000, referrals: 25 },
  platinum: { earnings: 5000, referrals: 50 },
  diamond: { earnings: 10000, referrals: 100 }
}

export default function ReferralsPage() {
  const { data: session } = useSession()
  const [stats, setStats] = useState<ReferralStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [referralCode, setReferralCode] = useState('')
  const [customLink, setCustomLink] = useState('')
  const [tier, setTier] = useState<ReferralTier>('bronze')
  const [shareUrl, setShareUrl] = useState('')

  useEffect(() => {
    if (session?.user) {
      loadReferralData()
    }
  }, [session])

  const loadReferralData = async () => {
    if (!session?.user?.id) return

    setLoading(true)
    try {
      const referralStats = await referralSystem.getReferralStats(session.user.id)
      setStats(referralStats)
      
      // Generate referral code if doesn't exist
      const code = referralSystem.generateReferralCode(session.user.id)
      setReferralCode(code)
      
      // Set share URL
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://findora.com'
      setShareUrl(`${baseUrl}?ref=${code}`)
      
      // Simulate tier (in real app, get from database)
      if (referralStats.totalEarnings >= 10000) setTier('diamond')
      else if (referralStats.totalEarnings >= 5000) setTier('platinum')
      else if (referralStats.totalEarnings >= 2000) setTier('gold')
      else if (referralStats.totalEarnings >= 500) setTier('silver')
      else setTier('bronze')
      
    } catch (error) {
      console.error('Failed to load referral data:', error)
      toast.error('Failed to load referral data')
    } finally {
      setLoading(false)
    }
  }

  const copyReferralCode = () => {
    navigator.clipboard.writeText(referralCode)
    toast.success('Referral code copied!')
  }

  const copyReferralLink = () => {
    navigator.clipboard.writeText(shareUrl)
    toast.success('Referral link copied!')
  }

  const createCustomLink = async () => {
    if (!customLink.trim()) {
      toast.error('Please enter a product URL')
      return
    }

    try {
      const link = await referralSystem.createReferralLink(
        session?.user?.id || '',
        customLink,
        { source: 'custom', medium: 'referral' }
      )
      toast.success('Custom referral link created!')
      setCustomLink('')
    } catch (error) {
      toast.error('Failed to create custom link')
    }
  }

  const getNextTierProgress = () => {
    const tiers: ReferralTier[] = ['bronze', 'silver', 'gold', 'platinum', 'diamond']
    const currentIndex = tiers.indexOf(tier)
    
    if (currentIndex === tiers.length - 1) {
      return { nextTier: 'diamond', progress: 100, needed: 0, currentEarnings: stats?.totalEarnings || 0 }
    }
    
    const nextTier = tiers[currentIndex + 1]
    const requirement = tierRequirements[nextTier]
    const currentEarnings = stats?.totalEarnings || 0
    const progress = Math.min((currentEarnings / requirement.earnings) * 100, 100)
    const needed = Math.max(0, requirement.earnings - currentEarnings)
    
    return { nextTier, progress, needed, currentEarnings }
  }

  const generateSocialLinks = () => {
    return referralSystem.generateSocialLinks(referralCode)
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <Gift className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Referral Program</h2>
          <p className="text-gray-600 mb-4">Start earning rewards by referring friends!</p>
          <Button onClick={loadReferralData}>Get Started</Button>
        </div>
      </div>
    )
  }

  const tierProgress = getNextTierProgress()
  const socialLinks = generateSocialLinks()

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Referral Dashboard</h1>
          <p className="text-gray-600 mt-2">Share and earn rewards for every successful referral</p>
        </div>
        <div className="flex items-center space-x-3">
          <Badge className={`${tierColors[tier]} text-white px-3 py-1`}>
            <Crown className="w-4 h-4 mr-1" />
            {tier.charAt(0).toUpperCase() + tier.slice(1)} Tier
          </Badge>
          <Button variant="outline" onClick={loadReferralData}>
            <RefreshCcw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                <p className="text-2xl font-bold text-green-600">₹{stats.totalEarnings.toLocaleString()}</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-orange-600">₹{stats.pendingEarnings.toLocaleString()}</p>
              </div>
              <Clock className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Successful Referrals</p>
                <p className="text-2xl font-bold text-blue-600">{stats.successfulReferrals}</p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
                <p className="text-2xl font-bold text-purple-600">{stats.conversionRate.toFixed(1)}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tier Progress */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Trophy className="w-5 h-5 mr-2" />
            Tier Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Badge className={`${tierColors[tier]} text-white`}>
                  Current: {tier.charAt(0).toUpperCase() + tier.slice(1)}
                </Badge>
                {tierProgress.nextTier !== 'diamond' && (
                  <Badge variant="outline">
                    Next: {tierProgress.nextTier.charAt(0).toUpperCase() + tierProgress.nextTier.slice(1)}
                  </Badge>
                )}
              </div>
              <span className="text-sm text-gray-600">
                ₹{tierProgress.currentEarnings.toLocaleString()} 
                {tierProgress.nextTier !== 'diamond' && ` / ₹${tierRequirements[tierProgress.nextTier].earnings.toLocaleString()}`}
              </span>
            </div>
            
            {tierProgress.nextTier !== 'diamond' && (
              <>
                <Progress value={tierProgress.progress} className="h-3" />
                <p className="text-sm text-gray-600">
                  ₹{tierProgress.needed.toLocaleString()} more to reach {tierProgress.nextTier} tier
                </p>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="share" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="share">Share & Earn</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="links">My Links</TabsTrigger>
          <TabsTrigger value="rewards">Rewards</TabsTrigger>
        </TabsList>

        {/* Share & Earn Tab */}
        <TabsContent value="share" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Referral Code */}
            <Card>
              <CardHeader>
                <CardTitle>Your Referral Code</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Input
                    value={referralCode}
                    readOnly
                    className="font-mono text-lg text-center font-bold"
                  />
                  <Button onClick={copyReferralCode} variant="outline">
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-sm text-gray-600">
                  Share this code with friends. They get 10% off, you earn 5% commission!
                </p>
              </CardContent>
            </Card>

            {/* Referral Link */}
            <Card>
              <CardHeader>
                <CardTitle>Your Referral Link</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Input
                    value={shareUrl}
                    readOnly
                    className="text-sm"
                  />
                  <Button onClick={copyReferralLink} variant="outline">
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
                <ShareButtons
                  shareData={{
                    url: shareUrl,
                    title: 'Check out Findora!',
                    description: `Get 10% off your first order with my referral code: ${referralCode}`,
                    referralCode
                  }}
                  showReferral
                  onShare={(platform, referralUsed) => {
                    console.log(`Shared on ${platform}, referral used: ${referralUsed}`)
                  }}
                />
              </CardContent>
            </Card>
          </div>

          {/* Social Sharing */}
          <Card>
            <CardHeader>
              <CardTitle>Share on Social Media</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <Button
                  variant="outline"
                  onClick={() => window.open(socialLinks.facebook, '_blank')}
                  className="flex items-center space-x-2"
                >
                  <div className="w-5 h-5 bg-blue-600 rounded" />
                  <span>Facebook</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => window.open(socialLinks.twitter, '_blank')}
                  className="flex items-center space-x-2"
                >
                  <div className="w-5 h-5 bg-sky-500 rounded" />
                  <span>Twitter</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => window.open(socialLinks.whatsapp, '_blank')}
                  className="flex items-center space-x-2"
                >
                  <div className="w-5 h-5 bg-green-600 rounded" />
                  <span>WhatsApp</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => window.open(socialLinks.linkedin, '_blank')}
                  className="flex items-center space-x-2"
                >
                  <div className="w-5 h-5 bg-blue-700 rounded" />
                  <span>LinkedIn</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => window.open(socialLinks.email, '_blank')}
                  className="flex items-center space-x-2"
                >
                  <div className="w-5 h-5 bg-gray-600 rounded" />
                  <span>Email</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Custom Link Generator */}
          <Card>
            <CardHeader>
              <CardTitle>Create Custom Referral Link</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-2">
                <Input
                  placeholder="Enter product or page URL"
                  value={customLink}
                  onChange={(e) => setCustomLink(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={createCustomLink}>
                  <LinkIcon className="w-4 h-4 mr-2" />
                  Generate
                </Button>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Create custom referral links for specific products or pages
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Monthly Performance */}
            <Card>
              <CardHeader>
                <CardTitle>Monthly Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.monthlyStats.map((month, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-semibold">{format(new Date(month.month), 'MMMM yyyy')}</p>
                        <p className="text-sm text-gray-600">{month.clicks} clicks • {month.conversions} conversions</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">₹{month.earnings.toLocaleString()}</p>
                        <p className="text-xs text-gray-500">
                          {month.clicks > 0 ? ((month.conversions / month.clicks) * 100).toFixed(1) : 0}% rate
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Performance Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Key Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Eye className="w-4 h-4 text-blue-600" />
                      <span>Total Clicks</span>
                    </div>
                    <span className="font-bold">{stats.clickCount}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4 text-green-600" />
                      <span>Total Referrals</span>
                    </div>
                    <span className="font-bold">{stats.totalReferrals}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Target className="w-4 h-4 text-purple-600" />
                      <span>Conversion Rate</span>
                    </div>
                    <span className="font-bold">{stats.conversionRate.toFixed(1)}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <DollarSign className="w-4 h-4 text-green-600" />
                      <span>Avg. Earnings/Referral</span>
                    </div>
                    <span className="font-bold">
                      ₹{stats.successfulReferrals > 0 ? (stats.totalEarnings / stats.successfulReferrals).toFixed(0) : 0}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Performance Tips */}
          <Card>
            <CardHeader>
              <CardTitle>Performance Tips</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Zap className="w-4 h-4 text-blue-600" />
                    <span className="font-semibold text-blue-900">Boost Your Clicks</span>
                  </div>
                  <p className="text-sm text-blue-800">
                    Share your referral link on social media regularly and engage with your audience
                  </p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Target className="w-4 h-4 text-green-600" />
                    <span className="font-semibold text-green-900">Improve Conversions</span>
                  </div>
                  <p className="text-sm text-green-800">
                    Target friends who are actively looking for products you recommend
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Links Tab */}
        <TabsContent value="links" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>My Referral Links</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Mock referral links */}
                {[
                  { url: shareUrl, clicks: 45, conversions: 12, created: new Date(), active: true },
                  { url: `${shareUrl}&product=headphones`, clicks: 23, conversions: 8, created: new Date(Date.now() - 86400000), active: true },
                  { url: `${shareUrl}&product=smartwatch`, clicks: 67, conversions: 15, created: new Date(Date.now() - 172800000), active: false }
                ].map((link, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <p className="font-mono text-sm truncate max-w-64">{link.url}</p>
                        <Badge variant={link.active ? 'default' : 'secondary'}>
                          {link.active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-4 mt-1 text-xs text-gray-600">
                        <span>{link.clicks} clicks</span>
                        <span>{link.conversions} conversions</span>
                        <span>Created {format(link.created, 'MMM dd, yyyy')}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          navigator.clipboard.writeText(link.url)
                          toast.success('Link copied!')
                        }}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Rewards Tab */}
        <TabsContent value="rewards" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Rewards</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {/* Mock recent rewards */}
                  {[
                    { amount: 125, customer: 'Priya S.', date: new Date(), status: 'confirmed' },
                    { amount: 89, customer: 'Rajesh K.', date: new Date(Date.now() - 86400000), status: 'pending' },
                    { amount: 156, customer: 'Amit R.', date: new Date(Date.now() - 172800000), status: 'confirmed' }
                  ].map((reward, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-semibold">₹{reward.amount}</p>
                        <p className="text-sm text-gray-600">From {reward.customer}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant={reward.status === 'confirmed' ? 'default' : 'secondary'}>
                          {reward.status}
                        </Badge>
                        <p className="text-xs text-gray-500">{format(reward.date, 'MMM dd')}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tier Benefits</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(tierRequirements).map(([tierName, requirements]) => {
                    const isCurrent = tierName === tier
                    const multiplier = {
                      bronze: '1x',
                      silver: '1.2x',
                      gold: '1.5x',
                      platinum: '1.8x',
                      diamond: '2x'
                    }[tierName as ReferralTier]

                    return (
                      <div key={tierName} className={`p-3 rounded-lg border-2 ${
                        isCurrent ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                      }`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Badge className={`${tierColors[tierName as ReferralTier]} text-white text-xs`}>
                              {tierName.charAt(0).toUpperCase() + tierName.slice(1)}
                            </Badge>
                            {isCurrent && <span className="text-xs text-blue-600 font-medium">Current</span>}
                          </div>
                          <span className="font-bold text-green-600">{multiplier} Rewards</span>
                        </div>
                        <p className="text-xs text-gray-600 mt-1">
                          ₹{requirements.earnings.toLocaleString()} earnings • {requirements.referrals} referrals
                        </p>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}