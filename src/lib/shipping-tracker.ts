/**
 * Shipping Tracking Integration System
 * 
 * This module provides integration with various Indian shipping carriers
 * for real-time tracking updates and delivery notifications.
 */

import { DeliveryPartner, ShippingStatus, TrackingEvent } from './order-management'

export interface CarrierConfig {
  id: DeliveryPartner
  name: string
  apiEndpoint: string
  apiKey?: string
  trackingUrl: string
  supportedFeatures: {
    realTimeTracking: boolean
    deliveryPrediction: boolean
    proofOfDelivery: boolean
    cashOnDelivery: boolean
    rescheduling: boolean
  }
  regions: string[]
  avgDeliveryDays: number
  maxWeight: number // in kg
  pricing: {
    baseRate: number
    perKgRate: number
    codCharges?: number
  }
}

export interface TrackingAPIResponse {
  trackingId: string
  status: ShippingStatus
  estimatedDelivery?: string
  actualDelivery?: string
  currentLocation: string
  events: {
    timestamp: string
    location: string
    status: string
    description: string
    remarks?: string
  }[]
  deliveryInfo?: {
    recipientName?: string
    signatureUrl?: string
    deliveryProofUrl?: string
    attemptCount?: number
  }
}

export interface ShippingRate {
  carrierId: DeliveryPartner
  carrierName: string
  estimatedDays: number
  cost: number
  features: string[]
  recommended: boolean
}

export interface ShipmentRequest {
  orderId: string
  pickupAddress: {
    name: string
    phone: string
    email: string
    addressLine1: string
    addressLine2?: string
    city: string
    state: string
    pincode: string
  }
  deliveryAddress: {
    name: string
    phone: string
    email?: string
    addressLine1: string
    addressLine2?: string
    city: string
    state: string
    pincode: string
  }
  packageDetails: {
    weight: number
    dimensions: {
      length: number
      width: number
      height: number
    }
    value: number
    description: string
    fragile: boolean
  }
  preferences: {
    preferredCarrier?: DeliveryPartner
    deliverySpeed: 'standard' | 'express' | 'overnight'
    cashOnDelivery: boolean
    codAmount?: number
    insurance: boolean
  }
}

class ShippingTracker {
  private carriers: Map<DeliveryPartner, CarrierConfig> = new Map()

  constructor() {
    this.initializeCarriers()
  }

  private initializeCarriers() {
    const carriers: CarrierConfig[] = [
      {
        id: 'delhivery',
        name: 'Delhivery',
        apiEndpoint: 'https://track.delhivery.com/api/v1/packages/json/',
        trackingUrl: 'https://www.delhivery.com/track/package/',
        supportedFeatures: {
          realTimeTracking: true,
          deliveryPrediction: true,
          proofOfDelivery: true,
          cashOnDelivery: true,
          rescheduling: true
        },
        regions: ['PAN India'],
        avgDeliveryDays: 3,
        maxWeight: 50,
        pricing: {
          baseRate: 40,
          perKgRate: 20,
          codCharges: 25
        }
      },
      {
        id: 'bluedart',
        name: 'Blue Dart',
        apiEndpoint: 'https://www.bluedart.com/servlet/RoutingServlet',
        trackingUrl: 'https://www.bluedart.com/tracking',
        supportedFeatures: {
          realTimeTracking: true,
          deliveryPrediction: true,
          proofOfDelivery: true,
          cashOnDelivery: false,
          rescheduling: true
        },
        regions: ['PAN India', 'International'],
        avgDeliveryDays: 2,
        maxWeight: 100,
        pricing: {
          baseRate: 60,
          perKgRate: 30
        }
      },
      {
        id: 'ecom_express',
        name: 'Ecom Express',
        apiEndpoint: 'https://api.ecomexpress.in/apiv2/fetch_awb_info_api/',
        trackingUrl: 'https://www.ecomexpress.in/track_me/',
        supportedFeatures: {
          realTimeTracking: true,
          deliveryPrediction: true,
          proofOfDelivery: true,
          cashOnDelivery: true,
          rescheduling: false
        },
        regions: ['PAN India'],
        avgDeliveryDays: 4,
        maxWeight: 25,
        pricing: {
          baseRate: 35,
          perKgRate: 18,
          codCharges: 20
        }
      },
      {
        id: 'xpressbees',
        name: 'XpressBees',
        apiEndpoint: 'https://www.xpressbees.com/api/shipments/track/',
        trackingUrl: 'https://www.xpressbees.com/track/',
        supportedFeatures: {
          realTimeTracking: true,
          deliveryPrediction: false,
          proofOfDelivery: true,
          cashOnDelivery: true,
          rescheduling: true
        },
        regions: ['PAN India'],
        avgDeliveryDays: 4,
        maxWeight: 30,
        pricing: {
          baseRate: 30,
          perKgRate: 15,
          codCharges: 20
        }
      },
      {
        id: 'dtdc',
        name: 'DTDC',
        apiEndpoint: 'https://www.dtdc.in/dtdcTrack/Tracking/consignInfo',
        trackingUrl: 'https://www.dtdc.in/tracking',
        supportedFeatures: {
          realTimeTracking: false,
          deliveryPrediction: false,
          proofOfDelivery: false,
          cashOnDelivery: true,
          rescheduling: false
        },
        regions: ['PAN India'],
        avgDeliveryDays: 5,
        maxWeight: 50,
        pricing: {
          baseRate: 25,
          perKgRate: 12,
          codCharges: 15
        }
      }
    ]

    carriers.forEach(carrier => {
      this.carriers.set(carrier.id, carrier)
    })
  }

  /**
   * Get all available carriers
   */
  getCarriers(): CarrierConfig[] {
    return Array.from(this.carriers.values())
  }

  /**
   * Get specific carrier configuration
   */
  getCarrier(carrierId: DeliveryPartner): CarrierConfig | undefined {
    return this.carriers.get(carrierId)
  }

  /**
   * Calculate shipping rates for different carriers
   */
  async calculateRates(
    fromPincode: string,
    toPincode: string,
    weight: number,
    codAmount?: number
  ): Promise<ShippingRate[]> {
    const rates: ShippingRate[] = []

    for (const [carrierId, carrier] of this.carriers) {
      if (weight > carrier.maxWeight) continue

      const baseRate = carrier.pricing.baseRate
      const weightRate = Math.ceil(weight) * carrier.pricing.perKgRate
      const codCharges = codAmount && carrier.pricing.codCharges ? carrier.pricing.codCharges : 0
      
      const totalCost = baseRate + weightRate + codCharges

      rates.push({
        carrierId,
        carrierName: carrier.name,
        estimatedDays: carrier.avgDeliveryDays,
        cost: totalCost,
        features: this.getCarrierFeatures(carrier),
        recommended: carrierId === 'delhivery' // Default recommendation
      })
    }

    return rates.sort((a, b) => a.cost - b.cost)
  }

  /**
   * Create shipment with carrier
   */
  async createShipment(request: ShipmentRequest): Promise<{
    success: boolean
    trackingId?: string
    carrierRef?: string
    estimatedDelivery?: Date
    error?: string
  }> {
    try {
      // TODO: Implement actual carrier API integration
      // For now, return mock response
      const trackingId = this.generateTrackingId(request.preferences.preferredCarrier || 'delhivery')
      const carrier = this.getCarrier(request.preferences.preferredCarrier || 'delhivery')
      
      return {
        success: true,
        trackingId,
        carrierRef: `REF_${Date.now()}`,
        estimatedDelivery: new Date(Date.now() + (carrier?.avgDeliveryDays || 3) * 24 * 60 * 60 * 1000)
      }
    } catch (error) {
      console.error('Failed to create shipment:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Track package with carrier API
   */
  async trackPackage(carrierId: DeliveryPartner, trackingId: string): Promise<TrackingAPIResponse | null> {
    const carrier = this.getCarrier(carrierId)
    if (!carrier) return null

    try {
      // TODO: Implement actual carrier API calls
      // For now, return mock tracking data
      return this.generateMockTrackingResponse(carrierId, trackingId)
    } catch (error) {
      console.error(`Failed to track package with ${carrierId}:`, error)
      return null
    }
  }

  /**
   * Get real-time updates for multiple packages
   */
  async bulkTrack(packages: { carrierId: DeliveryPartner; trackingId: string }[]): Promise<Map<string, TrackingAPIResponse>> {
    const results = new Map<string, TrackingAPIResponse>()

    await Promise.all(
      packages.map(async (pkg) => {
        const response = await this.trackPackage(pkg.carrierId, pkg.trackingId)
        if (response) {
          results.set(pkg.trackingId, response)
        }
      })
    )

    return results
  }

  /**
   * Schedule delivery rescheduling
   */
  async rescheduleDelivery(
    carrierId: DeliveryPartner,
    trackingId: string,
    newDate: Date,
    reason: string
  ): Promise<boolean> {
    const carrier = this.getCarrier(carrierId)
    if (!carrier?.supportedFeatures.rescheduling) {
      return false
    }

    try {
      // TODO: Implement actual rescheduling API
      console.log('Rescheduling delivery:', { carrierId, trackingId, newDate, reason })
      return true
    } catch (error) {
      console.error('Failed to reschedule delivery:', error)
      return false
    }
  }

  /**
   * Get delivery proof (signature, photo)
   */
  async getDeliveryProof(carrierId: DeliveryPartner, trackingId: string): Promise<{
    signatureUrl?: string
    photoUrl?: string
    recipientName?: string
    deliveryDate?: Date
  } | null> {
    const carrier = this.getCarrier(carrierId)
    if (!carrier?.supportedFeatures.proofOfDelivery) {
      return null
    }

    try {
      // TODO: Implement actual proof retrieval API
      return {
        signatureUrl: 'https://example.com/signature.jpg',
        photoUrl: 'https://example.com/delivery-photo.jpg',
        recipientName: 'John Doe',
        deliveryDate: new Date()
      }
    } catch (error) {
      console.error('Failed to get delivery proof:', error)
      return null
    }
  }

  /**
   * Convert carrier tracking events to our format
   */
  private convertToTrackingEvents(
    carrierId: DeliveryPartner,
    carrierEvents: any[]
  ): TrackingEvent[] {
    return carrierEvents.map((event, index) => ({
      id: `${carrierId}_${index}`,
      timestamp: new Date(event.timestamp),
      status: this.mapCarrierStatusToOurStatus(event.status),
      location: event.location,
      description: event.description,
      isDeliveryUpdate: ['delivered', 'delivery_failed'].includes(this.mapCarrierStatusToOurStatus(event.status)),
      courierRemarks: event.remarks
    }))
  }

  /**
   * Map carrier-specific status to our standard status
   */
  private mapCarrierStatusToOurStatus(carrierStatus: string): ShippingStatus {
    const statusMap: { [key: string]: ShippingStatus } = {
      'picked': 'shipped',
      'in-transit': 'in_transit',
      'out-for-delivery': 'out_for_delivery',
      'delivered': 'delivered',
      'failed': 'delivery_failed',
      'returned': 'returned',
      'dispatched': 'shipped',
      'reached-destination': 'in_transit'
    }

    return statusMap[carrierStatus.toLowerCase()] || 'in_transit'
  }

  /**
   * Generate carrier features list
   */
  private getCarrierFeatures(carrier: CarrierConfig): string[] {
    const features = []
    
    if (carrier.supportedFeatures.realTimeTracking) features.push('Real-time tracking')
    if (carrier.supportedFeatures.deliveryPrediction) features.push('Delivery prediction')
    if (carrier.supportedFeatures.proofOfDelivery) features.push('Proof of delivery')
    if (carrier.supportedFeatures.cashOnDelivery) features.push('Cash on delivery')
    if (carrier.supportedFeatures.rescheduling) features.push('Rescheduling')
    
    return features
  }

  /**
   * Generate tracking ID for carrier
   */
  private generateTrackingId(carrierId: DeliveryPartner): string {
    const prefixes = {
      delhivery: 'DELHIVERY',
      bluedart: 'BD',
      ecom_express: 'EE',
      xpressbees: 'XB',
      dtdc: 'DTDC',
      fedex: 'FX',
      india_post: 'IP',
      ekart: 'EK',
      amazon_logistics: 'AL'
    }

    const prefix = prefixes[carrierId] || 'TRK'
    const timestamp = Date.now().toString().slice(-8)
    const random = Math.random().toString(36).substring(2, 6).toUpperCase()
    
    return `${prefix}${timestamp}${random}`
  }

  /**
   * Generate mock tracking response for testing
   */
  private generateMockTrackingResponse(carrierId: DeliveryPartner, trackingId: string): TrackingAPIResponse {
    const now = new Date()
    const statuses: ShippingStatus[] = ['shipped', 'in_transit', 'out_for_delivery', 'delivered']
    const currentStatusIndex = Math.min(Math.floor(Math.random() * statuses.length), statuses.length - 1)
    const currentStatus = statuses[currentStatusIndex]
    
    const events = []
    
    // Generate events up to current status
    for (let i = 0; i <= currentStatusIndex; i++) {
      events.push({
        timestamp: new Date(now.getTime() - (statuses.length - i) * 24 * 60 * 60 * 1000).toISOString(),
        location: ['Mumbai Hub', 'Delhi Processing Center', 'Local Office', 'Customer Address'][i],
        status: statuses[i],
        description: [
          'Package picked up from seller',
          'Package in transit to destination city',
          'Package out for delivery',
          'Package delivered successfully'
        ][i],
        remarks: i === currentStatusIndex ? 'Latest update' : undefined
      })
    }

    return {
      trackingId,
      status: currentStatus,
      estimatedDelivery: currentStatus !== 'delivered' 
        ? new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString()
        : undefined,
      actualDelivery: currentStatus === 'delivered'
        ? new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString()
        : undefined,
      currentLocation: events[events.length - 1].location,
      events,
      deliveryInfo: currentStatus === 'delivered' ? {
        recipientName: 'John Doe',
        signatureUrl: 'https://example.com/signature.jpg',
        attemptCount: 1
      } : undefined
    }
  }
}

// Export singleton instance
export const shippingTracker = new ShippingTracker()
export default shippingTracker