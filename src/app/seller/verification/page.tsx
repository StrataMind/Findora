'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { 
  Shield, 
  Upload, 
  FileText, 
  Award, 
  Clock, 
  CheckCircle,
  AlertTriangle,
  Info,
  Star,
  TrendingUp,
  Target,
  Camera
} from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'

// Import our verification components
import VerificationBadge, { TrustScoreBadge, VerificationStatus } from '@/components/verification/verification-badge'
import VerificationTimelineComponent from '@/components/verification/verification-timeline'
import TrustScoreDashboard from '@/components/verification/trust-score-dashboard'

// Import verification system types and data
import { 
  VerificationLevel, 
  VerificationStatus as VerificationStatusType,
  VerificationDocument,
  DocumentType,
  TrustScore,
  VerificationTimeline,
  VERIFICATION_BADGES,
  SellerVerificationProfile
} from '@/lib/verification-system'

// Mock data (in production, this would come from API)
const mockVerificationProfile: SellerVerificationProfile = {
  id: 'verification_123',
  sellerId: 'seller_456',
  currentLevel: 'silver',
  currentStatus: 'approved',
  trustScore: {
    overall: 78,
    factors: [
      {
        type: 'sales_volume',
        name: 'Sales Performance',
        description: 'Total sales volume and consistency',
        weight: 25,
        maxScore: 100,
        currentScore: 85,
        lastUpdated: new Date()
      },
      {
        type: 'customer_satisfaction',
        name: 'Customer Satisfaction',
        description: 'Average rating and review quality',
        weight: 30,
        maxScore: 100,
        currentScore: 92,
        lastUpdated: new Date()
      },
      {
        type: 'return_rate',
        name: 'Return Rate',
        description: 'Product return and refund rate',
        weight: 15,
        maxScore: 100,
        currentScore: 65,
        lastUpdated: new Date()
      },
      {
        type: 'response_time',
        name: 'Response Time',
        description: 'Customer inquiry response speed',
        weight: 10,
        maxScore: 100,
        currentScore: 88,
        lastUpdated: new Date()
      },
      {
        type: 'dispute_resolution',
        name: 'Dispute Resolution',
        description: 'Dispute handling and resolution rate',
        weight: 15,
        maxScore: 100,
        currentScore: 72,
        lastUpdated: new Date()
      },
      {
        type: 'compliance_score',
        name: 'Policy Compliance',
        description: 'Adherence to platform policies',
        weight: 5,
        maxScore: 100,
        currentScore: 95,
        lastUpdated: new Date()
      }
    ],
    history: [
      { score: 78, date: new Date(), reason: 'Monthly trust score update' },
      { score: 75, date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), reason: 'Improved customer satisfaction' },
      { score: 72, date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), reason: 'Silver badge upgrade bonus' },
      { score: 68, date: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), reason: 'Reduced return rate' }
    ],
    lastCalculated: new Date()
  },
  badges: [VERIFICATION_BADGES.silver],
  documents: [
    {
      id: 'doc_1',
      sellerId: 'seller_456',
      type: 'identity_proof',
      name: 'Aadhaar_Card.pdf',
      url: '#',
      status: 'approved',
      submittedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      reviewedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
      metadata: { fileSize: 1024000, mimeType: 'application/pdf' }
    },
    {
      id: 'doc_2',
      sellerId: 'seller_456',
      type: 'business_license',
      name: 'Business_Registration.pdf',
      url: '#',
      status: 'approved',
      submittedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      reviewedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
      metadata: { fileSize: 2048000, mimeType: 'application/pdf' }
    }
  ],
  timeline: [
    {
      id: 'timeline_1',
      sellerId: 'seller_456',
      event: 'badge_upgraded',
      level: 'silver',
      description: 'Upgraded to Silver Business Verified status',
      timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
    },
    {
      id: 'timeline_2',
      sellerId: 'seller_456',
      event: 'approved',
      description: 'Business license document approved',
      timestamp: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000)
    },
    {
      id: 'timeline_3',
      sellerId: 'seller_456',
      event: 'document_uploaded',
      description: 'Uploaded business registration document',
      timestamp: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000)
    }
  ],
  applicationDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
  lastReviewDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
  isEligibleForUpgrade: true,
  pendingRequirements: [
    {
      type: 'quality_certificate',
      name: 'Quality Certification',
      description: 'Product quality and safety certifications',
      required: true,
      level: 'gold',
      validityPeriod: 365,
      examples: ['ISO Certificate', 'CE Marking', 'BIS Certification']
    }
  ]
}

export default function SellerVerificationPage() {
  const { data: session } = useSession()
  const [profile, setProfile] = useState<SellerVerificationProfile>(mockVerificationProfile)
  const [loading, setLoading] = useState(false)
  const [uploadingDoc, setUploadingDoc] = useState(false)
  const [selectedDocType, setSelectedDocType] = useState<DocumentType>('quality_certificate')

  const handleDocumentUpload = async (file: File, type: DocumentType) => {
    setUploadingDoc(true)
    try {
      // Simulate upload delay
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      toast.success('Document uploaded successfully!')
      
      // Update profile with new document
      const newDoc: VerificationDocument = {
        id: `doc_${Date.now()}`,
        sellerId: profile.sellerId,
        type,
        name: file.name,
        url: '#',
        status: 'pending',
        submittedAt: new Date(),
        metadata: {
          fileSize: file.size,
          mimeType: file.type
        }
      }
      
      setProfile(prev => ({
        ...prev,
        documents: [...prev.documents, newDoc]
      }))
      
    } catch (error) {
      toast.error('Failed to upload document')
    } finally {
      setUploadingDoc(false)
    }
  }

  const getNextLevelRequirements = () => {
    if (profile.currentLevel === 'silver') {
      return VERIFICATION_BADGES.gold.requirements
    }
    if (profile.currentLevel === 'gold') {
      return VERIFICATION_BADGES.platinum.requirements
    }
    return []
  }

  const getProgressToNextLevel = () => {
    const nextRequirements = getNextLevelRequirements()
    if (nextRequirements.length === 0) return 100
    
    const completed = nextRequirements.filter(req => 
      profile.documents.some(doc => doc.type === req.type && doc.status === 'approved')
    )
    
    return (completed.length / nextRequirements.length) * 100
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Seller Verification</h1>
          <p className="text-gray-600 mt-2">Manage your verification status and build customer trust</p>
        </div>
        <div className="flex items-center space-x-4">
          <VerificationBadge 
            level={profile.currentLevel}
            status={profile.currentStatus}
            size="lg"
          />
          <TrustScoreBadge 
            score={profile.trustScore.overall} 
            size="lg"
          />
        </div>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2 mb-2">
              <Shield className="w-5 h-5 text-blue-600" />
              <span className="font-semibold">Verification Level</span>
            </div>
            <p className="text-2xl font-bold capitalize">{profile.currentLevel}</p>
            <p className="text-sm text-gray-600">
              {VERIFICATION_BADGES[profile.currentLevel].description}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2 mb-2">
              <Star className="w-5 h-5 text-yellow-600" />
              <span className="font-semibold">Trust Score</span>
            </div>
            <p className="text-2xl font-bold">{profile.trustScore.overall}/100</p>
            <p className="text-sm text-gray-600">
              Last updated: {format(profile.trustScore.lastCalculated, 'MMM dd')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2 mb-2">
              <FileText className="w-5 h-5 text-green-600" />
              <span className="font-semibold">Documents</span>
            </div>
            <p className="text-2xl font-bold">
              {profile.documents.filter(d => d.status === 'approved').length}/{profile.documents.length}
            </p>
            <p className="text-sm text-gray-600">Approved documents</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2 mb-2">
              <TrendingUp className="w-5 h-5 text-purple-600" />
              <span className="font-semibold">Next Level</span>
            </div>
            <p className="text-2xl font-bold">{getProgressToNextLevel().toFixed(0)}%</p>
            <p className="text-sm text-gray-600">Progress to next level</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="trust-score">Trust Score</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="upgrade">Upgrade</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Current Status */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Current Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <VerificationStatus 
                    status={profile.currentStatus}
                    level={profile.currentLevel}
                  />
                  
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-blue-900 mb-2">Current Benefits</h4>
                    <ul className="space-y-1 text-sm text-blue-800">
                      {VERIFICATION_BADGES[profile.currentLevel].benefits.map((benefit, index) => (
                        <li key={index} className="flex items-start">
                          <CheckCircle className="w-4 h-4 mr-2 mt-0.5 text-blue-600" />
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {profile.pendingRequirements.length > 0 && (
                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-yellow-900 mb-2">Pending Requirements</h4>
                      <ul className="space-y-2">
                        {profile.pendingRequirements.map((req, index) => (
                          <li key={index} className="text-sm text-yellow-800">
                            <div className="flex items-center">
                              <AlertTriangle className="w-4 h-4 mr-2 text-yellow-600" />
                              <span className="font-medium">{req.name}</span>
                            </div>
                            <p className="ml-6 text-xs text-yellow-700">{req.description}</p>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="w-full" disabled={uploadingDoc}>
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Document
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Upload Verification Document</DialogTitle>
                      <DialogDescription>
                        Upload a document to improve your verification status
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>Document Type</Label>
                        <select 
                          className="w-full mt-1 p-2 border rounded-md"
                          value={selectedDocType}
                          onChange={(e) => setSelectedDocType(e.target.value as DocumentType)}
                        >
                          <option value="quality_certificate">Quality Certificate</option>
                          <option value="tax_certificate">Tax Certificate</option>
                          <option value="bank_statement">Bank Statement</option>
                        </select>
                      </div>
                      <div>
                        <Label>Upload File</Label>
                        <Input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) {
                              handleDocumentUpload(file, selectedDocType)
                            }
                          }}
                        />
                        <p className="text-xs text-gray-600 mt-1">
                          Supported formats: PDF, JPG, PNG (Max 5MB)
                        </p>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                <Button variant="outline" className="w-full">
                  <Info className="w-4 h-4 mr-2" />
                  View Requirements
                </Button>

                <Button variant="outline" className="w-full">
                  <Award className="w-4 h-4 mr-2" />
                  Verification Guide
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents">
          <Card>
            <CardHeader>
              <CardTitle>Verification Documents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {profile.documents.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                        <FileText className="w-5 h-5 text-gray-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{doc.name}</h3>
                        <p className="text-sm text-gray-600">
                          {doc.type.replace('_', ' ').split(' ').map(word => 
                            word.charAt(0).toUpperCase() + word.slice(1)
                          ).join(' ')}
                        </p>
                        <p className="text-xs text-gray-500">
                          Submitted {format(doc.submittedAt, 'MMM dd, yyyy')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge 
                        variant={doc.status === 'approved' ? 'default' : 
                                doc.status === 'rejected' ? 'destructive' : 'secondary'}
                      >
                        {doc.status}
                      </Badge>
                      <p className="text-xs text-gray-500 mt-1">
                        {Math.round(doc.metadata?.fileSize! / 1024)} KB
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Trust Score Tab */}
        <TabsContent value="trust-score">
          <TrustScoreDashboard 
            trustScore={profile.trustScore}
            onRefresh={() => toast.success('Trust score refreshed!')}
          />
        </TabsContent>

        {/* Timeline Tab */}
        <TabsContent value="timeline">
          <VerificationTimelineComponent timeline={profile.timeline} />
        </TabsContent>

        {/* Upgrade Tab */}
        <TabsContent value="upgrade">
          <Card>
            <CardHeader>
              <CardTitle>Level Upgrade Path</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-2xl font-bold mb-2">Ready for Gold Level?</h3>
                  <p className="text-gray-600">
                    Complete the requirements below to upgrade to Premium Seller status
                  </p>
                </div>

                <div className="bg-gradient-to-r from-yellow-50 to-amber-50 p-6 rounded-lg border border-yellow-200">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-yellow-900">Upgrade Progress</h4>
                    <span className="text-2xl font-bold text-yellow-900">
                      {getProgressToNextLevel().toFixed(0)}%
                    </span>
                  </div>
                  <Progress value={getProgressToNextLevel()} className="h-3 mb-4" />
                  
                  <div className="space-y-3">
                    {getNextLevelRequirements().map((req, index) => {
                      const isCompleted = profile.documents.some(doc => 
                        doc.type === req.type && doc.status === 'approved'
                      )
                      
                      return (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                              isCompleted ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'
                            }`}>
                              {isCompleted ? <CheckCircle className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                            </div>
                            <div>
                              <p className="font-medium">{req.name}</p>
                              <p className="text-sm text-gray-600">{req.description}</p>
                            </div>
                          </div>
                          {!isCompleted && (
                            <Button size="sm" variant="outline">
                              Upload
                            </Button>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>

                {getProgressToNextLevel() >= 100 && (
                  <div className="text-center">
                    <Button size="lg" className="bg-yellow-600 hover:bg-yellow-700">
                      <Award className="w-5 h-5 mr-2" />
                      Apply for Gold Level
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}