'use client'
export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Shield, 
  RotateCcw, 
  Scale, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  DollarSign,
  FileText,
  MessageSquare,
  Award,
  Zap,
  Star,
  TrendingUp
} from 'lucide-react'
import { format } from 'date-fns'
import { toast } from 'sonner'

// Import our protection components
import { ReturnRequestForm } from '@/components/protection/return-request-form'
import { DisputeForm } from '@/components/protection/dispute-form'

// Import types
import { 
  ReturnRequest, 
  Dispute, 
  BuyerProtectionCoverage, 
  ProtectionType,
  PROTECTION_PLANS 
} from '@/lib/buyer-protection'

// Mock data (in production, this would come from API)
const mockReturns: ReturnRequest[] = [
  {
    id: 'return_1',
    orderId: 'order_123',
    orderItemId: 'item_1',
    buyerId: 'buyer_456',
    sellerId: 'seller_789',
    productId: 'product_1',
    reason: 'defective',
    description: 'Product stopped working after 2 days of use',
    status: 'approved',
    returnPolicyId: 'policy_1',
    requestDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    approvalDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    refundAmount: 1299,
    restockingFee: 0,
    refundMethod: 'original_payment',
    photos: [],
    messages: [],
    timeline: [],
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
  },
  {
    id: 'return_2',
    orderId: 'order_124',
    orderItemId: 'item_2',
    buyerId: 'buyer_456',
    sellerId: 'seller_790',
    productId: 'product_2',
    reason: 'not_as_described',
    description: 'Color is different from what was shown in photos',
    status: 'pending',
    returnPolicyId: 'policy_2',
    requestDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    refundAmount: 899,
    restockingFee: 0,
    refundMethod: 'original_payment',
    photos: [],
    messages: [],
    timeline: [],
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
  }
]

const mockDisputes: Dispute[] = [
  {
    id: 'dispute_1',
    orderId: 'order_125',
    buyerId: 'buyer_456',
    sellerId: 'seller_791',
    type: 'item_not_received',
    status: 'under_review',
    subject: 'Order not delivered after 15 days',
    description: 'I ordered this item 15 days ago but haven\'t received it yet. Tracking shows no updates.',
    disputeAmount: 2499,
    evidence: [],
    messages: [],
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
  }
]

const mockProtectionCoverage: BuyerProtectionCoverage[] = [
  {
    id: 'protection_1',
    orderId: 'order_123',
    buyerId: 'buyer_456',
    type: 'premium',
    coverageAmount: 5000,
    premium: 65,
    features: PROTECTION_PLANS.premium.features,
    validUntil: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
    claimsUsed: 1,
    maxClaims: 5,
    isActive: true,
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
  },
  {
    id: 'protection_2',
    orderId: 'order_124',
    buyerId: 'buyer_456',
    type: 'standard',
    coverageAmount: 2000,
    features: PROTECTION_PLANS.standard.features,
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    claimsUsed: 0,
    maxClaims: 3,
    isActive: true,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
  }
]

const mockOrders = [
  {
    id: 'order_126',
    total: 3499,
    items: [
      { id: 'item_3', name: 'Wireless Headphones', price: 2999, image: '/api/placeholder/100/100' },
      { id: 'item_4', name: 'Phone Case', price: 500, image: '/api/placeholder/100/100' }
    ]
  }
]

export default function BuyerProtectionPage() {
  const { data: session } = useSession()
  const [returns, setReturns] = useState<ReturnRequest[]>(mockReturns)
  const [disputes, setDisputes] = useState<Dispute[]>(mockDisputes)
  const [protectionCoverage, setProtectionCoverage] = useState<BuyerProtectionCoverage[]>(mockProtectionCoverage)
  const [loading, setLoading] = useState(false)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
      case 'completed':
      case 'resolved':
        return 'bg-green-100 text-green-800 border-green-300'
      case 'pending':
      case 'under_review':
      case 'in_transit':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'rejected':
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-300'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
      case 'completed':
      case 'resolved':
        return CheckCircle
      case 'pending':
      case 'under_review':
      case 'in_transit':
        return Clock
      case 'rejected':
      case 'cancelled':
        return AlertTriangle
      default:
        return Clock
    }
  }

  const handleReturnSubmit = async (returnRequest: Partial<ReturnRequest>) => {
    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const newReturn: ReturnRequest = {
      id: `return_${Date.now()}`,
      buyerId: session?.user?.id || '',
      sellerId: 'seller_mock',
      productId: 'product_mock',
      status: 'pending',
      returnPolicyId: 'policy_mock',
      requestDate: new Date(),
      refundAmount: 0,
      restockingFee: 0,
      refundMethod: 'original_payment',
      photos: [],
      messages: [],
      timeline: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      ...returnRequest
    } as ReturnRequest

    setReturns(prev => [newReturn, ...prev])
  }

  const handleDisputeSubmit = async (dispute: Partial<Dispute>) => {
    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const newDispute: Dispute = {
      id: `dispute_${Date.now()}`,
      buyerId: session?.user?.id || '',
      sellerId: 'seller_mock',
      status: 'open',
      evidence: [],
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      ...dispute
    } as Dispute

    setDisputes(prev => [newDispute, ...prev])
  }

  const getProtectionStats = () => {
    const totalCoverage = protectionCoverage.reduce((sum, p) => sum + p.coverageAmount, 0)
    const totalPremiums = protectionCoverage.reduce((sum, p) => sum + (p.premium || 0), 0)
    const activePolicies = protectionCoverage.filter(p => p.isActive).length
    const totalClaims = protectionCoverage.reduce((sum, p) => sum + p.claimsUsed, 0)

    return { totalCoverage, totalPremiums, activePolicies, totalClaims }
  }

  const stats = getProtectionStats()

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Buyer Protection</h1>
          <p className="text-gray-600 mt-2">Manage your returns, disputes, and protection coverage</p>
        </div>
        <div className="flex items-center space-x-4">
          <ReturnRequestForm 
            order={mockOrders[0]}
            onSubmit={handleReturnSubmit}
          />
          <DisputeForm 
            order={mockOrders[0]}
            onSubmit={handleDisputeSubmit}
          />
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2 mb-2">
              <Shield className="w-5 h-5 text-blue-600" />
              <span className="font-semibold">Total Coverage</span>
            </div>
            <p className="text-2xl font-bold">₹{stats.totalCoverage.toLocaleString()}</p>
            <p className="text-sm text-gray-600">{stats.activePolicies} active policies</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2 mb-2">
              <RotateCcw className="w-5 h-5 text-green-600" />
              <span className="font-semibold">Returns</span>
            </div>
            <p className="text-2xl font-bold">{returns.length}</p>
            <p className="text-sm text-gray-600">
              {returns.filter(r => r.status === 'completed').length} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2 mb-2">
              <Scale className="w-5 h-5 text-red-600" />
              <span className="font-semibold">Disputes</span>
            </div>
            <p className="text-2xl font-bold">{disputes.length}</p>
            <p className="text-sm text-gray-600">
              {disputes.filter(d => d.status === 'resolved').length} resolved
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2 mb-2">
              <DollarSign className="w-5 h-5 text-purple-600" />
              <span className="font-semibold">Total Claims</span>
            </div>
            <p className="text-2xl font-bold">{stats.totalClaims}</p>
            <p className="text-sm text-gray-600">₹{stats.totalPremiums.toFixed(2)} in premiums</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="returns" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="returns">Returns</TabsTrigger>
          <TabsTrigger value="disputes">Disputes</TabsTrigger>
          <TabsTrigger value="protection">Protection</TabsTrigger>
          <TabsTrigger value="policies">Policies</TabsTrigger>
        </TabsList>

        {/* Returns Tab */}
        <TabsContent value="returns">
          <Card>
            <CardHeader>
              <CardTitle>Return Requests</CardTitle>
            </CardHeader>
            <CardContent>
              {returns.length > 0 ? (
                <div className="space-y-4">
                  {returns.map((returnRequest) => {
                    const StatusIcon = getStatusIcon(returnRequest.status)
                    
                    return (
                      <div key={returnRequest.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                              <RotateCcw className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                              <h4 className="font-semibold">Return #{returnRequest.id}</h4>
                              <p className="text-sm text-gray-600">
                                Order: {returnRequest.orderId}
                              </p>
                            </div>
                          </div>
                          <Badge className={`${getStatusColor(returnRequest.status)} border`}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {returnRequest.status.replace('_', ' ')}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-600">Reason</p>
                            <p className="font-medium">
                              {returnRequest.reason.replace('_', ' ').split(' ').map(word => 
                                word.charAt(0).toUpperCase() + word.slice(1)
                              ).join(' ')}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Refund Amount</p>
                            <p className="font-medium">₹{returnRequest.refundAmount.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Requested</p>
                            <p className="font-medium">{format(returnRequest.requestDate, 'MMM dd, yyyy')}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Status</p>
                            <p className="font-medium capitalize">{returnRequest.status.replace('_', ' ')}</p>
                          </div>
                        </div>
                        
                        <div className="mt-4 pt-4 border-t">
                          <p className="text-sm text-gray-600 mb-2">Description:</p>
                          <p className="text-sm">{returnRequest.description}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <RotateCcw className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Return Requests</h3>
                  <p className="text-gray-600 mb-4">You haven't submitted any return requests yet</p>
                  <ReturnRequestForm 
                    order={mockOrders[0]}
                    onSubmit={handleReturnSubmit}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Disputes Tab */}
        <TabsContent value="disputes">
          <Card>
            <CardHeader>
              <CardTitle>Dispute Cases</CardTitle>
            </CardHeader>
            <CardContent>
              {disputes.length > 0 ? (
                <div className="space-y-4">
                  {disputes.map((dispute) => {
                    const StatusIcon = getStatusIcon(dispute.status)
                    
                    return (
                      <div key={dispute.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
                              <Scale className="w-5 h-5 text-red-600" />
                            </div>
                            <div>
                              <h4 className="font-semibold">{dispute.subject}</h4>
                              <p className="text-sm text-gray-600">
                                Case #{dispute.id}
                              </p>
                            </div>
                          </div>
                          <Badge className={`${getStatusColor(dispute.status)} border`}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {dispute.status.replace('_', ' ')}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-600">Dispute Type</p>
                            <p className="font-medium">
                              {dispute.type.replace('_', ' ').split(' ').map(word => 
                                word.charAt(0).toUpperCase() + word.slice(1)
                              ).join(' ')}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Dispute Amount</p>
                            <p className="font-medium">₹{dispute.disputeAmount.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Created</p>
                            <p className="font-medium">{format(dispute.createdAt, 'MMM dd, yyyy')}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Order</p>
                            <p className="font-medium">{dispute.orderId}</p>
                          </div>
                        </div>
                        
                        <div className="mt-4 pt-4 border-t">
                          <p className="text-sm text-gray-600 mb-2">Description:</p>
                          <p className="text-sm">{dispute.description}</p>
                        </div>
                        
                        <div className="mt-4 flex items-center space-x-2">
                          <Button variant="outline" size="sm">
                            <MessageSquare className="w-4 h-4 mr-2" />
                            View Messages
                          </Button>
                          <Button variant="outline" size="sm">
                            <FileText className="w-4 h-4 mr-2" />
                            Add Evidence
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Scale className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Disputes</h3>
                  <p className="text-gray-600 mb-4">You haven't opened any dispute cases</p>
                  <DisputeForm 
                    order={mockOrders[0]}
                    onSubmit={handleDisputeSubmit}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Protection Tab */}
        <TabsContent value="protection">
          <div className="space-y-6">
            {protectionCoverage.map((coverage) => {
              const plan = PROTECTION_PLANS[coverage.type]
              const usagePercentage = (coverage.claimsUsed / coverage.maxClaims) * 100
              
              return (
                <Card key={coverage.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center">
                        <Shield className="w-5 h-5 mr-2" />
                        {plan.name}
                      </CardTitle>
                      <Badge className={coverage.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                        {coverage.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold mb-3">Coverage Details</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Order ID:</span>
                            <span className="font-medium">{coverage.orderId}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Coverage Amount:</span>
                            <span className="font-medium">₹{coverage.coverageAmount.toLocaleString()}</span>
                          </div>
                          {coverage.premium && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">Premium Paid:</span>
                              <span className="font-medium">₹{coverage.premium.toFixed(2)}</span>
                            </div>
                          )}
                          <div className="flex justify-between">
                            <span className="text-gray-600">Valid Until:</span>
                            <span className="font-medium">{format(coverage.validUntil, 'MMM dd, yyyy')}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold mb-3">Claims Usage</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between text-sm">
                            <span>Used Claims</span>
                            <span>{coverage.claimsUsed} / {coverage.maxClaims}</span>
                          </div>
                          <Progress value={usagePercentage} className="h-2" />
                        </div>
                        
                        <h4 className="font-semibold mb-3 mt-6">Features Included</h4>
                        <div className="grid grid-cols-2 gap-2">
                          {Object.entries(coverage.features).map(([feature, included]) => (
                            <div key={feature} className="flex items-center space-x-2">
                              <CheckCircle className={`w-4 h-4 ${included ? 'text-green-600' : 'text-gray-300'}`} />
                              <span className={`text-sm ${included ? 'text-gray-900' : 'text-gray-500'}`}>
                                {feature.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        {/* Policies Tab */}
        <TabsContent value="policies">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Available Protection Plans</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {Object.entries(PROTECTION_PLANS).map(([type, plan]) => (
                    <Card key={type} className={`relative ${type === 'premium' ? 'ring-2 ring-blue-500' : ''}`}>
                      {type === 'premium' && (
                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                          <Badge className="bg-blue-600 text-white">
                            <Star className="w-3 h-3 mr-1" />
                            Popular
                          </Badge>
                        </div>
                      )}
                      <CardHeader className="text-center">
                        <CardTitle className="text-lg">{plan.name}</CardTitle>
                        <div className="text-2xl font-bold">
                          {plan.premium === 0 ? 'Free' : `${plan.premium}%`}
                        </div>
                        <p className="text-sm text-gray-600">{plan.description}</p>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {Object.entries(plan.features).map(([feature, included]) => (
                            <div key={feature} className="flex items-center space-x-2">
                              <CheckCircle className={`w-4 h-4 ${included ? 'text-green-600' : 'text-gray-300'}`} />
                              <span className={`text-sm ${included ? 'text-gray-900' : 'text-gray-500'}`}>
                                {feature.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                              </span>
                            </div>
                          ))}
                        </div>
                        <div className="mt-4 pt-4 border-t">
                          <div className="text-sm text-gray-600 space-y-1">
                            <p>• Max Claims: {plan.maxClaims === 999 ? 'Unlimited' : plan.maxClaims}</p>
                            <p>• Coverage: {plan.coverageMultiplier}x order value</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Money-Back Guarantee</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <Award className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-green-900">30-Day Money-Back Guarantee</h3>
                      <p className="text-green-800">Available on all orders above ₹500</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-green-800">
                    <div>
                      <h4 className="font-semibold mb-2">What's Covered:</h4>
                      <ul className="space-y-1">
                        <li>• Product defects and damages</li>
                        <li>• Items not matching description</li>
                        <li>• Delivery failures and delays</li>
                        <li>• Seller fraud protection</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">How to Claim:</h4>
                      <ul className="space-y-1">
                        <li>• Contact seller first</li>
                        <li>• Submit return request if unresolved</li>
                        <li>• Open dispute if needed</li>
                        <li>• Full refund if claim is valid</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}