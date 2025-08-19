'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import razorpay, { PaymentOptions, PaymentResponse } from '@/lib/razorpay'
import { 
  CreditCard, 
  Smartphone,
  Wallet,
  Shield,
  Lock,
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react'
import { toast } from 'sonner'

export interface PaymentFormData {
  method: 'razorpay' | 'card' | 'upi' | 'netbanking' | 'wallet'
  saveCard?: boolean
  cardDetails?: {
    number: string
    expiry: string
    cvv: string
    name: string
  }
}

interface PaymentFormProps {
  amount: number
  currency?: string
  orderDetails: {
    orderId: string
    customerName: string
    customerEmail: string
    customerPhone?: string
    description?: string
  }
  onPaymentSuccess: (response: PaymentResponse) => void
  onPaymentError: (error: Error) => void
  className?: string
}

const paymentMethods = [
  {
    id: 'razorpay',
    name: 'Razorpay Gateway',
    description: 'All payment methods (UPI, Cards, Wallets, Net Banking)',
    icon: Wallet,
    popular: true
  },
  {
    id: 'card',
    name: 'Credit/Debit Card',
    description: 'Visa, MasterCard, American Express, RuPay',
    icon: CreditCard,
    popular: false
  },
  {
    id: 'upi',
    name: 'UPI',
    description: 'PhonePe, Google Pay, Paytm, BHIM UPI',
    icon: Smartphone,
    popular: true
  }
]

export default function PaymentForm({
  amount,
  currency = 'INR',
  orderDetails,
  onPaymentSuccess,
  onPaymentError,
  className = ''
}: PaymentFormProps) {
  const [selectedMethod, setSelectedMethod] = useState<string>('razorpay')
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentReady, setPaymentReady] = useState(false)
  const [cardDetails, setCardDetails] = useState({
    number: '',
    expiry: '',
    cvv: '',
    name: ''
  })
  const [saveCard, setSaveCard] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    // Check if payment system is ready
    setPaymentReady(true)
  }, [])

  const validateCardDetails = () => {
    const newErrors: Record<string, string> = {}

    if (selectedMethod === 'card') {
      if (!cardDetails.number.replace(/\s/g, '')) {
        newErrors.cardNumber = 'Card number is required'
      } else if (cardDetails.number.replace(/\s/g, '').length < 16) {
        newErrors.cardNumber = 'Please enter a valid card number'
      }

      if (!cardDetails.expiry) {
        newErrors.expiry = 'Expiry date is required'
      } else if (!/^\d{2}\/\d{2}$/.test(cardDetails.expiry)) {
        newErrors.expiry = 'Please enter valid expiry (MM/YY)'
      }

      if (!cardDetails.cvv) {
        newErrors.cvv = 'CVV is required'
      } else if (cardDetails.cvv.length < 3) {
        newErrors.cvv = 'Please enter valid CVV'
      }

      if (!cardDetails.name.trim()) {
        newErrors.cardName = 'Cardholder name is required'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    const matches = v.match(/\d{4,16}/g)
    const match = matches && matches[0] || ''
    const parts = []

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4))
    }

    if (parts.length) {
      return parts.join(' ')
    } else {
      return v
    }
  }

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4)
    }
    return v
  }

  const handleCardInputChange = (field: string, value: string) => {
    let formattedValue = value

    if (field === 'number') {
      formattedValue = formatCardNumber(value)
    } else if (field === 'expiry') {
      formattedValue = formatExpiry(value)
    } else if (field === 'cvv') {
      formattedValue = value.replace(/[^0-9]/g, '').substring(0, 4)
    }

    setCardDetails(prev => ({ ...prev, [field]: formattedValue }))
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handlePayment = async () => {
    if (!validateCardDetails()) {
      return
    }

    setIsProcessing(true)

    try {
      // Create order first
      const orderResponse = await razorpay.createOrder({
        amount: amount,
        currency: currency,
        receipt: razorpay.generateReceipt('findora'),
        notes: {
          customer_name: orderDetails.customerName,
          customer_email: orderDetails.customerEmail,
          order_id: orderDetails.orderId
        }
      })

      const paymentOptions: PaymentOptions = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '',
        amount: orderResponse.amount,
        currency: orderResponse.currency,
        name: 'Findora',
        description: orderDetails.description || 'Purchase from Findora',
        image: '/favicon.ico',
        order_id: orderResponse.id,
        prefill: {
          name: orderDetails.customerName,
          email: orderDetails.customerEmail,
          contact: orderDetails.customerPhone
        },
        theme: {
          color: '#3B82F6'
        },
        modal: {
          ondismiss: () => {
            setIsProcessing(false)
            toast.error('Payment cancelled')
          }
        }
      }

      // Handle different payment methods
      if (selectedMethod === 'razorpay') {
        // Open Razorpay checkout with all payment options
        const response = await razorpay.openCheckout(paymentOptions)
        await handlePaymentSuccess(response)
      } else {
        // For specific methods, you can customize the checkout
        const response = await razorpay.openCheckout({
          ...paymentOptions,
          method: selectedMethod as any
        })
        await handlePaymentSuccess(response)
      }

    } catch (error) {
      console.error('Payment error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Payment failed'
      toast.error(errorMessage)
      onPaymentError(error instanceof Error ? error : new Error(errorMessage))
      setIsProcessing(false)
    }
  }

  const handlePaymentSuccess = async (response: PaymentResponse) => {
    try {
      // Verify payment on server
      const verified = await razorpay.verifyPayment({
        order_id: response.razorpay_order_id,
        payment_id: response.razorpay_payment_id,
        signature: response.razorpay_signature
      })

      if (verified) {
        toast.success('Payment successful!')
        onPaymentSuccess(response)
      } else {
        throw new Error('Payment verification failed')
      }
    } catch (error) {
      console.error('Payment verification error:', error)
      toast.error('Payment verification failed')
      onPaymentError(error instanceof Error ? error : new Error('Verification failed'))
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border p-6 ${className}`}>
      <div className="flex items-center space-x-2 mb-6">
        <Shield className="w-5 h-5 text-green-600" />
        <h2 className="text-xl font-semibold text-gray-900">Secure Payment</h2>
        <Lock className="w-4 h-4 text-gray-500" />
      </div>

      {/* Payment Amount Display */}
      <div className="bg-blue-50 rounded-lg p-4 mb-6">
        <div className="flex justify-between items-center">
          <span className="text-gray-700">Total Amount:</span>
          <span className="text-2xl font-bold text-blue-600">
            {razorpay.formatCurrency(amount, currency)}
          </span>
        </div>
      </div>

      {/* Payment Method Selection */}
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Choose Payment Method</h3>
        <RadioGroup
          value={selectedMethod}
          onValueChange={setSelectedMethod}
          className="space-y-3"
        >
          {paymentMethods.map((method) => {
            const Icon = method.icon
            return (
              <div
                key={method.id}
                className={`
                  relative flex items-center space-x-3 p-4 rounded-lg border-2 transition-colors
                  ${selectedMethod === method.id 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                  }
                `}
              >
                <RadioGroupItem value={method.id} id={method.id} />
                <div className="flex items-center space-x-3 flex-1">
                  <Icon className="w-5 h-5 text-gray-600" />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <label htmlFor={method.id} className="font-medium text-gray-900 cursor-pointer">
                        {method.name}
                      </label>
                      {method.popular && (
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                          Popular
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{method.description}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </RadioGroup>
      </div>

      {/* Card Details Form (shown only for card method) */}
      {selectedMethod === 'card' && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-4">Card Details</h4>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="cardNumber">Card Number</Label>
              <Input
                id="cardNumber"
                value={cardDetails.number}
                onChange={(e) => handleCardInputChange('number', e.target.value)}
                placeholder="1234 5678 9012 3456"
                maxLength={19}
                className={errors.cardNumber ? 'border-red-300' : ''}
              />
              {errors.cardNumber && (
                <p className="text-red-600 text-sm mt-1">{errors.cardNumber}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="expiry">Expiry Date</Label>
                <Input
                  id="expiry"
                  value={cardDetails.expiry}
                  onChange={(e) => handleCardInputChange('expiry', e.target.value)}
                  placeholder="MM/YY"
                  maxLength={5}
                  className={errors.expiry ? 'border-red-300' : ''}
                />
                {errors.expiry && (
                  <p className="text-red-600 text-sm mt-1">{errors.expiry}</p>
                )}
              </div>

              <div>
                <Label htmlFor="cvv">CVV</Label>
                <Input
                  id="cvv"
                  value={cardDetails.cvv}
                  onChange={(e) => handleCardInputChange('cvv', e.target.value)}
                  placeholder="123"
                  maxLength={4}
                  className={errors.cvv ? 'border-red-300' : ''}
                />
                {errors.cvv && (
                  <p className="text-red-600 text-sm mt-1">{errors.cvv}</p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="cardName">Cardholder Name</Label>
              <Input
                id="cardName"
                value={cardDetails.name}
                onChange={(e) => handleCardInputChange('name', e.target.value)}
                placeholder="John Doe"
                className={errors.cardName ? 'border-red-300' : ''}
              />
              {errors.cardName && (
                <p className="text-red-600 text-sm mt-1">{errors.cardName}</p>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="saveCard"
                checked={saveCard}
                onCheckedChange={(checked) => setSaveCard(checked === true)}
              />
              <Label htmlFor="saveCard" className="text-sm cursor-pointer">
                Save this card for future payments
              </Label>
            </div>
          </div>
        </div>
      )}

      {/* Payment Button */}
      <div className="space-y-4">
        <Button
          onClick={handlePayment}
          disabled={isProcessing || !paymentReady}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3"
          size="lg"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Processing Payment...
            </>
          ) : (
            <>
              <Lock className="w-4 h-4 mr-2" />
              Pay {razorpay.formatCurrency(amount, currency)}
            </>
          )}
        </Button>

        {/* Security Info */}
        <div className="flex items-center justify-center space-x-4 text-sm text-gray-600">
          <div className="flex items-center space-x-1">
            <Shield className="w-4 h-4 text-green-600" />
            <span>256-bit SSL</span>
          </div>
          <div className="flex items-center space-x-1">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span>PCI Compliant</span>
          </div>
        </div>

        {/* Payment Note */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <div className="flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5" />
            <div className="text-sm text-yellow-800">
              <p className="font-medium mb-1">Secure Payment</p>
              <p>
                Your payment is secured by Razorpay. We never store your card details.
                All transactions are encrypted and processed securely.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}