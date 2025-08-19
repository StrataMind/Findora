'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  FileText, 
  Upload, 
  Eye, 
  MessageSquare, 
  CheckCircle, 
  XCircle, 
  TrendingUp, 
  TrendingDown,
  Clock,
  User,
  Calendar
} from 'lucide-react'
import { format } from 'date-fns'
import { VerificationTimeline, VerificationLevel } from '@/lib/verification-system'

interface VerificationTimelineProps {
  timeline: VerificationTimeline[]
  className?: string
}

const EVENT_ICONS = {
  application_submitted: FileText,
  document_uploaded: Upload,
  review_started: Eye,
  additional_info_requested: MessageSquare,
  approved: CheckCircle,
  rejected: XCircle,
  badge_upgraded: TrendingUp,
  badge_downgraded: TrendingDown
}

const EVENT_COLORS = {
  application_submitted: 'text-blue-600 bg-blue-50',
  document_uploaded: 'text-purple-600 bg-purple-50',
  review_started: 'text-orange-600 bg-orange-50',
  additional_info_requested: 'text-yellow-600 bg-yellow-50',
  approved: 'text-green-600 bg-green-50',
  rejected: 'text-red-600 bg-red-50',
  badge_upgraded: 'text-emerald-600 bg-emerald-50',
  badge_downgraded: 'text-rose-600 bg-rose-50'
}

const EVENT_LABELS = {
  application_submitted: 'Application Submitted',
  document_uploaded: 'Document Uploaded',
  review_started: 'Review Started',
  additional_info_requested: 'Additional Info Requested',
  approved: 'Approved',
  rejected: 'Rejected',
  badge_upgraded: 'Badge Upgraded',
  badge_downgraded: 'Badge Downgraded'
}

export default function VerificationTimelineComponent({ 
  timeline, 
  className = '' 
}: VerificationTimelineProps) {
  const [showAll, setShowAll] = useState(false)
  const displayTimeline = showAll ? timeline : timeline.slice(0, 5)

  const formatTimeAgo = (date: Date) => {
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
    
    if (diffInSeconds < 60) return 'Just now'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`
    
    return format(date, 'MMM dd, yyyy')
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Clock className="w-5 h-5 mr-2" />
          Verification Timeline
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {displayTimeline.map((event, index) => {
            const Icon = EVENT_ICONS[event.event]
            const colorClass = EVENT_COLORS[event.event]
            const label = EVENT_LABELS[event.event]
            const isLast = index === displayTimeline.length - 1

            return (
              <div key={event.id} className="relative">
                {/* Timeline connector */}
                {!isLast && (
                  <div className="absolute left-6 top-12 bottom-0 w-0.5 bg-gray-200" />
                )}
                
                <div className="flex items-start space-x-4">
                  {/* Event icon */}
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${colorClass} border-2 border-white shadow-sm`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  
                  {/* Event content */}
                  <div className="flex-1 min-w-0 pb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900">{label}</h3>
                        <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                        
                        {/* Event metadata */}
                        {event.level && (
                          <Badge variant="outline" className="mt-2">
                            Level: {event.level.charAt(0).toUpperCase() + event.level.slice(1)}
                          </Badge>
                        )}
                        
                        {event.metadata?.documentType && (
                          <Badge variant="secondary" className="mt-2 ml-2">
                            {event.metadata.documentType.replace('_', ' ').split(' ').map((word: string) => 
                              word.charAt(0).toUpperCase() + word.slice(1)
                            ).join(' ')}
                          </Badge>
                        )}
                      </div>
                      
                      <div className="text-right text-sm text-gray-500">
                        <p className="flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          {formatTimeAgo(event.timestamp)}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {format(event.timestamp, 'MMM dd, yyyy HH:mm')}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
          
          {timeline.length > 5 && (
            <div className="text-center pt-4">
              <Button 
                variant="ghost" 
                onClick={() => setShowAll(!showAll)}
                className="text-sm"
              >
                {showAll ? 'Show Less' : `Show All ${timeline.length} Events`}
              </Button>
            </div>
          )}
          
          {timeline.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No verification timeline events yet</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// Trust Score History Component
interface TrustScoreHistoryProps {
  history: Array<{
    score: number
    date: Date
    reason: string
  }>
  className?: string
}

export function TrustScoreHistory({ history, className = '' }: TrustScoreHistoryProps) {
  const [showAll, setShowAll] = useState(false)
  const displayHistory = showAll ? history : history.slice(0, 10)

  const getScoreChange = (current: number, previous?: number) => {
    if (!previous) return null
    const change = current - previous
    return change > 0 ? `+${change}` : change.toString()
  }

  const getChangeColor = (change: string | null) => {
    if (!change) return 'text-gray-500'
    return change.startsWith('+') ? 'text-green-600' : 'text-red-600'
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center">
          <TrendingUp className="w-5 h-5 mr-2" />
          Trust Score History
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {displayHistory.map((entry, index) => {
            const previousScore = index < displayHistory.length - 1 ? displayHistory[index + 1].score : undefined
            const change = getScoreChange(entry.score, previousScore)
            
            return (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-lg">{entry.score}</span>
                      {change && (
                        <span className={`text-sm font-medium ${getChangeColor(change)}`}>
                          ({change})
                        </span>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">{entry.reason}</p>
                      <p className="text-xs text-gray-500">
                        {format(entry.date, 'MMM dd, yyyy HH:mm')}
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Score visualization */}
                <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500"
                    style={{ width: `${entry.score}%` }}
                  />
                </div>
              </div>
            )
          })}
          
          {history.length > 10 && (
            <div className="text-center pt-4">
              <Button 
                variant="ghost" 
                onClick={() => setShowAll(!showAll)}
                className="text-sm"
              >
                {showAll ? 'Show Less' : `Show All ${history.length} Changes`}
              </Button>
            </div>
          )}
          
          {history.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No trust score history available</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export { VerificationTimelineComponent, TrustScoreHistory }