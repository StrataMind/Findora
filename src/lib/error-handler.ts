// Centralized error handling with security-first approach

export interface SecureError {
  code: string
  message: string
  statusCode: number
  timestamp: string
}

export class SecurityError extends Error {
  public statusCode: number
  public code: string
  
  constructor(message: string, statusCode: number = 400, code: string = 'SECURITY_ERROR') {
    super(message)
    this.statusCode = statusCode
    this.code = code
    this.name = 'SecurityError'
  }
}

// Safe error messages for production
const SAFE_ERROR_MESSAGES = {
  // Authentication errors
  UNAUTHORIZED: 'Authentication required',
  FORBIDDEN: 'Access denied',
  INVALID_CREDENTIALS: 'Invalid credentials',
  SESSION_EXPIRED: 'Session expired, please login again',
  
  // Validation errors
  VALIDATION_ERROR: 'Invalid input provided',
  INVALID_FORMAT: 'Invalid data format',
  MISSING_REQUIRED: 'Required information is missing',
  
  // Database errors
  DATABASE_ERROR: 'A database error occurred',
  RECORD_NOT_FOUND: 'Requested resource not found',
  DUPLICATE_ENTRY: 'Resource already exists',
  
  // Rate limiting
  RATE_LIMITED: 'Too many requests, please try again later',
  
  // File upload errors
  FILE_TOO_LARGE: 'File size exceeds limit',
  INVALID_FILE_TYPE: 'File type not allowed',
  
  // Generic errors
  INTERNAL_ERROR: 'Internal server error occurred',
  SERVICE_UNAVAILABLE: 'Service temporarily unavailable',
  INVALID_REQUEST: 'Invalid request'
} as const

export function createSecureError(
  type: keyof typeof SAFE_ERROR_MESSAGES,
  statusCode: number = 400,
  details?: any
): SecureError {
  return {
    code: type,
    message: SAFE_ERROR_MESSAGES[type],
    statusCode,
    timestamp: new Date().toISOString()
  }
}

export function handleApiError(error: any): SecureError {
  // Log the full error internally for debugging (in development only)
  if (process.env.NODE_ENV === 'development') {
    console.error('API Error:', {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    })
  }

  // Zod validation errors
  if (error.name === 'ZodError') {
    return createSecureError('VALIDATION_ERROR', 400)
  }

  // Prisma errors
  if (error.code === 'P2002') {
    return createSecureError('DUPLICATE_ENTRY', 409)
  }
  
  if (error.code === 'P2025') {
    return createSecureError('RECORD_NOT_FOUND', 404)
  }
  
  if (error.code?.startsWith('P')) {
    return createSecureError('DATABASE_ERROR', 500)
  }

  // Custom security errors
  if (error instanceof SecurityError) {
    return createSecureError(error.code as keyof typeof SAFE_ERROR_MESSAGES, error.statusCode)
  }

  // Network/connection errors
  if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
    return createSecureError('SERVICE_UNAVAILABLE', 503)
  }

  // Default to generic internal error
  return createSecureError('INTERNAL_ERROR', 500)
}

// Utility function to safely extract error details for logging
export function extractErrorForLogging(error: any): {
  message: string
  stack?: string
  code?: string
  timestamp: string
} {
  return {
    message: error.message || 'Unknown error',
    stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    code: error.code,
    timestamp: new Date().toISOString()
  }
}

// Safe way to check if error contains sensitive information
export function sanitizeErrorMessage(message: string): string {
  // Remove potential sensitive information patterns
  return message
    .replace(/password[s]?[:\s=]+[^\s]+/gi, 'password: [REDACTED]')
    .replace(/token[s]?[:\s=]+[^\s]+/gi, 'token: [REDACTED]')
    .replace(/key[s]?[:\s=]+[^\s]+/gi, 'key: [REDACTED]')
    .replace(/secret[s]?[:\s=]+[^\s]+/gi, 'secret: [REDACTED]')
    .replace(/\b[\w\.-]+@[\w\.-]+\.\w+\b/g, '[EMAIL_REDACTED]') // Email addresses
    .replace(/\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g, '[CARD_REDACTED]') // Credit card numbers
}