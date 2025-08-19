'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Scale, 
  Upload, 
  X, 
  AlertTriangle, 
  CheckCircle, 
  FileText,
  Image as ImageIcon,
  MessageSquare,
  DollarSign,
  Clock,
  Shield
} from 'lucide-react'
import { toast } from 'sonner'
import { DisputeType, Dispute } from '@/lib/buyer-protection'

interface DisputeFormProps {
  order: {
    id: string
    total: number
    items: Array<{
      id: string
      name: string
      price: number
      image: string
    }>
  }
  onSubmit: (dispute: Partial<Dispute>) => Promise<void>
  className?: string
}

const DISPUTE_TYPES: { value: DisputeType; label: string; description: string; icon: any }[] = [
  {
    value: 'item_not_received',
    label: 'Item Not Received',
    description: 'You haven\'t received your order within expected delivery time',
    icon: Clock
  },
  {
    value: 'item_not_as_described',
    label: 'Item Not as Described',
    description: 'The item you received is significantly different from what was advertised',
    icon: AlertTriangle
  },
  {
    value: 'refund_not_received',
    label: 'Refund Not Received',
    description: 'You haven\'t received a promised refund or return credit',
    icon: DollarSign
  },
  {
    value: 'seller_unresponsive',
    label: 'Seller Unresponsive',
    description: 'The seller isn\'t responding to messages or return requests',
    icon: MessageSquare
  },
  {
    value: 'quality_issue',
    label: 'Quality Issue',
    description: 'The item has quality problems or defects not mentioned in description',
    icon: Shield
  },
  {
    value: 'service_issue',
    label: 'Service Issue',
    description: 'Poor customer service or unfair treatment by the seller',
    icon: AlertTriangle
  }
]

interface EvidenceFile {
  file: File
  type: 'image' | 'document'
  title: string
  description: string
}

export default function DisputeForm({ 
  order, 
  onSubmit, 
  className = '' 
}: DisputeFormProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [step, setStep] = useState<'type' | 'details' | 'evidence' | 'review'>('type')
  const [disputeType, setDisputeType] = useState<DisputeType>('item_not_received')
  const [subject, setSubject] = useState('')
  const [description, setDescription] = useState('')
  const [disputeAmount, setDisputeAmount] = useState(order.total)
  const [evidence, setEvidence] = useState<EvidenceFile[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const selectedDisputeType = DISPUTE_TYPES.find(t => t.value === disputeType)

  const handleEvidenceUpload = (files: FileList | null) => {
    if (!files) return

    Array.from(files).forEach(file => {
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name} is too large. Max size is 10MB.`)
        return
      }

      const isImage = file.type.startsWith('image/')
      const isDocument = file.type === 'application/pdf' || file.type.startsWith('application/')

      if (!isImage && !isDocument) {
        toast.error(`${file.name} is not a supported file type.`)
        return
      }

      if (evidence.length >= 10) {
        toast.error('You can upload maximum 10 files.')
        return
      }

      setEvidence(prev => [...prev, {
        file,
        type: isImage ? 'image' : 'document',
        title: file.name.replace(/\.[^/.]+$/, ''),
        description: ''
      }])
    })
  }

  const removeEvidence = (index: number) => {
    setEvidence(prev => prev.filter((_, i) => i !== index))
  }

  const updateEvidenceDetails = (index: number, title: string, description: string) => {
    setEvidence(prev => prev.map((item, i) => 
      i === index ? { ...item, title, description } : item
    ))
  }

  const handleSubmit = async () => {
    if (!subject.trim() || !description.trim()) {
      toast.error('Please fill in all required fields')
      return
    }

    setIsSubmitting(true)
    try {
      // In real app, upload evidence files first
      const evidenceData = evidence.map(ev => ({
        type: ev.type,
        title: ev.title,
        description: ev.description,
        fileUrl: `https://storage.findora.com/disputes/${Date.now()}_${ev.file.name}` // Mock URL
      }))

      await onSubmit({
        orderId: order.id,
        type: disputeType,
        subject: subject.trim(),
        description: description.trim(),
        disputeAmount,
        evidence: evidenceData
      })

      toast.success('Dispute submitted successfully!')
      setIsOpen(false)
      resetForm()
    } catch (error) {
      toast.error('Failed to submit dispute')
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setStep('type')
    setDisputeType('item_not_received')
    setSubject('')
    setDescription('')
    setDisputeAmount(order.total)
    setEvidence([])
  }

  const canProceedToNext = () => {
    switch (step) {
      case 'type':
        return disputeType !== ''
      case 'details':
        return subject.trim().length > 0 && description.trim().length > 0
      case 'evidence':
        return true // Evidence is optional
      case 'review':
        return true
      default:
        return false
    }
  }

  const nextStep = () => {
    const steps: Array<typeof step> = ['type', 'details', 'evidence', 'review']
    const currentIndex = steps.indexOf(step)
    if (currentIndex < steps.length - 1) {
      setStep(steps[currentIndex + 1])
    }
  }

  const prevStep = () => {
    const steps: Array<typeof step> = ['type', 'details', 'evidence', 'review']
    const currentIndex = steps.indexOf(step)
    if (currentIndex > 0) {
      setStep(steps[currentIndex - 1])
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className={`text-red-600 border-red-200 hover:bg-red-50 ${className}`}>
          <Scale className="w-4 h-4 mr-2" />
          Open Dispute
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Scale className="w-5 h-5 mr-2" />
            Open Dispute
          </DialogTitle>
          <DialogDescription>
            If you have an issue with your order that couldn't be resolved with the seller, you can open a dispute for investigation.
          </DialogDescription>
        </DialogHeader>

        {/* Progress Indicator */}
        <div className="flex items-center justify-between mb-6">
          {['type', 'details', 'evidence', 'review'].map((s, index) => {
            const isActive = s === step
            const isCompleted = ['type', 'details', 'evidence', 'review'].indexOf(step) > index
            
            return (
              <div key={s} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold ${
                  isCompleted ? 'bg-green-500 text-white' : 
                  isActive ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  {isCompleted ? <CheckCircle className="w-4 h-4" /> : index + 1}
                </div>
                {index < 3 && (
                  <div className={`w-16 h-0.5 ${
                    isCompleted ? 'bg-green-500' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            )
          })}
        </div>

        <div className="space-y-6">
          {/* Step 1: Dispute Type */}
          {step === 'type' && (
            <div>
              <h3 className="font-semibold mb-4">What kind of issue are you experiencing?</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {DISPUTE_TYPES.map((type) => {
                  const Icon = type.icon
                  return (
                    <div
                      key={type.value}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        disputeType === type.value ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setDisputeType(type.value)}
                    >
                      <div className="flex items-start space-x-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          disputeType === type.value ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'
                        }`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold mb-1">{type.label}</h4>
                          <p className="text-sm text-gray-600">{type.description}</p>
                        </div>
                        <input
                          type="radio"
                          checked={disputeType === type.value}
                          onChange={() => setDisputeType(type.value)}
                          className="mt-1"
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Step 2: Details */}
          {step === 'details' && (
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold mb-4">Provide Details</h3>
                
                {/* Order Summary */}
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle className="text-sm">Order Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between mb-4">
                      <span>Order ID:</span>
                      <Badge variant="outline">{order.id}</Badge>
                    </div>
                    <div className="flex items-center justify-between mb-4">
                      <span>Order Total:</span>
                      <span className="font-semibold">₹{order.total.toLocaleString()}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium mb-2">Items:</p>
                      <div className="space-y-2">
                        {order.items.map(item => (
                          <div key={item.id} className="flex items-center space-x-3 text-sm">
                            <img src={item.image} alt={item.name} className="w-8 h-8 object-cover rounded" />
                            <span className="flex-1">{item.name}</span>
                            <span>₹{item.price.toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Selected Dispute Type */}
                <div className="bg-red-50 p-4 rounded-lg border border-red-200 mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                      {selectedDisputeType && <selectedDisputeType.icon className="w-5 h-5 text-red-600" />}
                    </div>
                    <div>
                      <p className="font-semibold text-red-900">{selectedDisputeType?.label}</p>
                      <p className="text-sm text-red-800">{selectedDisputeType?.description}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="subject">Subject *</Label>
                    <Input
                      id="subject"
                      placeholder="Brief summary of the issue"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="amount">Dispute Amount (₹) *</Label>
                    <Input
                      id="amount"
                      type="number"
                      min="0"
                      max={order.total}
                      value={disputeAmount}
                      onChange={(e) => setDisputeAmount(Number(e.target.value))}
                      className="mt-1"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Maximum: ₹{order.total.toLocaleString()}
                    </p>
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Detailed Description *</Label>
                  <Textarea
                    id="description"
                    placeholder="Please provide a detailed explanation of the issue, including timeline and any attempts to resolve with the seller..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={6}
                    className="mt-1"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {description.length}/2000 characters
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Evidence */}
          {step === 'evidence' && (
            <div>
              <h3 className="font-semibold mb-4">Add Evidence (Recommended)</h3>
              <p className="text-sm text-gray-600 mb-6">
                Adding evidence like screenshots, photos, emails, or documents will help us resolve your dispute faster.
              </p>

              {/* Upload Area */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors mb-6">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-lg font-medium text-gray-700 mb-2">Upload Evidence</p>
                <p className="text-sm text-gray-600 mb-4">
                  Drag and drop files here, or click to browse
                </p>
                <Input
                  type="file"
                  accept="image/*,.pdf,.doc,.docx"
                  multiple
                  onChange={(e) => handleEvidenceUpload(e.target.files)}
                  className="hidden"
                  id="evidence-upload"
                />
                <Label 
                  htmlFor="evidence-upload"
                  className="cursor-pointer inline-flex items-center px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Choose Files
                </Label>
                <p className="text-xs text-gray-500 mt-3">
                  Supported: Images (JPG, PNG), Documents (PDF, DOC) • Max 10MB per file • Up to 10 files
                </p>
              </div>

              {/* Evidence List */}
              {evidence.length > 0 && (
                <div className="space-y-4">
                  <h4 className="font-medium">Uploaded Evidence ({evidence.length}/10)</h4>
                  {evidence.map((item, index) => (
                    <Card key={index}>
                      <CardContent className="p-4">
                        <div className="flex items-start space-x-4">
                          <div className="flex-shrink-0">
                            {item.type === 'image' ? (
                              <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
                                <img
                                  src={URL.createObjectURL(item.file)}
                                  alt="Evidence"
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            ) : (
                              <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                                <FileText className="w-8 h-8 text-gray-600" />
                              </div>
                            )}
                          </div>
                          
                          <div className="flex-1 space-y-3">
                            <div>
                              <Input
                                placeholder="Evidence title"
                                value={item.title}
                                onChange={(e) => updateEvidenceDetails(index, e.target.value, item.description)}
                              />
                            </div>
                            <div>
                              <Textarea
                                placeholder="Describe what this evidence shows..."
                                value={item.description}
                                onChange={(e) => updateEvidenceDetails(index, item.title, e.target.value)}
                                rows={2}
                              />
                            </div>
                            <div className="flex items-center justify-between text-sm text-gray-500">
                              <span>{item.file.name} • {(item.file.size / 1024 / 1024).toFixed(2)} MB</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeEvidence(index)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 4: Review */}
          {step === 'review' && (
            <div>
              <h3 className="font-semibold mb-4">Review Your Dispute</h3>
              <div className="space-y-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold">Dispute Type</h4>
                      <Button variant="ghost" size="sm" onClick={() => setStep('type')}>
                        Edit
                      </Button>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                        {selectedDisputeType && <selectedDisputeType.icon className="w-5 h-5 text-red-600" />}
                      </div>
                      <div>
                        <p className="font-medium">{selectedDisputeType?.label}</p>
                        <p className="text-sm text-gray-600">{selectedDisputeType?.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold">Details</h4>
                      <Button variant="ghost" size="sm" onClick={() => setStep('details')}>
                        Edit
                      </Button>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Subject:</span>
                        <span className="font-medium">{subject}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Dispute Amount:</span>
                        <span className="font-medium">₹{disputeAmount.toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t">
                      <p className="text-sm text-gray-600">{description}</p>
                    </div>
                  </CardContent>
                </Card>

                {evidence.length > 0 && (
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold">Evidence ({evidence.length} files)</h4>
                        <Button variant="ghost" size="sm" onClick={() => setStep('evidence')}>
                          Edit
                        </Button>
                      </div>
                      <div className="grid grid-cols-4 gap-2">
                        {evidence.slice(0, 8).map((item, index) => (
                          <div key={index} className="relative">
                            {item.type === 'image' ? (
                              <img
                                src={URL.createObjectURL(item.file)}
                                alt={item.title}
                                className="w-full h-16 object-cover rounded border"
                              />
                            ) : (
                              <div className="w-full h-16 bg-gray-100 rounded border flex items-center justify-center">
                                <FileText className="w-6 h-6 text-gray-600" />
                              </div>
                            )}
                          </div>
                        ))}
                        {evidence.length > 8 && (
                          <div className="w-full h-16 bg-gray-100 rounded border flex items-center justify-center">
                            <span className="text-xs text-gray-600">+{evidence.length - 8}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                  <div className="flex items-start space-x-3">
                    <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-amber-900">Important Information</h4>
                      <ul className="text-sm text-amber-800 mt-2 space-y-1">
                        <li>• Once submitted, the seller will be notified and can respond within 5 business days</li>
                        <li>• Our mediation team will review all evidence and communications</li>
                        <li>• Dispute resolution typically takes 7-14 business days</li>
                        <li>• False or fraudulent disputes may result in account restrictions</li>
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
            disabled={step === 'type'}
          >
            Previous
          </Button>

          <div className="space-x-2">
            {step !== 'review' ? (
              <Button
                onClick={nextStep}
                disabled={!canProceedToNext()}
                className="bg-red-600 hover:bg-red-700"
              >
                Next
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="bg-red-600 hover:bg-red-700"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Dispute'}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export { DisputeForm }