/**
 * Referral Tracking System
 * 
 * This module provides comprehensive referral tracking functionality
 * including link generation, click tracking, conversion tracking, and rewards.
 */

export type ReferralStatus = 'pending' | 'confirmed' | 'paid' | 'expired' | 'cancelled'

export type ReferralTier = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond'

export interface ReferralUser {
  id: string
  userId: string
  referralCode: string
  customCode?: string
  tier: ReferralTier
  totalEarnings: number
  totalReferrals: number
  successfulReferrals: number
  clickCount: number
  conversionRate: number
  isActive: boolean
  createdAt: Date
  lastActivityAt: Date
  socialLinks?: {
    facebook?: string
    instagram?: string
    youtube?: string
    twitter?: string
    blog?: string
  }
}

export interface ReferralLink {
  id: string
  referrerId: string
  referralCode: string
  originalUrl: string
  shortUrl: string
  customSlug?: string
  productId?: string
  campaignId?: string
  clicks: number
  conversions: number
  isActive: boolean
  expiresAt?: Date
  createdAt: Date
  metadata?: {
    source: string
    medium: string
    campaign?: string
    content?: string
  }
}

export interface ReferralClick {
  id: string
  linkId: string
  referralCode: string
  visitorId: string
  ipAddress: string
  userAgent: string
  referer?: string
  country?: string
  city?: string
  device: string
  os: string
  browser: string
  clickedAt: Date
  convertedAt?: Date
  orderId?: string
}

export interface ReferralReward {
  id: string
  referrerId: string
  refereeId: string
  orderId: string
  referralCode: string
  rewardType: 'percentage' | 'fixed' | 'points'
  rewardValue: number
  currencyValue: number
  status: ReferralStatus
  tier: ReferralTier
  createdAt: Date
  confirmedAt?: Date
  paidAt?: Date
  expiresAt: Date
  metadata?: {
    orderValue: number
    productId?: string
    campaignId?: string
  }
}

export interface ReferralCampaign {
  id: string
  name: string
  description: string
  isActive: boolean
  startDate: Date
  endDate: Date
  rewardStructure: {
    referrerReward: {
      type: 'percentage' | 'fixed' | 'points'
      value: number
      maxReward?: number
    }
    refereeDiscount: {
      type: 'percentage' | 'fixed'
      value: number
      maxDiscount?: number
    }
  }
  tierMultipliers: {
    [K in ReferralTier]: number
  }
  conditions: {
    minOrderValue?: number
    maxUsesPerUser?: number
    productCategories?: string[]
    newCustomersOnly?: boolean
  }
}

export interface ReferralStats {
  totalEarnings: number
  pendingEarnings: number
  totalReferrals: number
  successfulReferrals: number
  conversionRate: number
  clickCount: number
  topPerformingLinks: ReferralLink[]
  recentActivity: ReferralClick[]
  monthlyStats: {
    month: string
    clicks: number
    conversions: number
    earnings: number
  }[]
}

class ReferralSystem {
  private baseUrl: string = process.env.NEXT_PUBLIC_APP_URL || 'https://findora.com'

  /**
   * Generate unique referral code
   */
  generateReferralCode(userId: string, length: number = 6): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let result = ''
    
    // Add some user-specific entropy
    const userHash = this.simpleHash(userId).toString(36).toUpperCase()
    result += userHash.substring(0, 2)
    
    // Add random characters
    for (let i = result.length; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length))
    }
    
    return result
  }

  /**
   * Create referral user profile
   */
  async createReferralUser(userId: string, customCode?: string): Promise<ReferralUser> {
    const referralCode = customCode || this.generateReferralCode(userId)
    
    const referralUser: ReferralUser = {
      id: `ref_${Date.now()}_${Math.random().toString(36).substring(2)}`,
      userId,
      referralCode,
      customCode,
      tier: 'bronze',
      totalEarnings: 0,
      totalReferrals: 0,
      successfulReferrals: 0,
      clickCount: 0,
      conversionRate: 0,
      isActive: true,
      createdAt: new Date(),
      lastActivityAt: new Date()
    }

    // TODO: Store in database
    console.log('Creating referral user:', referralUser)
    return referralUser
  }

  /**
   * Generate referral link
   */
  async createReferralLink(
    referrerId: string,
    targetUrl: string,
    options?: {
      productId?: string
      campaignId?: string
      customSlug?: string
      expiresIn?: number // days
      source?: string
      medium?: string
      campaign?: string
    }
  ): Promise<ReferralLink> {
    const referralUser = await this.getReferralUser(referrerId)
    if (!referralUser) {
      throw new Error('Referral user not found')
    }

    const linkId = `link_${Date.now()}_${Math.random().toString(36).substring(2)}`
    const shortSlug = options?.customSlug || this.generateShortSlug()
    
    // Create referral URL
    const separator = targetUrl.includes('?') ? '&' : '?'
    const referralUrl = `${targetUrl}${separator}ref=${referralUser.referralCode}&src=${options?.source || 'direct'}`
    const shortUrl = `${this.baseUrl}/r/${shortSlug}`

    const referralLink: ReferralLink = {
      id: linkId,
      referrerId,
      referralCode: referralUser.referralCode,
      originalUrl: targetUrl,
      shortUrl,
      customSlug: options?.customSlug,
      productId: options?.productId,
      campaignId: options?.campaignId,
      clicks: 0,
      conversions: 0,
      isActive: true,
      expiresAt: options?.expiresIn ? new Date(Date.now() + options.expiresIn * 24 * 60 * 60 * 1000) : undefined,
      createdAt: new Date(),
      metadata: {
        source: options?.source || 'direct',
        medium: options?.medium || 'referral',
        campaign: options?.campaign,
        content: options?.productId ? `product_${options.productId}` : undefined
      }
    }

    // TODO: Store in database
    console.log('Creating referral link:', referralLink)
    return referralLink
  }

  /**
   * Track referral click
   */
  async trackClick(
    linkSlug: string,
    visitorData: {
      ipAddress: string
      userAgent: string
      referer?: string
    }
  ): Promise<ReferralClick> {
    const link = await this.getReferralLinkBySlug(linkSlug)
    if (!link || !link.isActive) {
      throw new Error('Invalid or inactive referral link')
    }

    // Check if link has expired
    if (link.expiresAt && link.expiresAt < new Date()) {
      throw new Error('Referral link has expired')
    }

    const visitorId = this.generateVisitorId(visitorData.ipAddress, visitorData.userAgent)
    const deviceInfo = this.parseUserAgent(visitorData.userAgent)
    const locationInfo = await this.getLocationFromIP(visitorData.ipAddress)

    const click: ReferralClick = {
      id: `click_${Date.now()}_${Math.random().toString(36).substring(2)}`,
      linkId: link.id,
      referralCode: link.referralCode,
      visitorId,
      ipAddress: visitorData.ipAddress,
      userAgent: visitorData.userAgent,
      referer: visitorData.referer,
      country: locationInfo.country,
      city: locationInfo.city,
      device: deviceInfo.device,
      os: deviceInfo.os,
      browser: deviceInfo.browser,
      clickedAt: new Date()
    }

    // TODO: Store in database and update link click count
    console.log('Tracking referral click:', click)
    return click
  }

  /**
   * Track conversion when referred user makes purchase
   */
  async trackConversion(
    orderId: string,
    referralCode: string,
    orderValue: number,
    customerId: string
  ): Promise<ReferralReward | null> {
    const referralUser = await this.getReferralUserByCode(referralCode)
    if (!referralUser || !referralUser.isActive) {
      return null
    }

    const campaign = await this.getActiveCampaign()
    if (!campaign) {
      console.warn('No active referral campaign found')
      return null
    }

    // Check campaign conditions
    if (campaign.conditions.minOrderValue && orderValue < campaign.conditions.minOrderValue) {
      console.log('Order value too low for referral reward')
      return null
    }

    // Calculate reward
    const tierMultiplier = campaign.tierMultipliers[referralUser.tier] || 1
    let rewardValue = 0
    
    if (campaign.rewardStructure.referrerReward.type === 'percentage') {
      rewardValue = (orderValue * campaign.rewardStructure.referrerReward.value / 100) * tierMultiplier
      if (campaign.rewardStructure.referrerReward.maxReward) {
        rewardValue = Math.min(rewardValue, campaign.rewardStructure.referrerReward.maxReward)
      }
    } else {
      rewardValue = campaign.rewardStructure.referrerReward.value * tierMultiplier
    }

    const reward: ReferralReward = {
      id: `reward_${Date.now()}_${Math.random().toString(36).substring(2)}`,
      referrerId: referralUser.userId,
      refereeId: customerId,
      orderId,
      referralCode,
      rewardType: campaign.rewardStructure.referrerReward.type,
      rewardValue: campaign.rewardStructure.referrerReward.value,
      currencyValue: rewardValue,
      status: 'pending',
      tier: referralUser.tier,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      metadata: {
        orderValue,
        campaignId: campaign.id
      }
    }

    // TODO: Store reward and update referrer stats
    console.log('Created referral reward:', reward)
    return reward
  }

  /**
   * Get referral user statistics
   */
  async getReferralStats(userId: string): Promise<ReferralStats> {
    // TODO: Implement actual database queries
    return {
      totalEarnings: 2450.00,
      pendingEarnings: 340.00,
      totalReferrals: 23,
      successfulReferrals: 15,
      conversionRate: 65.2,
      clickCount: 156,
      topPerformingLinks: [],
      recentActivity: [],
      monthlyStats: [
        { month: '2024-01', clicks: 45, conversions: 12, earnings: 480.00 },
        { month: '2024-02', clicks: 67, conversions: 18, earnings: 720.00 },
        { month: '2024-03', clicks: 44, conversions: 10, earnings: 400.00 }
      ]
    }
  }

  /**
   * Update referral tier based on performance
   */
  async updateReferralTier(userId: string): Promise<ReferralTier> {
    const stats = await this.getReferralStats(userId)
    
    let newTier: ReferralTier = 'bronze'
    
    if (stats.totalEarnings >= 10000 && stats.successfulReferrals >= 100) {
      newTier = 'diamond'
    } else if (stats.totalEarnings >= 5000 && stats.successfulReferrals >= 50) {
      newTier = 'platinum'
    } else if (stats.totalEarnings >= 2000 && stats.successfulReferrals >= 25) {
      newTier = 'gold'
    } else if (stats.totalEarnings >= 500 && stats.successfulReferrals >= 10) {
      newTier = 'silver'
    }

    // TODO: Update user tier in database
    console.log(`Updating user ${userId} tier to ${newTier}`)
    return newTier
  }

  /**
   * Generate shareable links for social media
   */
  generateSocialLinks(referralCode: string, productUrl?: string): {
    facebook: string
    twitter: string
    whatsapp: string
    linkedin: string
    email: string
  } {
    const baseUrl = productUrl || `${this.baseUrl}/products`
    const referralUrl = `${baseUrl}?ref=${referralCode}`
    const message = productUrl 
      ? 'Check out this amazing product I found!'
      : 'Discover amazing deals on Findora!'

    return {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralUrl)}&quote=${encodeURIComponent(message)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}&url=${encodeURIComponent(referralUrl)}&hashtags=findora,deals`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(`${message}\n\n${referralUrl}`)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(referralUrl)}&title=${encodeURIComponent(message)}`,
      email: `mailto:?subject=${encodeURIComponent('Great deals on Findora!')}&body=${encodeURIComponent(`${message}\n\nCheck it out: ${referralUrl}`)}`
    }
  }

  /**
   * Validate referral code
   */
  async validateReferralCode(code: string): Promise<boolean> {
    const referralUser = await this.getReferralUserByCode(code)
    return !!(referralUser && referralUser.isActive)
  }

  /**
   * Get referral discount for new customer
   */
  async getReferralDiscount(referralCode: string): Promise<{
    type: 'percentage' | 'fixed'
    value: number
    maxDiscount?: number
  } | null> {
    const campaign = await this.getActiveCampaign()
    const referralUser = await this.getReferralUserByCode(referralCode)
    
    if (!campaign || !referralUser || !referralUser.isActive) {
      return null
    }

    return campaign.rewardStructure.refereeDiscount
  }

  // Helper methods
  private async getReferralUser(userId: string): Promise<ReferralUser | null> {
    // TODO: Implement database query
    return null
  }

  private async getReferralUserByCode(code: string): Promise<ReferralUser | null> {
    // TODO: Implement database query
    return null
  }

  private async getReferralLinkBySlug(slug: string): Promise<ReferralLink | null> {
    // TODO: Implement database query
    return null
  }

  private async getActiveCampaign(): Promise<ReferralCampaign | null> {
    // TODO: Implement database query - return active campaign
    return {
      id: 'campaign_1',
      name: 'Default Referral Campaign',
      description: 'Standard referral rewards',
      isActive: true,
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-12-31'),
      rewardStructure: {
        referrerReward: {
          type: 'percentage',
          value: 5, // 5% of order value
          maxReward: 500 // Max ₹500 per referral
        },
        refereeDiscount: {
          type: 'percentage',
          value: 10, // 10% discount for new customer
          maxDiscount: 200 // Max ₹200 discount
        }
      },
      tierMultipliers: {
        bronze: 1.0,
        silver: 1.2,
        gold: 1.5,
        platinum: 1.8,
        diamond: 2.0
      },
      conditions: {
        minOrderValue: 500,
        maxUsesPerUser: 10,
        newCustomersOnly: true
      }
    }
  }

  private generateShortSlug(length: number = 6): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let result = ''
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length))
    }
    return result
  }

  private generateVisitorId(ip: string, userAgent: string): string {
    return this.simpleHash(ip + userAgent).toString(36)
  }

  private simpleHash(str: string): number {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return Math.abs(hash)
  }

  private parseUserAgent(userAgent: string): { device: string; os: string; browser: string } {
    // Simple user agent parsing (in production, use a proper library)
    const device = /Mobile|Android|iPhone|iPad/.test(userAgent) ? 'mobile' : 'desktop'
    
    let os = 'unknown'
    if (/Windows/.test(userAgent)) os = 'Windows'
    else if (/Mac OS/.test(userAgent)) os = 'macOS'
    else if (/Linux/.test(userAgent)) os = 'Linux'
    else if (/Android/.test(userAgent)) os = 'Android'
    else if (/iOS/.test(userAgent)) os = 'iOS'
    
    let browser = 'unknown'
    if (/Chrome/.test(userAgent)) browser = 'Chrome'
    else if (/Firefox/.test(userAgent)) browser = 'Firefox'
    else if (/Safari/.test(userAgent)) browser = 'Safari'
    else if (/Edge/.test(userAgent)) browser = 'Edge'
    
    return { device, os, browser }
  }

  private async getLocationFromIP(ip: string): Promise<{ country?: string; city?: string }> {
    // TODO: Implement IP geolocation (use service like ipapi.co or geoip2)
    return { country: 'India', city: 'Mumbai' }
  }
}

// Export singleton instance
export const referralSystem = new ReferralSystem()
export default referralSystem