'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { 
  RotateCcw, 
  Upload, 
  X, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Package,
  Camera,
  FileText
} from 'lucide-react'
import { toast } from 'sonner'
import { ReturnReason, ReturnRequest } from '@/lib/buyer-protection'

interface ReturnRequestFormProps {
  order: {
    id: string
    items: Array<{
      id: string
      productId: string
      name: string
      price: number
      quantity: number
      image: string
    }>
  }
  onSubmit: (returnRequest: Partial<ReturnRequest>) => Promise<void>
  className?: string
}

const RETURN_REASONS: { value: ReturnReason; label: string; description: string }[] = [
  {
    value: 'defective',
    label: 'Defective Item',
    description: 'Product has manufacturing defects or doesn\'t work properly'
  },
  {
    value: 'not_as_described',
    label: 'Not as Described',
    description: 'Item significantly different from product description or photos'
  },
  {
    value: 'damaged',
    label: 'Damaged in Shipping',
    description: 'Item was damaged during delivery'
  },
  {
    value: 'wrong_item',
    label: 'Wrong Item',
    description: 'Received different item than what was ordered'
  },
  {
    value: 'size_issue',
    label: 'Size/Fit Issue',
    description: 'Item doesn\'t fit as expected'
  },
  {
    value: 'not_satisfied',
    label: 'Not Satisfied',
    description: 'Product doesn\'t meet expectations'
  },
  {
    value: 'changed_mind',
    label: 'Changed Mind',
    description: 'No longer want/need the item'
  },
  {
    value: 'other',
    label: 'Other Reason',
    description: 'Please specify in description'
  }
]

export default function ReturnRequestForm({ 
  order, 
  onSubmit, 
  className = '' 
}: ReturnRequestFormProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<string>('')
  const [reason, setReason] = useState<ReturnReason>('not_satisfied')
  const [description, setDescription] = useState('')
  const [photos, setPhotos] = useState<File[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [step, setStep] = useState<'item' | 'reason' | 'details' | 'photos' | 'review'>('item')

  const selectedReasonInfo = RETURN_REASONS.find(r => r.value === reason)
  const selectedOrderItem = order.items.find(item => item.id === selectedItem)

  const handlePhotoUpload = (files: FileList | null) => {
    if (!files) return
    
    const newPhotos = Array.from(files).filter(file => {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} is too large. Max size is 5MB.`)
        return false
      }
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not a valid image file.`)
        return false
      }
      return true
    })

    if (photos.length + newPhotos.length > 5) {
      toast.error('You can upload maximum 5 photos.')
      return
    }

    setPhotos(prev => [...prev, ...newPhotos])
  }

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async () => {
    if (!selectedItem) {
      toast.error('Please select an item to return')
      return
    }

    if (!description.trim()) {
      toast.error('Please provide a description')
      return
    }

    setIsSubmitting(true)
    try {
      // Convert photos to URLs (in real app, upload to storage)
      const photoUrls = photos.map(photo => `https://storage.findora.com/returns/${Date.now()}_${photo.name}`)

      await onSubmit({
        orderId: order.id,
        orderItemId: selectedItem,
        reason,
        description: description.trim(),
        photos: photoUrls
      })

      toast.success('Return request submitted successfully!')
      setIsOpen(false)
      resetForm()
    } catch (error) {
      toast.error('Failed to submit return request')
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setSelectedItem('')
    setReason('not_satisfied')
    setDescription('')
    setPhotos([])
    setStep('item')
  }

  const canProceedToNext = () => {
    switch (step) {
      case 'item':
        return selectedItem !== ''
      case 'reason':
        return reason !== ''
      case 'details':
        return description.trim().length > 0
      case 'photos':
        return true // Photos are optional
      case 'review':
        return true
      default:
        return false
    }
  }

  const nextStep = () => {
    const steps: Array<typeof step> = ['item', 'reason', 'details', 'photos', 'review']
    const currentIndex = steps.indexOf(step)
    if (currentIndex < steps.length - 1) {
      setStep(steps[currentIndex + 1])
    }
  }

  const prevStep = () => {
    const steps: Array<typeof step> = ['item', 'reason', 'details', 'photos', 'review']
    const currentIndex = steps.indexOf(step)
    if (currentIndex > 0) {
      setStep(steps[currentIndex - 1])
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className={className}>
          <RotateCcw className="w-4 h-4 mr-2" />
          Request Return
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <RotateCcw className="w-5 h-5 mr-2" />
            Return Request
          </DialogTitle>
          <DialogDescription>
            Start a return request for your order items
          </DialogDescription>
        </DialogHeader>

        {/* Progress Indicator */}
        <div className="flex items-center justify-between mb-6">
          {['item', 'reason', 'details', 'photos', 'review'].map((s, index) => {
            const isActive = s === step
            const isCompleted = ['item', 'reason', 'details', 'photos', 'review'].indexOf(step) > index
            
            return (
              <div key={s} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ${
                  isCompleted ? 'bg-green-500 text-white' : 
                  isActive ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  {isCompleted ? <CheckCircle className="w-4 h-4" /> : index + 1}
                </div>
                {index < 4 && (
                  <div className={`w-12 h-0.5 ${
                    isCompleted ? 'bg-green-500' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            )
          })}
        </div>

        <div className="space-y-6">
          {/* Step 1: Select Item */}
          {step === 'item' && (
            <div>
              <h3 className="font-semibold mb-4">Select Item to Return</h3>
              <div className="space-y-3">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedItem === item.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedItem(item.id)}
                  >
                    <div className="flex items-center space-x-4">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h4 className="font-semibold">{item.name}</h4>
                        <p className="text-gray-600">Quantity: {item.quantity}</p>
                        <p className="font-semibold text-green-600">₹{item.price.toLocaleString()}</p>
                      </div>
                      <div className="flex-shrink-0">
                        <input
                          type="radio"
                          checked={selectedItem === item.id}
                          onChange={() => setSelectedItem(item.id)}
                          className="w-4 h-4"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Select Reason */}
          {step === 'reason' && (
            <div>
              <h3 className="font-semibold mb-4">Why are you returning this item?</h3>
              <div className="space-y-3">
                {RETURN_REASONS.map((reasonOption) => (
                  <div
                    key={reasonOption.value}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      reason === reasonOption.value ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setReason(reasonOption.value)}
                  >
                    <div className="flex items-start space-x-3">
                      <input
                        type="radio"
                        checked={reason === reasonOption.value}
                        onChange={() => setReason(reasonOption.value)}
                        className="mt-1"
                      />
                      <div>
                        <h4 className="font-semibold">{reasonOption.label}</h4>
                        <p className="text-sm text-gray-600">{reasonOption.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Details */}
          {step === 'details' && (
            <div>
              <h3 className="font-semibold mb-4">Provide Details</h3>
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Package className="w-5 h-5 text-gray-600" />
                    <div>
                      <p className="font-semibold">Selected Item</p>
                      <p className="text-sm text-gray-600">{selectedOrderItem?.name}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <AlertTriangle className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="font-semibold text-blue-900">Reason</p>
                      <p className="text-sm text-blue-800">{selectedReasonInfo?.label}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Detailed Description *</Label>
                  <Textarea
                    id="description"
                    placeholder="Please provide specific details about the issue..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    className="mt-1"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {description.length}/1000 characters
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Photos */}
          {step === 'photos' && (
            <div>
              <h3 className="font-semibold mb-4">Add Photos (Optional)</h3>
              <p className="text-sm text-gray-600 mb-4">
                Photos help us process your return faster. You can upload up to 5 photos.
              </p>

              <div className="space-y-4">
                {/* Upload Area */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                  <Camera className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-2">
                    Drag and drop photos here, or click to browse
                  </p>
                  <Input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => handlePhotoUpload(e.target.files)}
                    className="hidden"
                    id="photo-upload"
                  />
                  <Label 
                    htmlFor="photo-upload"
                    className="cursor-pointer inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Choose Photos
                  </Label>
                  <p className="text-xs text-gray-500 mt-2">
                    Max 5MB per photo. JPG, PNG supported.
                  </p>
                </div>

                {/* Photo Previews */}
                {photos.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {photos.map((photo, index) => (
                      <div key={index} className="relative">
                        <img
                          src={URL.createObjectURL(photo)}
                          alt={`Photo ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg border"
                        />
                        <button
                          type="button"
                          onClick={() => removePhoto(index)}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 5: Review */}
          {step === 'review' && (
            <div>
              <h3 className="font-semibold mb-4">Review Your Request</h3>
              <div className="space-y-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold">Item Details</h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setStep('item')}
                      >
                        Edit
                      </Button>
                    </div>
                    <div className="flex items-center space-x-3">
                      <img
                        src={selectedOrderItem?.image}
                        alt={selectedOrderItem?.name}
                        className="w-12 h-12 object-cover rounded"
                      />
                      <div>
                        <p className="font-medium">{selectedOrderItem?.name}</p>
                        <p className="text-sm text-gray-600">₹{selectedOrderItem?.price.toLocaleString()}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold">Return Reason</h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setStep('reason')}
                      >
                        Edit
                      </Button>
                    </div>
                    <Badge variant="outline" className="mb-2">
                      {selectedReasonInfo?.label}
                    </Badge>
                    <p className="text-sm text-gray-600">{selectedReasonInfo?.description}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold">Description</h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setStep('details')}
                      >
                        Edit
                      </Button>
                    </div>
                    <p className="text-sm text-gray-600">{description}</p>
                  </CardContent>
                </Card>

                {photos.length > 0 && (
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold">Photos ({photos.length})</h4>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setStep('photos')}
                        >
                          Edit
                        </Button>
                      </div>
                      <div className="grid grid-cols-4 gap-2">
                        {photos.slice(0, 4).map((photo, index) => (
                          <img
                            key={index}
                            src={URL.createObjectURL(photo)}
                            alt={`Photo ${index + 1}`}
                            className="w-16 h-16 object-cover rounded border"
                          />
                        ))}
                        {photos.length > 4 && (
                          <div className="w-16 h-16 bg-gray-100 rounded border flex items-center justify-center">
                            <span className="text-xs text-gray-600">+{photos.length - 4}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                  <div className="flex items-start space-x-3">
                    <Clock className="w-5 h-5 text-yellow-600 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-yellow-900">What happens next?</h4>
                      <ul className="text-sm text-yellow-800 mt-1 space-y-1">
                        <li>• The seller will review your request within 24 hours</li>
                        <li>• If approved, you'll receive return shipping instructions</li>
                        <li>• Refund will be processed once item is received and inspected</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-6">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={step === 'item'}
          >
            Previous
          </Button>

          <div className="space-x-2">
            {step !== 'review' ? (
              <Button
                onClick={nextStep}
                disabled={!canProceedToNext()}
              >
                Next
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Return Request'}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export { ReturnRequestForm }