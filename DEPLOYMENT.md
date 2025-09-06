# 🚀 Secure Deployment Guide for Findora

## Pre-Deployment Security Requirements

### ✅ Security Checklist

**CRITICAL - Must Complete Before Deployment:**

- [ ] **Environment Secrets**: All `.env.local` variables updated with secure values
- [ ] **Database Security**: Production database with strong credentials  
- [ ] **OAuth Configuration**: Valid OAuth client IDs and secrets
- [ ] **JWT Secrets**: Generated secure random secrets (32+ chars)
- [ ] **HTTPS Setup**: SSL certificates configured
- [ ] **Domain Security**: CSP and CORS policies configured

### 🔐 Environment Configuration

1. **Copy and Configure Environment Files**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your secure production values
   ```

2. **Generate Secure Secrets**
   ```bash
   # NEXTAUTH_SECRET
   openssl rand -base64 32
   
   # JWT_SECRET  
   openssl rand -hex 32
   ```

3. **Database Setup**
   ```bash
   # Generate and push schema
   npm run db:generate
   npm run db:push
   
   # Run initial migrations if needed
   npm run db:migrate
   ```

## 🛡️ Security Hardening Steps

### 1. Remove Development Endpoints

Verify these endpoints return `403 Forbidden`:
- `/api/make-me-ceo`
- `/api/db-direct`
- Any debug/test endpoints

### 2. Configure Rate Limiting

Update rate limits for production in `src/lib/rate-limit.ts`:

```typescript
// Production rate limits
export const authRateLimit = rateLimit({
  maxRequests: 3,        // Stricter for auth
  windowMs: 15 * 60 * 1000
})

export const apiRateLimit = rateLimit({  
  maxRequests: 60,       // Lower for production
  windowMs: 15 * 60 * 1000
})
```

### 3. Enable Security Headers

Add to `next.config.js`:

```javascript
module.exports = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options', 
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          }
        ]
      }
    ]
  }
}
```

### 4. Configure CORS (if needed)

```javascript
// For API routes only if serving external clients
const corsOptions = {
  origin: ['https://yourdomain.com'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}
```

## 🚀 Deployment Platforms

### Vercel Deployment

1. **Environment Variables**
   ```bash
   # Set in Vercel dashboard
   DATABASE_URL=postgresql://...
   NEXTAUTH_SECRET=your-secret
   JWT_SECRET=your-jwt-secret
   GOOGLE_CLIENT_ID=your-client-id
   GOOGLE_CLIENT_SECRET=your-client-secret
   ```

2. **Build Configuration**
   ```bash
   # Vercel automatically runs:
   npm run build
   ```

3. **Domain Configuration**
   - Add custom domain
   - Enable SSL (automatic)
   - Configure redirects if needed

### Railway Deployment

1. **Connect Repository**
   ```bash
   railway login
   railway link
   ```

2. **Environment Variables**
   ```bash
   railway variables set DATABASE_URL=postgresql://...
   railway variables set NEXTAUTH_SECRET=your-secret
   # ... add all variables
   ```

3. **Database Setup**
   ```bash
   railway run npm run db:push
   ```

### Docker Deployment

1. **Create Dockerfile**
   ```dockerfile
   FROM node:18-alpine
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci --only=production
   COPY . .
   RUN npm run build
   EXPOSE 3000
   CMD ["npm", "start"]
   ```

2. **Docker Compose with Security**
   ```yaml
   version: '3.8'
   services:
     app:
       build: .
       ports:
         - "3000:3000"
       environment:
         - NODE_ENV=production
       env_file:
         - .env.local
       security_opt:
         - no-new-privileges:true
       read_only: true
       tmpfs:
         - /tmp
   ```

## 🔒 Post-Deployment Security

### 1. Security Testing

```bash
# Test critical endpoints return proper status codes
curl -I https://yourdomain.com/api/make-me-ceo
# Should return: HTTP/1.1 403 Forbidden

curl -I https://yourdomain.com/api/db-direct  
# Should return: HTTP/1.1 403 Forbidden
```

### 2. SSL/TLS Verification

- Test at: https://www.ssllabs.com/ssltest/
- Ensure A+ rating
- Verify HSTS headers

### 3. Security Headers Check

Test at: https://securityheaders.com/
- Ensure all headers are properly configured
- Fix any missing security headers

### 4. Rate Limit Testing

```bash
# Test rate limiting works
for i in {1..10}; do
  curl -X POST https://yourdomain.com/api/auth/register \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"test123","name":"test"}'
done
# Should show 429 Too Many Requests after limit reached
```

## 📊 Monitoring & Alerting

### 1. Application Monitoring

- **Error Tracking**: Sentry, Rollbar, or similar
- **Performance**: New Relic, DataDog
- **Uptime**: Pingdom, UptimeRobot

### 2. Security Monitoring

```javascript
// Log security events
const securityEvents = [
  'FAILED_LOGIN_ATTEMPT',
  'RATE_LIMIT_EXCEEDED', 
  'SUSPICIOUS_REQUEST',
  'PRIVILEGE_ESCALATION_ATTEMPT'
]

// Alert thresholds
const alertThresholds = {
  failedLogins: 10,      // per 15 minutes
  rateLimitHits: 100,    // per hour
  errorRate: 5          // per minute
}
```

### 3. Database Monitoring

- Connection pool status
- Query performance
- Backup verification
- Access pattern analysis

## 🔄 Maintenance & Updates

### Regular Security Tasks

**Weekly:**
- Review error logs
- Check security alerts
- Monitor unusual traffic patterns

**Monthly:**
- Update dependencies: `npm audit fix`
- Review user access permissions
- Rotate non-critical secrets

**Quarterly:**
- Rotate database credentials
- Update OAuth secrets
- Full security audit
- Penetration testing

### Emergency Response

**Security Incident Protocol:**

1. **Immediate Actions** (0-15 minutes)
   - Identify threat scope
   - Block suspicious IPs if needed
   - Preserve logs

2. **Containment** (15-60 minutes)  
   - Isolate affected systems
   - Rotate compromised credentials
   - Apply emergency patches

3. **Recovery** (1-24 hours)
   - Restore services safely
   - Verify system integrity
   - Monitor for recurring issues

4. **Post-Incident** (24-48 hours)
   - Document incident
   - Update security measures
   - Team training if needed

## 📋 Production Environment Variables

**Complete list for production deployment:**

```bash
# Database
DATABASE_URL="postgresql://user:pass@host:port/db"

# Authentication  
NEXTAUTH_SECRET="your-32-char-secret"
NEXTAUTH_URL="https://yourdomain.com"
JWT_SECRET="your-jwt-secret"

# OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Media (Optional)
CLOUDINARY_CLOUD_NAME="your-cloud-name" 
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your-cloud-name"

# Production Settings
NODE_ENV="production"
NEXT_TELEMETRY_DISABLED=1
```

## ⚠️ Critical Warnings

**NEVER DO THESE IN PRODUCTION:**
- ❌ Enable debug/test endpoints
- ❌ Use default or weak secrets
- ❌ Allow unrestricted CORS
- ❌ Skip SSL/HTTPS setup
- ❌ Use development database settings
- ❌ Commit secrets to version control
- ❌ Disable rate limiting
- ❌ Use verbose error messages

**ALWAYS DO THESE:**
- ✅ Use environment variables for all secrets
- ✅ Enable all security middleware  
- ✅ Set up proper monitoring
- ✅ Regular security updates
- ✅ Backup database regularly
- ✅ Test disaster recovery procedures

---

**Need help?** Contact the security team before deploying if you're unsure about any security configurations.