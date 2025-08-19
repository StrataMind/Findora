'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import { PaymentData, ShippingData } from '@/app/checkout/page'
import { 
  CreditCard, 
  Smartphone,
  ArrowLeft,
  Lock,
  Wallet
} from 'lucide-react'

interface PaymentFormProps {
  shippingData: ShippingData
  initialData?: PaymentData | null
  onComplete: (data: PaymentData) => void
  onBack: () => void
  loading: boolean
}

const paymentMethods = [
  {
    id: 'card',
    name: 'Credit/Debit Card',
    description: 'Visa, Mastercard, American Express',
    icon: CreditCard
  },
  {
    id: 'paypal',
    name: 'PayPal',
    description: 'Pay with your PayPal account',
    icon: Wallet
  },
  {
    id: 'apple_pay',
    name: 'Apple Pay',
    description: 'Touch ID or Face ID',
    icon: Smartphone
  },
  {
    id: 'google_pay',
    name: 'Google Pay',
    description: 'Pay with Google',
    icon: Smartphone
  }
]

export default function PaymentForm({ 
  shippingData, 
  initialData, 
  onComplete, 
  onBack, 
  loading 
}: PaymentFormProps) {
  const [formData, setFormData] = useState<PaymentData>({
    method: initialData?.method || 'card',
    cardNumber: initialData?.cardNumber || '',
    expiryDate: initialData?.expiryDate || '',
    cvv: initialData?.cvv || '',
    cardholderName: initialData?.cardholderName || '',
    billingAddress: {
      sameAsShipping: initialData?.billingAddress?.sameAsShipping ?? true,
      address: initialData?.billingAddress?.address || '',
      city: initialData?.billingAddress?.city || '',
      state: initialData?.billingAddress?.state || '',
      zipCode: initialData?.billingAddress?.zipCode || '',
      country: initialData?.billingAddress?.country || 'US'
    }
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleInputChange = (field: string, value: string | boolean) => {
    if (field.startsWith('billingAddress.')) {
      const billingField = field.replace('billingAddress.', '')
      setFormData(prev => ({
        ...prev,
        billingAddress: {
          ...prev.billingAddress!,
          [billingField]: value
        }
      }))
    } else {
      setFormData(prev => ({ ...prev, [field]: value }))
    }
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const formatCardNumber = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '')
    // Add spaces every 4 digits
    return digits.replace(/(\d{4})(?=\d)/g, '$1 ')
  }

  const formatExpiryDate = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '')
    // Add slash after 2 digits
    if (digits.length >= 2) {
      return digits.substring(0, 2) + '/' + digits.substring(2, 4)
    }
    return digits
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (formData.method === 'card') {
      if (!formData.cardNumber?.trim()) {
        newErrors.cardNumber = 'Card number is required'
      } else if (formData.cardNumber.replace(/\s/g, '').length < 16) {
        newErrors.cardNumber = 'Please enter a valid card number'
      }
      
      if (!formData.expiryDate?.trim()) {
        newErrors.expiryDate = 'Expiry date is required'
      } else if (!/^\d{2}\/\d{2}$/.test(formData.expiryDate)) {
        newErrors.expiryDate = 'Please enter a valid expiry date (MM/YY)'
      }
      
      if (!formData.cvv?.trim()) {
        newErrors.cvv = 'CVV is required'
      } else if (formData.cvv.length < 3) {
        newErrors.cvv = 'Please enter a valid CVV'
      }
      
      if (!formData.cardholderName?.trim()) {
        newErrors.cardholderName = 'Cardholder name is required'
      }

      // Validate billing address if different from shipping
      if (!formData.billingAddress?.sameAsShipping) {
        if (!formData.billingAddress?.address?.trim()) {
          newErrors['billingAddress.address'] = 'Billing address is required'
        }
        if (!formData.billingAddress?.city?.trim()) {
          newErrors['billingAddress.city'] = 'Billing city is required'
        }
        if (!formData.billingAddress?.state?.trim()) {
          newErrors['billingAddress.state'] = 'Billing state is required'
        }
        if (!formData.billingAddress?.zipCode?.trim()) {
          newErrors['billingAddress.zipCode'] = 'Billing ZIP code is required'
        }
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (validateForm()) {
      onComplete(formData)
    }
  }

  const handlePaymentMethodChange = (method: string) => {
    setFormData(prev => ({ ...prev, method: method as PaymentData['method'] }))
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Payment Information</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Payment Method Selection */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Method</h3>
          <RadioGroup
            value={formData.method}
            onValueChange={handlePaymentMethodChange}
            className="space-y-3"
          >
            {paymentMethods.map((method) => {
              const Icon = method.icon
              return (
                <div
                  key={method.id}
                  className={`
                    flex items-center space-x-3 p-4 rounded-lg border-2 transition-colors
                    ${formData.method === method.id 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                    }
                  `}
                >
                  <RadioGroupItem value={method.id} id={method.id} />
                  <div className="flex items-center space-x-3 flex-1">
                    <Icon className="w-5 h-5 text-gray-600" />
                    <div className="flex-1">
                      <label htmlFor={method.id} className="font-medium text-gray-900 cursor-pointer">
                        {method.name}
                      </label>
                      <p className="text-sm text-gray-600">{method.description}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </RadioGroup>
        </div>

        {/* Card Details */}
        {formData.method === 'card' && (
          <div className="space-y-4">
            <div className="flex items-center space-x-2 mb-4">
              <Lock className="w-4 h-4 text-green-600" />
              <span className="text-sm text-gray-600">Your payment information is secure and encrypted</span>
            </div>
            
            <div>
              <Label htmlFor="cardNumber">Card Number *</Label>
              <Input
                id="cardNumber"
                type="text"
                value={formData.cardNumber}
                onChange={(e) => {
                  const formatted = formatCardNumber(e.target.value)
                  if (formatted.replace(/\s/g, '').length <= 16) {
                    handleInputChange('cardNumber', formatted)
                  }
                }}
                className={errors.cardNumber ? 'border-red-300' : ''}
                placeholder="1234 5678 9012 3456"
                maxLength={19}
              />
              {errors.cardNumber && (
                <p className="text-red-600 text-sm mt-1">{errors.cardNumber}</p>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="expiryDate">Expiry Date *</Label>
                <Input
                  id="expiryDate"
                  type="text"
                  value={formData.expiryDate}
                  onChange={(e) => {
                    const formatted = formatExpiryDate(e.target.value)
                    if (formatted.replace(/\D/g, '').length <= 4) {
                      handleInputChange('expiryDate', formatted)
                    }
                  }}
                  className={errors.expiryDate ? 'border-red-300' : ''}
                  placeholder="MM/YY"
                  maxLength={5}
                />
                {errors.expiryDate && (
                  <p className="text-red-600 text-sm mt-1">{errors.expiryDate}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="cvv">CVV *</Label>
                <Input
                  id="cvv"
                  type="text"
                  value={formData.cvv}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '')
                    if (value.length <= 4) {
                      handleInputChange('cvv', value)
                    }
                  }}
                  className={errors.cvv ? 'border-red-300' : ''}
                  placeholder="123"
                  maxLength={4}
                />
                {errors.cvv && (
                  <p className="text-red-600 text-sm mt-1">{errors.cvv}</p>
                )}
              </div>
            </div>
            
            <div>
              <Label htmlFor="cardholderName">Cardholder Name *</Label>
              <Input
                id="cardholderName"
                type="text"
                value={formData.cardholderName}
                onChange={(e) => handleInputChange('cardholderName', e.target.value)}
                className={errors.cardholderName ? 'border-red-300' : ''}
                placeholder="John Doe"
              />
              {errors.cardholderName && (
                <p className="text-red-600 text-sm mt-1">{errors.cardholderName}</p>
              )}
            </div>
          </div>
        )}

        {/* Alternative Payment Methods */}
        {formData.method !== 'card' && (
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-gray-600">
              You will be redirected to complete your payment with{' '}
              {paymentMethods.find(m => m.id === formData.method)?.name}.
            </p>
          </div>
        )}

        {/* Billing Address */}
        {formData.method === 'card' && (
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Billing Address</h3>
            
            <div className="flex items-center space-x-2 mb-4">
              <Checkbox
                id="sameAsShipping"
                checked={formData.billingAddress?.sameAsShipping}
                onCheckedChange={(checked) => 
                  handleInputChange('billingAddress.sameAsShipping', checked === true)
                }
              />
              <Label htmlFor="sameAsShipping">Same as shipping address</Label>
            </div>
            
            {!formData.billingAddress?.sameAsShipping && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="billingAddress">Street Address *</Label>
                  <Input
                    id="billingAddress"
                    type="text"
                    value={formData.billingAddress?.address || ''}
                    onChange={(e) => handleInputChange('billingAddress.address', e.target.value)}
                    className={errors['billingAddress.address'] ? 'border-red-300' : ''}
                    placeholder="123 Main Street"
                  />
                  {errors['billingAddress.address'] && (
                    <p className="text-red-600 text-sm mt-1">{errors['billingAddress.address']}</p>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="billingCity">City *</Label>
                    <Input
                      id="billingCity"
                      type="text"
                      value={formData.billingAddress?.city || ''}
                      onChange={(e) => handleInputChange('billingAddress.city', e.target.value)}
                      className={errors['billingAddress.city'] ? 'border-red-300' : ''}
                      placeholder="New York"
                    />
                    {errors['billingAddress.city'] && (
                      <p className="text-red-600 text-sm mt-1">{errors['billingAddress.city']}</p>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="billingState">State *</Label>
                    <Input
                      id="billingState"
                      type="text"
                      value={formData.billingAddress?.state || ''}
                      onChange={(e) => handleInputChange('billingAddress.state', e.target.value)}
                      className={errors['billingAddress.state'] ? 'border-red-300' : ''}
                      placeholder="NY"
                    />
                    {errors['billingAddress.state'] && (
                      <p className="text-red-600 text-sm mt-1">{errors['billingAddress.state']}</p>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="billingZipCode">ZIP Code *</Label>
                    <Input
                      id="billingZipCode"
                      type="text"
                      value={formData.billingAddress?.zipCode || ''}
                      onChange={(e) => handleInputChange('billingAddress.zipCode', e.target.value)}
                      className={errors['billingAddress.zipCode'] ? 'border-red-300' : ''}
                      placeholder="10001"
                    />
                    {errors['billingAddress.zipCode'] && (
                      <p className="text-red-600 text-sm mt-1">{errors['billingAddress.zipCode']}</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-between pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            disabled={loading}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Shipping
          </Button>
          
          <Button
            type="submit"
            disabled={loading}
            size="lg"
            className="bg-blue-600 hover:bg-blue-700"
          >
            {loading ? 'Processing...' : 'Review Order'}
          </Button>
        </div>
      </form>
    </div>
  )
}