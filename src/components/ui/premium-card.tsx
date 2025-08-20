'use client'

import React from 'react'
import { motion, HTMLMotionProps } from 'framer-motion'
import { cn } from '@/lib/utils'
import { componentAnimations, scrollAnimations } from '@/lib/animations'

interface PremiumCardProps extends HTMLMotionProps<'div'> {
  variant?: 'default' | 'glass' | 'premium' | 'floating' | 'gradient'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  children: React.ReactNode
  hover?: boolean
  float?: boolean
  glow?: boolean
  gradient?: 'primary' | 'secondary' | 'gold' | 'coral'
  scrollAnimation?: keyof typeof scrollAnimations
  className?: string
}

const variantStyles = {
  default: 'bg-white border border-gray-200 shadow-sm',
  glass: 'glass border border-white/20',
  premium: 'bg-white shadow-lg border-l-4 border-l-coral',
  floating: 'bg-white shadow-xl border-0',
  gradient: 'text-white shadow-lg border-0'
}

const sizeStyles = {
  sm: 'p-4 rounded-lg',
  md: 'p-6 rounded-xl',
  lg: 'p-8 rounded-2xl',
  xl: 'p-10 rounded-3xl'
}

const gradientStyles = {
  primary: 'bg-gradient-primary',
  secondary: 'bg-gradient-secondary',
  gold: 'bg-gradient-gold',
  coral: 'bg-gradient-coral'
}

export default function PremiumCard({
  variant = 'default',
  size = 'md',
  children,
  hover = true,
  float = false,
  glow = false,
  gradient,
  scrollAnimation,
  className,
  ...props
}: PremiumCardProps) {
  // Choose animation variants
  let motionVariants = {}
  
  if (scrollAnimation && scrollAnimations[scrollAnimation]) {
    motionVariants = scrollAnimations[scrollAnimation]
  } else if (float) {
    motionVariants = componentAnimations.cardFloat
  } else if (hover) {
    motionVariants = componentAnimations.card
  }

  return (
    <motion.div
      className={cn(
        // Base styles
        'relative transition-all duration-300',
        
        // Variant styles
        variantStyles[variant],
        
        // Size styles
        sizeStyles[size],
        
        // Gradient styles
        gradient && gradientStyles[gradient],
        
        // Glow effect
        glow && 'shadow-glow',
        
        className
      )}
      variants={motionVariants}
      initial={scrollAnimation ? "initial" : float ? undefined : "rest"}
      animate={float ? "animate" : undefined}
      whileHover={hover && !scrollAnimation ? "hover" : undefined}
      whileInView={scrollAnimation ? "whileInView" : undefined}
      viewport={scrollAnimation ? { once: true, margin: '-100px' } : undefined}
      {...props}
    >
      {/* Premium accent line for premium variant */}
      {variant === 'premium' && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-coral rounded-t-xl" />
      )}
      
      {/* Floating elements for premium cards */}
      {variant === 'floating' && (
        <>
          <div className="absolute -top-1 -left-1 w-3 h-3 bg-coral rounded-full opacity-60" />
          <div className="absolute -top-2 -right-2 w-2 h-2 bg-gold rounded-full opacity-40" />
          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-mint rounded-full opacity-30" />
        </>
      )}
      
      {/* Glass reflection effect */}
      {variant === 'glass' && (
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-xl pointer-events-none" />
      )}
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
      
      {/* Hover shimmer effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 rounded-xl" />
    </motion.div>
  )
}

// Card Header Component
interface PremiumCardHeaderProps {
  children: React.ReactNode
  className?: string
  icon?: React.ReactNode
  badge?: React.ReactNode
}

export function PremiumCardHeader({ children, className, icon, badge }: PremiumCardHeaderProps) {
  return (
    <div className={cn('flex items-center justify-between mb-4', className)}>
      <div className="flex items-center gap-3">
        {icon && (
          <div className="flex items-center justify-center w-8 h-8 bg-coral/10 rounded-lg text-coral">
            {icon}
          </div>
        )}
        <div className="font-semibold text-lg text-gray-900">
          {children}
        </div>
      </div>
      {badge && badge}
    </div>
  )
}

// Card Content Component
interface PremiumCardContentProps {
  children: React.ReactNode
  className?: string
}

export function PremiumCardContent({ children, className }: PremiumCardContentProps) {
  return (
    <div className={cn('text-gray-600', className)}>
      {children}
    </div>
  )
}

// Card Footer Component
interface PremiumCardFooterProps {
  children: React.ReactNode
  className?: string
}

export function PremiumCardFooter({ children, className }: PremiumCardFooterProps) {
  return (
    <div className={cn('mt-6 pt-4 border-t border-gray-100', className)}>
      {children}
    </div>
  )
}

// Stat Card Component
interface StatCardProps {
  title: string
  value: string | number
  change?: {
    value: string | number
    type: 'increase' | 'decrease' | 'neutral'
  }
  icon?: React.ReactNode
  className?: string
}

export function StatCard({ title, value, change, icon, className }: StatCardProps) {
  const changeColors = {
    increase: 'text-mint bg-mint/10',
    decrease: 'text-red-600 bg-red-100',
    neutral: 'text-gray-600 bg-gray-100'
  }

  return (
    <PremiumCard variant="premium" className={className} hover>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {change && (
            <div className={cn(
              'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-2',
              changeColors[change.type]
            )}>
              {change.type === 'increase' && '↗'}
              {change.type === 'decrease' && '↘'}
              {change.type === 'neutral' && '→'}
              {change.value}
            </div>
          )}
        </div>
        {icon && (
          <div className="flex items-center justify-center w-12 h-12 bg-gradient-coral text-white rounded-xl">
            {icon}
          </div>
        )}
      </div>
    </PremiumCard>
  )
}

// Export statement removed - using individual exports above