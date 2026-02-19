# Vercel Deployment Guide

## ✅ Security Updates Applied

The project now includes:
- Security headers (X-Frame-Options, X-XSS-Protection, etc.)
- Proper .gitignore for sensitive files
- Environment variable configuration
- Security policy documentation

## Deploy to Vercel

### 1. Connect Repository
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New" → "Project"
3. Import your GitHub repository: `StrataMind/Findora`

### 2. Configure Environment Variables
In Vercel project settings, add these environment variables:

**Required:**
```
DATABASE_URL=postgresql://user:password@host:5432/database
NEXTAUTH_URL=https://your-domain.vercel.app
NEXTAUTH_SECRET=generate-a-random-secret-key
```

**For Image Uploads (Optional):**
```
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### 3. Generate NEXTAUTH_SECRET
Run this command locally:
```bash
openssl rand -base64 32
```
Copy the output and use it as your `NEXTAUTH_SECRET`

### 4. Database Setup
- Use [Neon](https://neon.tech), [Supabase](https://supabase.com), or [Railway](https://railway.app) for PostgreSQL
- Copy the connection string to `DATABASE_URL`
- After deployment, run migrations:
  ```bash
  npx prisma db push
  ```

### 5. Deploy
Click "Deploy" and Vercel will build your project.

## Post-Deployment

### Create Admin User
1. Go to your database (Prisma Studio or database GUI)
2. Create a user account
3. Set `isAdmin: true` for that user
4. Sign in and access `/dashboard`

### Test Security
Your site should now have:
- ✅ HTTPS enabled
- ✅ Security headers active
- ✅ No exposed environment variables
- ✅ Protected admin routes

## Troubleshooting

**Build fails?**
- Check environment variables are set correctly
- Ensure DATABASE_URL is accessible from Vercel

**Can't sign in?**
- Verify NEXTAUTH_URL matches your domain
- Check NEXTAUTH_SECRET is set

**Images not uploading?**
- Verify Cloudinary credentials
- Check API key permissions

## Security Checklist

- ✅ Environment variables set in Vercel (not in code)
- ✅ .env files not committed to Git
- ✅ HTTPS enabled (automatic on Vercel)
- ✅ Security headers configured
- ✅ Database connection secured
- ✅ Admin routes protected

Your project is now secure and ready for production! 🚀
