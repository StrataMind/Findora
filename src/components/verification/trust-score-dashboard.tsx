'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Star, 
  TrendingUp, 
  Users, 
  RotateCcw, 
  Clock, 
  Scale, 
  ShieldCheck,
  Info,
  Target,
  Award
} from 'lucide-react'
import { TrustScore, TrustFactor, TrustFactorType } from '@/lib/verification-system'
import { TrustScoreHistory } from './verification-timeline'

interface TrustScoreDashboardProps {
  trustScore: TrustScore
  onRefresh?: () => void
  className?: string
}

const FACTOR_ICONS: Record<TrustFactorType, any> = {
  sales_volume: TrendingUp,
  customer_satisfaction: Star,
  return_rate: RotateCcw,
  response_time: Clock,
  dispute_resolution: Scale,
  compliance_score: ShieldCheck
}

const FACTOR_COLORS: Record<TrustFactorType, string> = {
  sales_volume: 'text-blue-600 bg-blue-50',
  customer_satisfaction: 'text-yellow-600 bg-yellow-50',
  return_rate: 'text-orange-600 bg-orange-50',
  response_time: 'text-green-600 bg-green-50',
  dispute_resolution: 'text-purple-600 bg-purple-50',
  compliance_score: 'text-indigo-600 bg-indigo-50'
}

export default function TrustScoreDashboard({ 
  trustScore, 
  onRefresh,
  className = '' 
}: TrustScoreDashboardProps) {
  const [expandedFactor, setExpandedFactor] = useState<TrustFactorType | null>(null)

  const getScoreLevel = (score: number) => {
    if (score >= 90) return { label: 'Excellent', color: 'text-green-700 bg-green-100 border-green-300' }
    if (score >= 75) return { label: 'Very Good', color: 'text-blue-700 bg-blue-100 border-blue-300' }
    if (score >= 60) return { label: 'Good', color: 'text-yellow-700 bg-yellow-100 border-yellow-300' }
    if (score >= 40) return { label: 'Fair', color: 'text-orange-700 bg-orange-100 border-orange-300' }
    return { label: 'Poor', color: 'text-red-700 bg-red-100 border-red-300' }
  }

  const overallLevel = getScoreLevel(trustScore.overall)

  const getImprovementSuggestions = (factor: TrustFactor) => {
    const suggestions: Record<TrustFactorType, string[]> = {
      sales_volume: [
        'Increase your product catalog',
        'Optimize pricing strategy',
        'Run promotional campaigns',
        'Improve product visibility'
      ],
      customer_satisfaction: [
        'Respond promptly to customer queries',
        'Provide detailed product descriptions',
        'Ensure fast and reliable shipping',
        'Follow up with customers after purchase'
      ],
      return_rate: [
        'Improve product quality control',
        'Provide accurate product descriptions',
        'Use better packaging materials',
        'Offer size guides and detailed specifications'
      ],
      response_time: [
        'Set up automated responses',
        'Check messages multiple times daily',
        'Use chat templates for common questions',
        'Enable push notifications'
      ],
      dispute_resolution: [
        'Address customer concerns proactively',
        'Offer fair resolution terms',
        'Communicate clearly during disputes',
        'Learn from past dispute patterns'
      ],
      compliance_score: [
        'Review platform policies regularly',
        'Ensure product listings are accurate',
        'Maintain required documentation',
        'Follow shipping and return policies'
      ]
    }
    return suggestions[factor.type] || []
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Overall Trust Score */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <Award className="w-6 h-6 mr-2" />
              Overall Trust Score
            </CardTitle>
            {onRefresh && (
              <Button variant="outline" size="sm" onClick={onRefresh}>
                <RotateCcw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="text-4xl font-bold text-gray-900">
                {trustScore.overall}
              </div>
              <div>
                <Badge className={`${overallLevel.color} border`}>
                  {overallLevel.label}
                </Badge>
                <p className="text-sm text-gray-600 mt-1">
                  Last updated: {new Date(trustScore.lastCalculated).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="w-32 h-32 relative">
                {/* Circular progress */}
                <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
                  <circle
                    cx="60"
                    cy="60"
                    r="50"
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="8"
                  />
                  <circle
                    cx="60"
                    cy="60"
                    r="50"
                    fill="none"
                    stroke={trustScore.overall >= 75 ? '#10b981' : trustScore.overall >= 50 ? '#f59e0b' : '#ef4444'}
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={`${trustScore.overall * 3.14} 314`}
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold">{trustScore.overall}</span>
                </div>
              </div>
            </div>
          </div>
          
          <Progress value={trustScore.overall} className="h-3" />
        </CardContent>
      </Card>

      {/* Trust Factors Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Target className="w-5 h-5 mr-2" />
            Trust Factors Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {trustScore.factors.map((factor) => {
              const Icon = FACTOR_ICONS[factor.type]
              const colorClass = FACTOR_COLORS[factor.type]
              const percentage = (factor.currentScore / factor.maxScore) * 100
              const isExpanded = expandedFactor === factor.type

              return (
                <div 
                  key={factor.type} 
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setExpandedFactor(isExpanded ? null : factor.type)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorClass}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{factor.name}</h3>
                        <p className="text-sm text-gray-600">{factor.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold">{factor.currentScore}/{factor.maxScore}</div>
                      <div className="text-sm text-gray-500">Weight: {factor.weight}%</div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{Math.round(percentage)}%</span>
                    </div>
                    <Progress value={percentage} className="h-2" />
                  </div>

                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t">
                      <h4 className="font-medium text-gray-900 mb-2">Improvement Suggestions:</h4>
                      <ul className="space-y-1">
                        {getImprovementSuggestions(factor).map((suggestion, index) => (
                          <li key={index} className="text-sm text-gray-600 flex items-start">
                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 mr-2 flex-shrink-0" />
                            {suggestion}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Trust Score Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Info className="w-5 h-5 mr-2" />
              Score Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">Strengths</h4>
                <ul className="space-y-1 text-sm text-blue-800">
                  {trustScore.factors
                    .filter(f => (f.currentScore / f.maxScore) >= 0.8)
                    .map(f => (
                      <li key={f.type} className="flex items-center">
                        <Star className="w-3 h-3 mr-2 fill-current" />
                        {f.name}
                      </li>
                    ))
                  }
                </ul>
              </div>
              
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h4 className="font-semibold text-yellow-900 mb-2">Areas for Improvement</h4>
                <ul className="space-y-1 text-sm text-yellow-800">
                  {trustScore.factors
                    .filter(f => (f.currentScore / f.maxScore) < 0.6)
                    .map(f => (
                      <li key={f.type} className="flex items-center">
                        <Target className="w-3 h-3 mr-2" />
                        {f.name}
                      </li>
                    ))
                  }
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Changes */}
        <TrustScoreHistory 
          history={trustScore.history.slice(0, 5)} 
          className="h-fit"
        />
      </div>
    </div>
  )
}

export { TrustScoreDashboard }