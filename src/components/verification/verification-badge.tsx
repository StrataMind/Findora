'use client'

import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { 
  User, 
  Shield, 
  Building, 
  Star, 
  Crown, 
  Gem,
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle
} from 'lucide-react'
import { VerificationLevel, VerificationStatus } from '@/lib/verification-system'

interface VerificationBadgeProps {
  level: VerificationLevel
  status?: VerificationStatus
  showTooltip?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const BADGE_ICONS = {
  basic: User,
  bronze: Shield,
  silver: Building,
  gold: Star,
  platinum: Crown,
  diamond: Gem
}

const BADGE_COLORS = {
  basic: 'bg-gray-100 text-gray-700 border-gray-300',
  bronze: 'bg-amber-100 text-amber-800 border-amber-300',
  silver: 'bg-slate-100 text-slate-700 border-slate-300',
  gold: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  platinum: 'bg-purple-100 text-purple-800 border-purple-300',
  diamond: 'bg-cyan-100 text-cyan-800 border-cyan-300'
}

const BADGE_NAMES = {
  basic: 'Basic Seller',
  bronze: 'Verified Seller',
  silver: 'Business Verified',
  gold: 'Premium Seller',
  platinum: 'Elite Seller',
  diamond: 'Diamond Partner'
}

const BADGE_DESCRIPTIONS = {
  basic: 'New seller with basic profile setup',
  bronze: 'Identity and business verified',
  silver: 'Registered business with tax compliance',
  gold: 'High-quality seller with excellent track record',
  platinum: 'Top-tier seller with outstanding performance',
  diamond: 'Exclusive partnership with exceptional standards'
}

const STATUS_ICONS = {
  pending: Clock,
  in_review: AlertCircle,
  approved: CheckCircle,
  rejected: XCircle,
  expired: AlertCircle
}

const STATUS_COLORS = {
  pending: 'text-yellow-600',
  in_review: 'text-blue-600',
  approved: 'text-green-600',
  rejected: 'text-red-600',
  expired: 'text-orange-600'
}

export default function VerificationBadge({ 
  level, 
  status = 'approved',
  showTooltip = true,
  size = 'md',
  className = ''
}: VerificationBadgeProps) {
  const Icon = BADGE_ICONS[level]
  const StatusIcon = STATUS_ICONS[status]
  const badgeColor = BADGE_COLORS[level]
  const badgeName = BADGE_NAMES[level]
  const description = BADGE_DESCRIPTIONS[level]
  const statusColor = STATUS_COLORS[status]

  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-2'
  }

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  }

  const badge = (
    <Badge 
      variant="outline" 
      className={`${badgeColor} ${sizeClasses[size]} flex items-center space-x-1 border ${className}`}
    >
      <Icon className={iconSizes[size]} />
      <span>{badgeName}</span>
      {status !== 'approved' && (
        <StatusIcon className={`${iconSizes[size]} ${statusColor}`} />
      )}
    </Badge>
  )

  if (!showTooltip) {
    return badge
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {badge}
        </TooltipTrigger>
        <TooltipContent>
          <div className="max-w-xs">
            <p className="font-semibold">{badgeName}</p>
            <p className="text-sm text-gray-600">{description}</p>
            {status !== 'approved' && (
              <p className="text-xs mt-1 capitalize">
                Status: <span className={statusColor}>{status.replace('_', ' ')}</span>
              </p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

// Trust Score Badge
interface TrustScoreBadgeProps {
  score: number
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  className?: string
}

export function TrustScoreBadge({ 
  score, 
  size = 'md',
  showLabel = true,
  className = ''
}: TrustScoreBadgeProps) {
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'bg-green-100 text-green-800 border-green-300'
    if (score >= 75) return 'bg-blue-100 text-blue-800 border-blue-300'
    if (score >= 60) return 'bg-yellow-100 text-yellow-800 border-yellow-300'
    if (score >= 40) return 'bg-orange-100 text-orange-800 border-orange-300'
    return 'bg-red-100 text-red-800 border-red-300'
  }

  const getScoreLabel = (score: number) => {
    if (score >= 90) return 'Excellent'
    if (score >= 75) return 'Very Good'
    if (score >= 60) return 'Good'
    if (score >= 40) return 'Fair'
    return 'Poor'
  }

  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-2'
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge 
            variant="outline" 
            className={`${getScoreColor(score)} ${sizeClasses[size]} border font-semibold ${className}`}
          >
            <Star className="w-3 h-3 mr-1 fill-current" />
            {score}
            {showLabel && (
              <span className="ml-1 font-normal">{getScoreLabel(score)}</span>
            )}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <div>
            <p className="font-semibold">Trust Score: {score}/100</p>
            <p className="text-sm text-gray-600">
              Based on sales performance, customer satisfaction, and compliance
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

// Verification Status Indicator
interface VerificationStatusProps {
  status: VerificationStatus
  level?: VerificationLevel
  compact?: boolean
  className?: string
}

export function VerificationStatus({ 
  status, 
  level,
  compact = false,
  className = ''
}: VerificationStatusProps) {
  const StatusIcon = STATUS_ICONS[status]
  const statusColor = STATUS_COLORS[status]
  
  const statusLabels = {
    pending: 'Verification Pending',
    in_review: 'Under Review',
    approved: 'Verified',
    rejected: 'Verification Failed',
    expired: 'Verification Expired'
  }

  if (compact) {
    return (
      <div className={`flex items-center space-x-1 text-sm ${statusColor} ${className}`}>
        <StatusIcon className="w-4 h-4" />
        {!level && <span>{statusLabels[status]}</span>}
      </div>
    )
  }

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <StatusIcon className={`w-5 h-5 ${statusColor}`} />
      <div>
        <p className={`font-medium ${statusColor}`}>
          {statusLabels[status]}
        </p>
        {level && (
          <p className="text-sm text-gray-600">
            {BADGE_NAMES[level]} level
          </p>
        )}
      </div>
    </div>
  )
}

export { VerificationBadge, TrustScoreBadge, VerificationStatus }