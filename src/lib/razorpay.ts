/**
 * Razorpay Payment Integration
 * 
 * This module provides utilities for integrating with Razorpay payment gateway
 * for secure payment processing in the Findora e-commerce platform.
 */

export interface RazorpayConfig {
  key_id: string
  key_secret: string
  webhook_secret?: string
}

export interface PaymentOrder {
  id: string
  amount: number // Amount in paise (smallest currency unit)
  currency: string
  receipt: string
  status: 'created' | 'attempted' | 'paid'
  created_at: number
  notes?: Record<string, string>
}

export interface PaymentOptions {
  key: string
  amount: number // Amount in paise
  currency: string
  name: string
  description?: string
  image?: string
  order_id: string
  callback_url?: string
  prefill?: {
    name?: string
    email?: string
    contact?: string
  }
  notes?: Record<string, string>
  theme?: {
    color?: string
  }
  modal?: {
    ondismiss?: () => void
  }
}

export interface PaymentResponse {
  razorpay_payment_id: string
  razorpay_order_id: string
  razorpay_signature: string
}

export interface CreateOrderRequest {
  amount: number // Amount in rupees (will be converted to paise)
  currency?: string
  receipt: string
  notes?: Record<string, string>
  payment_capture?: boolean
}

export interface VerifyPaymentRequest {
  order_id: string
  payment_id: string
  signature: string
}

class RazorpayService {
  private config: RazorpayConfig | null = null
  private isInitialized = false

  /**
   * Initialize Razorpay configuration
   */
  init(config: RazorpayConfig) {
    this.config = config
    this.isInitialized = true
  }

  /**
   * Get Razorpay configuration
   */
  getConfig(): RazorpayConfig {
    if (!this.isInitialized || !this.config) {
      throw new Error('Razorpay not initialized. Call init() first.')
    }
    return this.config
  }

  /**
   * Load Razorpay SDK script
   */
  async loadScript(): Promise<boolean> {
    return new Promise((resolve) => {
      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.onload = () => resolve(true)
      script.onerror = () => resolve(false)
      document.body.appendChild(script)
    })
  }

  /**
   * Create payment order (to be called from API)
   */
  async createOrder(orderData: CreateOrderRequest): Promise<PaymentOrder> {
    if (!this.isInitialized) {
      throw new Error('Razorpay not initialized')
    }

    const response = await fetch('/api/payment/create-order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    })

    if (!response.ok) {
      throw new Error('Failed to create payment order')
    }

    return response.json()
  }

  /**
   * Open Razorpay checkout
   */
  async openCheckout(options: PaymentOptions): Promise<PaymentResponse> {
    const scriptLoaded = await this.loadScript()
    
    if (!scriptLoaded) {
      throw new Error('Failed to load Razorpay script')
    }

    return new Promise((resolve, reject) => {
      const razorpayOptions = {
        ...options,
        handler: (response: PaymentResponse) => {
          resolve(response)
        },
        modal: {
          ondismiss: () => {
            reject(new Error('Payment cancelled by user'))
          },
          ...options.modal
        }
      }

      // @ts-ignore - Razorpay is loaded dynamically
      const rzp = new window.Razorpay(razorpayOptions)
      rzp.open()
    })
  }

  /**
   * Verify payment signature
   */
  async verifyPayment(paymentData: VerifyPaymentRequest): Promise<boolean> {
    const response = await fetch('/api/payment/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(paymentData),
    })

    if (!response.ok) {
      throw new Error('Failed to verify payment')
    }

    const result = await response.json()
    return result.verified
  }

  /**
   * Convert rupees to paise
   */
  rupeesToPaise(rupees: number): number {
    return Math.round(rupees * 100)
  }

  /**
   * Convert paise to rupees
   */
  paiseToRupees(paise: number): number {
    return paise / 100
  }

  /**
   * Generate order receipt
   */
  generateReceipt(prefix: string = 'findora'): string {
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(2, 8)
    return `${prefix}_${timestamp}_${random}`
  }

  /**
   * Get payment status color for UI
   */
  getStatusColor(status: string): string {
    switch (status) {
      case 'paid':
        return 'green'
      case 'attempted':
        return 'yellow'
      case 'created':
        return 'blue'
      case 'failed':
        return 'red'
      default:
        return 'gray'
    }
  }

  /**
   * Format currency for display
   */
  formatCurrency(amount: number, currency: string = 'INR'): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2
    }).format(amount)
  }
}

// Create singleton instance
const razorpay = new RazorpayService()

// Initialize with environment variables (if available)
if (typeof window !== 'undefined') {
  const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID
  const keySecret = process.env.RAZORPAY_KEY_SECRET
  
  if (keyId) {
    razorpay.init({
      key_id: keyId,
      key_secret: keySecret || '',
      webhook_secret: process.env.RAZORPAY_WEBHOOK_SECRET
    })
  }
}

// Extend window type for Razorpay
declare global {
  interface Window {
    Razorpay: any
  }
}

export default razorpay

// Named exports
export { RazorpayService }
export const {
  loadScript,
  createOrder,
  openCheckout,
  verifyPayment,
  rupeesToPaise,
  paiseToRupees,
  generateReceipt,
  getStatusColor,
  formatCurrency
} = razorpay