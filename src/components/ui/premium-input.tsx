'use client'

import React, { useState, useId } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PremiumInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string
  error?: string
  success?: string
  hint?: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'floating' | 'minimal' | 'glass'
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
  loading?: boolean
  onIconClick?: () => void
}

const sizeStyles = {
  sm: 'px-3 py-2 text-sm',
  md: 'px-4 py-3 text-base',
  lg: 'px-5 py-4 text-lg'
}

const variantStyles = {
  default: 'border border-gray-300 bg-white rounded-lg focus:border-coral focus:ring-2 focus:ring-coral/20',
  floating: 'border-b-2 border-gray-300 bg-transparent rounded-none focus:border-coral',
  minimal: 'border-0 border-b border-gray-300 bg-transparent rounded-none focus:border-coral',
  glass: 'glass border border-white/20 focus:border-coral/50 focus:ring-2 focus:ring-coral/20'
}

export default function PremiumInput({
  label,
  error,
  success,
  hint,
  size = 'md',
  variant = 'default',
  icon,
  iconPosition = 'left',
  loading,
  onIconClick,
  className,
  type = 'text',
  disabled,
  ...props
}: PremiumInputProps) {
  const [focused, setFocused] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [hasValue, setHasValue] = useState(!!props.value || !!props.defaultValue)
  const id = useId()
  
  const isPassword = type === 'password'
  const inputType = isPassword && showPassword ? 'text' : type
  const hasError = !!error
  const hasSuccess = !!success && !hasError
  
  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setFocused(true)
    props.onFocus?.(e)
  }
  
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setFocused(false)
    props.onBlur?.(e)
  }
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHasValue(e.target.value.length > 0)
    props.onChange?.(e)
  }

  const showFloatingLabel = variant === 'floating' && (focused || hasValue)
  const showMinimalLabel = variant === 'minimal' && label

  return (
    <div className="relative">
      {/* Regular Label (for default and glass variants) */}
      {label && (variant === 'default' || variant === 'glass') && (
        <label 
          htmlFor={id}
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          {label}
        </label>
      )}
      
      {/* Minimal Label */}
      {showMinimalLabel && (
        <label 
          htmlFor={id}
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label}
        </label>
      )}

      {/* Input Container */}
      <div className="relative">
        {/* Left Icon */}
        {icon && iconPosition === 'left' && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
            <div className="w-5 h-5">
              {loading ? (
                <div className="w-4 h-4 border-2 border-coral border-t-transparent rounded-full animate-spin" />
              ) : (
                icon
              )}
            </div>
          </div>
        )}

        {/* Input Field */}
        <motion.input
          id={id}
          type={inputType}
          className={cn(
            // Base styles
            'w-full transition-all duration-300 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed',
            
            // Variant styles
            variantStyles[variant],
            
            // Size styles
            sizeStyles[size],
            
            // Icon padding
            icon && iconPosition === 'left' && 'pl-10',
            (icon && iconPosition === 'right') || isPassword ? 'pr-10' : '',
            
            // State styles
            hasError && 'border-red-500 focus:border-red-500 focus:ring-red-200',
            hasSuccess && 'border-green-500 focus:border-green-500 focus:ring-green-200',
            
            className
          )}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onChange={handleChange}
          disabled={disabled}
          whileFocus={{ scale: 1.01 }}
          {...props}
        />

        {/* Floating Label */}
        <AnimatePresence>
          {variant === 'floating' && label && (
            <motion.label
              htmlFor={id}
              className={cn(
                'absolute left-4 transition-all duration-300 pointer-events-none',
                showFloatingLabel
                  ? 'top-0 -translate-y-1/2 text-xs font-medium bg-white px-2 text-coral'
                  : 'top-1/2 -translate-y-1/2 text-base text-gray-400'
              )}
              initial={false}
              animate={{
                y: showFloatingLabel ? -12 : 0,
                scale: showFloatingLabel ? 0.85 : 1,
                color: focused ? '#FF6B6B' : hasError ? '#EF4444' : '#9CA3AF'
              }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
            >
              {label}
            </motion.label>
          )}
        </AnimatePresence>

        {/* Right Icons */}
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
          {/* Status Icons */}
          {hasError && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="text-red-500"
            >
              <AlertCircle className="w-4 h-4" />
            </motion.div>
          )}
          
          {hasSuccess && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="text-green-500"
            >
              <CheckCircle className="w-4 h-4" />
            </motion.div>
          )}

          {/* Password Toggle */}
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          )}

          {/* Custom Right Icon */}
          {icon && iconPosition === 'right' && !isPassword && (
            <div 
              className={cn(
                "text-gray-400",
                onIconClick && "cursor-pointer hover:text-gray-600 transition-colors"
              )}
              onClick={onIconClick}
            >
              <div className="w-5 h-5">
                {loading ? (
                  <div className="w-4 h-4 border-2 border-coral border-t-transparent rounded-full animate-spin" />
                ) : (
                  icon
                )}
              </div>
            </div>
          )}
        </div>

        {/* Focus Ring for Glass Variant */}
        {variant === 'glass' && focused && (
          <motion.div
            className="absolute inset-0 rounded-lg border-2 border-coral/50 pointer-events-none"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          />
        )}
      </div>

      {/* Helper Text */}
      <AnimatePresence mode="wait">
        {(error || success || hint) && (
          <motion.div
            className="mt-2"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {error && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {error}
              </p>
            )}
            
            {success && !error && (
              <p className="text-sm text-green-600 flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                {success}
              </p>
            )}
            
            {hint && !error && !success && (
              <p className="text-sm text-gray-500">{hint}</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Textarea Component
interface PremiumTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  success?: string
  hint?: string
  variant?: 'default' | 'glass'
}

export function PremiumTextarea({
  label,
  error,
  success,
  hint,
  variant = 'default',
  className,
  ...props
}: PremiumTextareaProps) {
  const [focused, setFocused] = useState(false)
  const id = useId()
  const hasError = !!error
  const hasSuccess = !!success && !hasError

  return (
    <div className="relative">
      {/* Label */}
      {label && (
        <label 
          htmlFor={id}
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          {label}
        </label>
      )}

      {/* Textarea */}
      <motion.textarea
        id={id}
        className={cn(
          // Base styles
          'w-full transition-all duration-300 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed resize-none',
          
          // Variant styles
          variant === 'default' 
            ? 'border border-gray-300 bg-white rounded-lg focus:border-coral focus:ring-2 focus:ring-coral/20 px-4 py-3'
            : 'glass border border-white/20 focus:border-coral/50 focus:ring-2 focus:ring-coral/20 px-4 py-3 rounded-lg',
          
          // State styles
          hasError && 'border-red-500 focus:border-red-500 focus:ring-red-200',
          hasSuccess && 'border-green-500 focus:border-green-500 focus:ring-green-200',
          
          className
        )}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        whileFocus={{ scale: 1.01 }}
        {...props}
      />

      {/* Helper Text */}
      <AnimatePresence mode="wait">
        {(error || success || hint) && (
          <motion.div
            className="mt-2"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {error && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {error}
              </p>
            )}
            
            {success && !error && (
              <p className="text-sm text-green-600 flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                {success}
              </p>
            )}
            
            {hint && !error && !success && (
              <p className="text-sm text-gray-500">{hint}</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Export statement removed - using individual exports above