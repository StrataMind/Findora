// Simple in-memory rate limiting for demonstration
// In production, use Redis or similar for distributed rate limiting

interface RateLimitEntry {
  count: number
  resetTime: number
}

const rateLimitStore = new Map<string, RateLimitEntry>()

export interface RateLimitConfig {
  maxRequests: number
  windowMs: number
}

export function rateLimit(config: RateLimitConfig) {
  return (identifier: string): { success: boolean; remaining: number; resetTime: number } => {
    const now = Date.now()
    const key = identifier
    
    // Clean up expired entries
    for (const [k, v] of rateLimitStore.entries()) {
      if (now > v.resetTime) {
        rateLimitStore.delete(k)
      }
    }
    
    let entry = rateLimitStore.get(key)
    
    // Create new entry if doesn't exist or expired
    if (!entry || now > entry.resetTime) {
      entry = {
        count: 0,
        resetTime: now + config.windowMs
      }
    }
    
    entry.count++
    rateLimitStore.set(key, entry)
    
    const remaining = Math.max(0, config.maxRequests - entry.count)
    const success = entry.count <= config.maxRequests
    
    return {
      success,
      remaining,
      resetTime: entry.resetTime
    }
  }
}

// Predefined rate limiters for different endpoints
export const authRateLimit = rateLimit({
  maxRequests: 5, // 5 attempts
  windowMs: 15 * 60 * 1000, // 15 minutes
})

export const apiRateLimit = rateLimit({
  maxRequests: 100, // 100 requests
  windowMs: 15 * 60 * 1000, // 15 minutes
})

export const strictRateLimit = rateLimit({
  maxRequests: 10, // 10 requests
  windowMs: 60 * 60 * 1000, // 1 hour
})

export function getRateLimitIdentifier(req: Request): string {
  // Try to get IP from various headers (for production behind proxies)
  const forwarded = req.headers.get('x-forwarded-for')
  const realIp = req.headers.get('x-real-ip')
  const cfConnectingIp = req.headers.get('cf-connecting-ip')
  
  const ip = cfConnectingIp || realIp || forwarded?.split(',')[0] || 'unknown'
  
  return ip.trim()
}