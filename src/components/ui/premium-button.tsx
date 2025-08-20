'use client'

import React from 'react'
import { motion, HTMLMotionProps } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { componentAnimations, hoverEffects } from '@/lib/animations'

interface PremiumButtonProps extends Omit<HTMLMotionProps<'button'>, 'size'> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'gradient' | 'glass'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  loading?: boolean
  disabled?: boolean
  children: React.ReactNode
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
  fullWidth?: boolean
  glow?: boolean
  shimmer?: boolean
}

const variantStyles = {
  primary: 'bg-gradient-coral text-white shadow-md hover:shadow-glow',
  secondary: 'bg-white text-gray-900 border-2 border-gray-200 hover:border-gray-300',
  outline: 'border-2 border-coral text-coral hover:bg-coral hover:text-white',
  ghost: 'text-gray-700 hover:bg-gray-100',
  gradient: 'bg-gradient-primary text-white shadow-lg',
  glass: 'glass text-gray-900 hover:bg-white/20'
}

const sizeStyles = {
  sm: 'px-3 py-1.5 text-sm font-medium',
  md: 'px-4 py-2 text-base font-semibold',
  lg: 'px-6 py-3 text-lg font-semibold',
  xl: 'px-8 py-4 text-xl font-bold'
}

export default function PremiumButton({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  children,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  glow = false,
  shimmer = false,
  className,
  ...props
}: PremiumButtonProps) {
  const isDisabled = disabled || loading

  const buttonVariants = glow ? componentAnimations.buttonGlow : componentAnimations.button

  return (
    <motion.button
      className={cn(
        // Base styles
        'relative inline-flex items-center justify-center rounded-lg font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-coral focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden',
        
        // Variant styles
        variantStyles[variant],
        
        // Size styles
        sizeStyles[size],
        
        // Full width
        fullWidth && 'w-full',
        
        // Shimmer effect
        shimmer && 'before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-700',
        
        className
      )}
      variants={buttonVariants}
      initial="rest"
      whileHover={!isDisabled ? "hover" : "rest"}
      whileTap={!isDisabled ? "tap" : "rest"}
      disabled={isDisabled}
      {...props}
    >
      {/* Shimmer overlay */}
      {shimmer && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
      )}
      
      {/* Content */}
      <span className="relative flex items-center justify-center gap-2">
        {loading && (
          <Loader2 className="w-4 h-4 animate-spin" />
        )}
        
        {!loading && icon && iconPosition === 'left' && (
          <span className="w-4 h-4">{icon}</span>
        )}
        
        <span>{children}</span>
        
        {!loading && icon && iconPosition === 'right' && (
          <span className="w-4 h-4">{icon}</span>
        )}
      </span>
    </motion.button>
  )
}