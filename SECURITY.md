# Security Guide for Findora E-commerce Platform

## 🛡️ Security Overview

This document outlines the security measures implemented in the Findora platform and provides guidelines for secure deployment and operations.

## 🔐 Environment Configuration

### Critical Environment Variables

**NEVER commit these files to version control:**
- `.env.local` - Contains production secrets
- `.env` - May contain sensitive configuration

**Required Environment Variables:**

```bash
# Database Configuration
DATABASE_URL="postgresql://username:password@host:port/database"

# Authentication Secrets
NEXTAUTH_SECRET="your-secure-random-secret-32-chars-min"
JWT_SECRET="your-secure-jwt-secret-32-chars-min"

# OAuth Configuration
GOOGLE_CLIENT_ID="your-google-oauth-client-id"  
GOOGLE_CLIENT_SECRET="your-google-oauth-client-secret"

# Media Storage (Optional)
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
```

### Generate Secure Secrets

```bash
# Generate NEXTAUTH_SECRET
openssl rand -base64 32

# Generate JWT_SECRET  
openssl rand -hex 32
```

## 🚫 Disabled Endpoints

The following endpoints have been **DISABLED** for security:

- `GET /api/make-me-ceo` - Privilege escalation endpoint
- `GET|POST|PUT|DELETE /api/db-direct` - Direct database access

These endpoints return `403 Forbidden` and should **never be enabled** in production.

## 🔒 Authentication & Authorization

### Session Management
- **JWT Strategy**: Secure token-based authentication
- **Session Duration**: 24 hours maximum
- **Auto-refresh**: Sessions update every hour
- **Validation**: Server-side user existence checks

### Role-Based Access Control

| Role | Permissions | Access |
|------|------------|---------|
| `BUYER` | Purchase products, manage profile | Public areas, dashboard |
| `SELLER` | Manage products, view analytics | Seller dashboard, product management |
| `ADMIN` | Moderate content, manage users | Admin panel |
| `SUPERUSER` | Platform management | All areas except CEO functions |
| `CEO` | Full platform control | All areas |

### Protected Routes

**Middleware Protection:**
- `/api/seller/*` - Seller access required
- `/api/superuser/*` - Admin/Superuser required  
- `/api/products/*` - Authentication required
- `/dashboard/*` - Authentication required
- `/seller/*` - Seller role required
- `/superuser/*` - Admin role required

## 🛡️ Rate Limiting

**Implemented Rate Limits:**

| Endpoint Type | Limit | Window |
|--------------|-------|---------|
| Authentication | 5 requests | 15 minutes |
| API Endpoints | 100 requests | 15 minutes |  
| Seller Registration | 10 requests | 1 hour |

**Rate Limit Headers:**
- `X-RateLimit-Remaining`: Remaining requests
- `Retry-After`: Seconds until reset

## 🔍 Input Validation & Sanitization

### Validation Features
- **HTML Sanitization**: Removes dangerous tags and characters
- **Email Normalization**: Lowercase and trim
- **File Upload Validation**: Type, size, and name checks
- **URL Security**: Blocks localhost and private IPs in production
- **Phone Number Validation**: International format validation

### Input Limits
- Short Text: 100 characters
- Medium Text: 500 characters  
- Long Text: 5,000 characters
- URLs: 2,048 characters
- Email: 254 characters
- Names: 50 characters

### Dangerous Content Blocking
- Script tags (`<script>`, `</script>`)
- Event handlers (`onclick`, `onerror`, etc.)
- Executable file extensions (`.exe`, `.bat`, `.js`)
- SQL injection patterns
- XSS attempt patterns

## 🚨 Error Handling

### Secure Error Messages
- **Production**: Generic error messages only
- **Development**: Detailed errors for debugging
- **Sensitive Data**: Automatically redacted from logs

### Error Categories
- `UNAUTHORIZED`: Authentication required
- `FORBIDDEN`: Access denied  
- `VALIDATION_ERROR`: Invalid input
- `RATE_LIMITED`: Too many requests
- `INTERNAL_ERROR`: Generic server error

## 📋 Security Checklist

### Pre-Production Deployment

- [ ] All environment variables configured securely
- [ ] Database credentials rotated and strong
- [ ] HTTPS enabled with valid SSL certificates
- [ ] Rate limiting configured appropriately
- [ ] Error logging configured (without sensitive data)
- [ ] Database backups scheduled
- [ ] Monitoring and alerting set up

### Regular Security Maintenance

- [ ] Update dependencies monthly
- [ ] Review access logs weekly
- [ ] Rotate secrets quarterly
- [ ] Security audit annually
- [ ] Monitor for suspicious activities
- [ ] Review user permissions monthly

## 🔧 Security Headers

Ensure these security headers are configured:

```javascript
// Next.js security headers
{
  "X-Frame-Options": "DENY",
  "X-Content-Type-Options": "nosniff", 
  "Referrer-Policy": "origin-when-cross-origin",
  "Permissions-Policy": "geolocation=(), microphone=(), camera=()"
}
```

## 📞 Incident Response

### Security Incident Process

1. **Immediate Response**
   - Identify and contain the threat
   - Preserve evidence and logs
   - Notify security team

2. **Investigation**  
   - Analyze logs and system state
   - Determine scope and impact
   - Document findings

3. **Recovery**
   - Patch vulnerabilities
   - Rotate compromised credentials
   - Restore services safely

4. **Post-Incident**
   - Review security measures
   - Update procedures
   - Train team members

## 🚨 Security Contacts

- **Security Issues**: security@findora.com
- **Emergency Hotline**: [Emergency Contact]
- **Incident Reports**: incidents@findora.com

## ⚠️ Known Limitations

- Rate limiting uses in-memory storage (not distributed)
- Session storage is not persistent across server restarts
- File uploads require additional virus scanning
- IP geolocation blocking needs implementation

## 📚 Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Security](https://nextjs.org/docs/advanced-features/security-headers)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [Database Security Guidelines](https://owasp.org/www-project-database-security/)

---

**Remember**: Security is an ongoing process, not a one-time setup. Regular reviews and updates are essential.