import { z } from 'zod'

// Enhanced input sanitization and validation utilities

export function sanitizeHtml(input: string): string {
  // Remove HTML tags and dangerous characters
  return input
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/[<>'"&]/g, '') // Remove dangerous characters
    .trim()
}

export function sanitizeEmail(email: string): string {
  return email.toLowerCase().trim()
}

export function validateFileUpload(file: {
  name: string
  type: string
  size: number
}): { valid: boolean; error?: string } {
  // Allowed file types for uploads
  const allowedTypes = [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/webp',
    'application/pdf'
  ]
  
  // Max file size (5MB)
  const maxSize = 5 * 1024 * 1024
  
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'File type not allowed. Only JPEG, PNG, WebP and PDF files are permitted.'
    }
  }
  
  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'File size too large. Maximum size is 5MB.'
    }
  }
  
  // Check for suspicious file extensions in the name
  const suspiciousExtensions = ['.exe', '.bat', '.cmd', '.scr', '.vbs', '.js', '.jar']
  const fileName = file.name.toLowerCase()
  
  if (suspiciousExtensions.some(ext => fileName.includes(ext))) {
    return {
      valid: false,
      error: 'File name contains potentially dangerous content.'
    }
  }
  
  return { valid: true }
}

// Enhanced schema definitions with better validation
export const secureUserSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters')
    .regex(/^[a-zA-Z\s'-]+$/, 'Name contains invalid characters')
    .transform(sanitizeHtml),
  email: z.string()
    .email('Invalid email format')
    .max(254, 'Email address too long')
    .transform(sanitizeEmail),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password too long')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain lowercase, uppercase, and number')
})

export const secureProductSchema = z.object({
  name: z.string()
    .min(1, 'Product name is required')
    .max(200, 'Product name too long')
    .transform(sanitizeHtml),
  description: z.string()
    .min(10, 'Description must be at least 10 characters')
    .max(5000, 'Description too long')
    .transform(sanitizeHtml),
  price: z.number()
    .min(0.01, 'Price must be greater than 0')
    .max(999999.99, 'Price too high')
    .multipleOf(0.01, 'Invalid price format'),
  sku: z.string()
    .max(50, 'SKU too long')
    .regex(/^[A-Za-z0-9\-_]*$/, 'SKU contains invalid characters')
    .optional()
    .transform(val => val ? sanitizeHtml(val) : undefined),
  inventory: z.number()
    .int('Inventory must be a whole number')
    .min(0, 'Inventory cannot be negative')
    .max(999999, 'Inventory too high'),
  tags: z.array(z.string().max(30, 'Tag too long').transform(sanitizeHtml))
    .max(10, 'Too many tags')
    .default([])
})

// URL validation with additional security checks
export function validateSecureUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    
    // Only allow HTTP/HTTPS
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return false
    }
    
    // Block localhost and private IPs in production
    if (process.env.NODE_ENV === 'production') {
      const hostname = parsed.hostname.toLowerCase()
      
      // Block localhost
      if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return false
      }
      
      // Block private IP ranges
      if (
        hostname.startsWith('10.') ||
        hostname.startsWith('172.16.') ||
        hostname.startsWith('192.168.') ||
        hostname === '0.0.0.0'
      ) {
        return false
      }
    }
    
    return true
  } catch {
    return false
  }
}

// Phone number validation
export function validatePhoneNumber(phone: string): boolean {
  // International phone number format
  const phoneRegex = /^\+?[1-9]\d{1,14}$/
  
  // Remove spaces, dashes, parentheses for validation
  const cleanPhone = phone.replace(/[\s\-\(\)]/g, '')
  
  return phoneRegex.test(cleanPhone)
}

// Input length limits for security
export const INPUT_LIMITS = {
  SHORT_TEXT: 100,
  MEDIUM_TEXT: 500,
  LONG_TEXT: 5000,
  VERY_LONG_TEXT: 10000,
  URL: 2048,
  EMAIL: 254,
  PHONE: 20,
  NAME: 50,
  ADDRESS: 200
} as const