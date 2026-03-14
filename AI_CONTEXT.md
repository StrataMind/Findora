# AI Project Overview: Art & Apparel

**Last Updated:** March 2026  
**Project Status:** Production Ready ✅

---

## Table of Contents

1. [Project Summary](#project-summary)
2. [Business Context](#business-context)
3. [Technical Architecture](#technical-architecture)
4. [File Structure](#file-structure)
5. [Key Technologies](#key-technologies)
6. [Database Schema](#database-schema)
7. [Authentication & Security](#authentication--security)
8. [Pages & Routes](#pages--routes)
9. [Components](#components)
10. [APIs & Backend](#apis--backend)
11. [Frontend Structure](#frontend-structure)
12. [Configuration](#configuration)
13. [Deployment](#deployment)
14. [Important Notes](#important-notes)

---

## Project Summary

**Art & Apparel** is a modern Next.js e-commerce platform for selling original digital artwork and merchandise.

### Core Purpose
- Display original digital art for sale
- Sell prints and merchandise
- Accept donations/support from visitors
- Provide artist portfolio functionality

### Key Statistics
- **Framework:** Next.js 15
- **Language:** TypeScript
- **Database:** PostgreSQL
- **Hosting:** Vercel
- **Auth Method:** Google OAuth
- **Total Artworks:** 2 digital pieces

---

## Business Context

### Target Users
1. **Art Collectors** - Purchase original artwork
2. **Supporters** - Donate to support the artist
3. **Merchandise Buyers** - Purchase prints and items

### Revenue Streams
1. **Art Sales** - Direct purchase of digital artwork ($299-$349)
2. **Merchandise** - Future: prints, t-shirts, accessories
3. **Donations** - Via Stripe and Buy Me a Coffee
4. **Commissions** - Custom artwork requests

### Artist Contact
- **Email:** qnovalabs@gmail.com
- **Instagram:** @suraj_singh_nitk

---

## Technical Architecture

### Architecture Overview
```
┌─────────────────────────────────────────────────────────┐
│                     Next.js Frontend                     │
│  (TypeScript, React, Tailwind CSS)                       │
├─────────────────────────────────────────────────────────┤
│  Pages: /art, /merchandise, /auth, /privacy, /terms     │
├─────────────────────────────────────────────────────────┤
│                   Next.js Backend                        │
│  (API Routes, NextAuth.js)                              │
├─────────────────────────────────────────────────────────┤
│  APIs:                                                   │
│  - /api/auth/* (NextAuth)                               │
│  - /api/checkout (Stripe)                               │
│  - /api/donate (Payments)                               │
├─────────────────────────────────────────────────────────┤
│              External Services                           │
│  - Google OAuth (Authentication)                         │
│  - Stripe (Payments)                                     │
│  - PostgreSQL / Neon (Database)                          │
│  - Vercel (Hosting)                                      │
└─────────────────────────────────────────────────────────┘
```

### Data Flow
1. User visits site → Next.js renders page
2. User clicks "Sign In" → Google OAuth flow
3. NextAuth stores session in database
4. User adds items → Frontend state
5. User checkout → Stripe payment processing
6. Order saved → PostgreSQL

---

## File Structure

```
art-and-apparel/
│
├── src/
│   ├── app/                              # Next.js App Router
│   │   ├── api/
│   │   │   ├── auth/[...nextauth]/      # NextAuth endpoints
│   │   │   │   └── route.ts             # Auth configuration
│   │   │   ├── checkout/route.ts        # Stripe checkout
│   │   │   └── donate/route.ts          # Donation processing
│   │   │
│   │   ├── art/page.tsx                 # Art gallery page
│   │   ├── merchandise/page.tsx         # Shop/sell page
│   │   ├── auth/signin/page.tsx         # Sign-in page
│   │   ├── privacy/page.tsx             # Privacy policy
│   │   ├── terms/page.tsx               # Terms of service
│   │   │
│   │   ├── layout.tsx                   # Root layout
│   │   ├── page.tsx                     # Home page
│   │   └── globals.css                  # Global styles
│   │
│   ├── components/
│   │   ├── header.tsx                   # Navigation header
│   │   └── providers.tsx                # App providers (NextAuth)
│   │
│   ├── lib/
│   │   ├── auth.ts                      # NextAuth config
│   │   ├── db.ts                        # Database utilities
│   │   ├── prisma.ts                    # Prisma client instance
│   │   └── utils.ts                     # Helper functions
│   │
│   ├── types/
│   │   └── next-auth.d.ts               # NextAuth type definitions
│   │
│   └── middleware.ts                    # Next.js middleware
│
├── prisma/
│   └── schema.prisma                    # Database schema (Prisma)
│
├── public/
│   ├── art1.jpg                         # Digital artwork #1
│   ├── art2.jpg                         # Digital artwork #2
│   ├── favicon.ico                      # Site favicon
│   └── icon.svg                         # Site icon
│
├── .env.example                         # Environment variables template
├── next.config.ts                       # Next.js configuration
├── tsconfig.json                        # TypeScript configuration
├── tailwind.config.js                   # Tailwind CSS config
├── postcss.config.mjs                   # PostCSS configuration
├── eslint.config.mjs                    # ESLint rules
├── package.json                         # Dependencies
├── package-lock.json                    # Dependency lock file
│
├── README.md                            # Project documentation
├── LICENSE                              # MIT License
├── SECURITY.md                          # Security guidelines
├── COPYRIGHT.md                         # Copyright info
├── TERMS.md                             # Terms of Service
└── PRIVACY.md                           # Privacy Policy
```

---

## Key Technologies

### Frontend Stack
```
React 19.1.0           - UI library
Next.js 15.5.12        - Framework & SSR
TypeScript 5           - Type safety
Tailwind CSS 4.1.12    - Styling
PostCSS 8.5.6          - CSS processing
```

### Backend Stack
```
Next.js API Routes     - Backend
NextAuth.js 4.24.11    - Authentication
Prisma 6.13.0          - ORM
PostgreSQL             - Database (Neon)
bcryptjs 3.0.2         - Password hashing
```

### Tools & Services
```
Stripe                 - Payment processing
Google OAuth           - Authentication
Vercel                 - Hosting & deployment
Neon                   - PostgreSQL hosting
ESLint                 - Linting
```

---

## Database Schema

### Current Schema (Prisma)

```prisma
// User model
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String?
  image         String?
  accounts      Account[]
  sessions      Session[]
  orders        Order[]
  createdAt     DateTime  @default(now())
}

// NextAuth Account
model Account {
  id                 String  @id @default(cuid())
  userId             String
  type               String
  provider           String
  providerAccountId  String
  refresh_token      String?
  access_token       String?
  expires_at         Int?
  token_type         String?
  scope              String?
  id_token           String?
  session_state      String?
  user               User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@unique([provider, providerAccountId])
}

// NextAuth Session
model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

// Orders (for purchase history)
model Order {
  id          String   @id @default(cuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  artworkId   Int
  amount      Float
  status      String   // "completed", "pending", "failed"
  stripeId    String?  // Stripe payment intent ID
  createdAt   DateTime @default(now())
}
```

### Key Entities
- **User:** Customer/visitor account
- **Account:** OAuth provider links
- **Session:** Active sessions for authentication
- **Order:** Purchase history and records

---

## Authentication & Security

### Authentication Flow

1. **User Visits Site**
   - No authentication required initially
   - Can browse art and merchandise

2. **User Clicks "Sign In"**
   - Redirected to `/auth/signin`
   - "Sign in with Google" button shown

3. **Google OAuth Flow**
   - User authorizes Google access
   - Google redirects to callback
   - NextAuth creates session

4. **Session Stored**
   - Database stores session token
   - Cookie sent to browser (httpOnly, secure)
   - User logged in

5. **Protected Routes**
   - Checkout requires authentication
   - Donation page requires authentication
   - Account profile requires authentication

### Security Implementation

**Environment Variables (NEVER commit):**
```
DATABASE_URL           - PostgreSQL connection string
NEXTAUTH_SECRET        - Session encryption key
NEXTAUTH_URL           - Site URL (http://localhost:3000)
GOOGLE_CLIENT_ID       - From Google OAuth
GOOGLE_CLIENT_SECRET   - From Google OAuth
STRIPE_PUBLIC_KEY      - Stripe public key
STRIPE_SECRET_KEY      - Stripe secret key (server-only)
```

**Security Headers:**
```
X-Content-Type-Options: nosniff        - Prevent MIME sniffing
X-Frame-Options: DENY                  - Prevent clickjacking
X-XSS-Protection: 1; mode=block        - XSS protection
Cache-Control: immutable               - Prevent cache issues
```

**Security Best Practices:**
- ✅ Passwords hashed with bcryptjs
- ✅ OAuth instead of password storage
- ✅ HTTPS only in production
- ✅ CSRF protection enabled
- ✅ SQL injection prevention (Prisma ORM)
- ✅ Input validation on all forms

---

## Pages & Routes

### Public Pages (No Authentication)

| Route | Purpose | Content |
|-------|---------|---------|
| `/` | Home page | Hero, featured sections, explore links |
| `/art` | Art gallery | Display artwork for sale |
| `/merchandise` | Shop | Merchandise and prints |
| `/privacy` | Privacy policy | Data handling information |
| `/terms` | Terms of service | User agreement |

### Protected Pages (Requires Sign-In)

| Route | Purpose | Content |
|-------|---------|---------|
| `/checkout` | Purchase flow | Cart, payment info, order summary |
| `/account/orders` | Order history | Previous purchases |
| `/api/auth/*` | Authentication | Sign in, sign out, callbacks |

### API Routes

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/auth/signin` | GET/POST | Sign in with Google |
| `/api/auth/signout` | POST | Log out user |
| `/api/auth/callback/google` | GET | Google OAuth callback |
| `/api/checkout` | POST | Create Stripe payment intent |
| `/api/donate` | POST | Process donation |

---

## Components

### Layout Components

**Header Component** (`src/components/header.tsx`)
- Navigation menu
- Branding/logo
- User authentication status
- Sign-in/Sign-out buttons

**Providers Component** (`src/components/providers.tsx`)
- NextAuth SessionProvider
- Wraps entire app
- Enables session access throughout app

### Page Components

**Home Page** (`src/app/page.tsx`)
```
Hero Section
  ↓
Featured Sections (Art & Merchandise links)
  ↓
Donation Section
  ↓
About Artist Section
```

**Art Page** (`src/app/art/page.tsx`)
```
Gallery Title & Description
  ↓
Art Grid (2 pieces displayed)
  ├─ Digital Canvas #1 ($299)
  └─ Digital Canvas #2 ($349)
  ↓
Purchase Buttons
  ↓
Commission Request Section
```

**Merchandise Page** (`src/app/merchandise/page.tsx`)
```
Shop Title & Description
  ↓
Product Grid
  ├─ Product 1 (Art image, price, add to cart)
  └─ Product 2 (Art image, price, add to cart)
  ↓
Contact for Custom Orders Section
```

---

## APIs & Backend

### Authentication API

**NextAuth Configuration** (`src/lib/auth.ts`)
```typescript
// Configured to use:
// - Google OAuth provider
// - Prisma adapter (database storage)
// - Session strategy (JWT)
// - Custom callbacks for user creation

// Handles:
// - User sign-in
// - Session management
// - OAuth flow
// - Logout
```

### Checkout API

**POST `/api/checkout`**
```
Request Body:
{
  artworkId: number
  quantity: number
}

Response:
{
  clientSecret: string
  paymentIntentId: string
}
```

**Process:**
1. Validate user session
2. Validate artwork exists
3. Create Stripe payment intent
4. Return client secret for frontend payment

### Donation API

**POST `/api/donate`**
```
Request Body:
{
  amount: number (in cents)
  email: string
}

Response:
{
  paymentIntentId: string
  status: string
}
```

---

## Frontend Structure

### Styling
- **Framework:** Tailwind CSS
- **Colors:** Neutral palette (black, white, grays)
- **Responsive:** Mobile-first design
- **Components:** Card-based layout

### State Management
- **React Hooks:** useState, useContext
- **NextAuth Session:** Automatic session management
- **No Redux:** Simple app, built-in React state sufficient

### Form Handling
- **Email signup:** Newsletter opt-in
- **Search:** Not implemented (future)
- **Filters:** Not implemented (future)
- **Validation:** Client-side with HTML5, server-side validation in APIs

---

## Configuration

### Environment Variables

**Development (.env.local):**
```
DATABASE_URL=postgresql://localhost/artstore
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=dev-secret-key
GOOGLE_CLIENT_ID=your-dev-client-id
GOOGLE_CLIENT_SECRET=your-dev-secret
```

**Production (Vercel Dashboard):**
```
DATABASE_URL=postgresql://prod-neon-url
NEXTAUTH_URL=https://art-and-apparel.vercel.app
NEXTAUTH_SECRET=prod-secret-key
GOOGLE_CLIENT_ID=your-prod-client-id
GOOGLE_CLIENT_SECRET=your-prod-secret
STRIPE_PUBLIC_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
```

### Next.js Configuration (`next.config.ts`)
- ESLint ignored during builds
- TypeScript errors ignored
- Remote image patterns configured (Cloudinary)
- Security headers configured
- Compression enabled

### Tailwind Configuration (`tailwind.config.js`)
- Custom color scheme
- Responsive breakpoints
- Font configuration

---

## Deployment

### Deployment Platform: Vercel

**Automatic Deployment**
- Push to `main` branch on GitHub
- Vercel automatically builds and deploys
- No manual deployment needed

**Database**
- PostgreSQL hosted on Neon
- Connection string in environment variables
- Migrations run during build

**Environment Variables**
- Stored in Vercel Dashboard
- Not in version control
- Securely managed

**Preview Deployments**
- Pull requests get preview URLs
- Test changes before merging

### Build Process
```
1. npm run build
   └─ prisma generate (generate Prisma client)
   └─ prisma db push (apply schema changes)
   └─ next build (build Next.js app)

2. npm start
   └─ Start production server
```

---

## Important Notes

### Artwork Content
- 2 digital artworks currently available
- Images stored in `/public/` directory
- `art1.jpg` - Digital Canvas #1 ($299)
- `art2.jpg` - Digital Canvas #2 ($349)

### Payment Processing
- Stripe handles all payments
- Art & Apparel never stores credit card data
- PCI-DSS compliant

### Database Retention
- Order data: 3 years (tax purposes)
- Account data: Until deletion
- Session data: Until logout
- Analytics: Anonymized, unlimited

### User Privacy
- GDPR compliant
- CCPA compliant
- Privacy policy: `/privacy`
- Users can request data deletion

### Intellectual Property
- Artwork copyrighted (not under MIT license)
- Code under MIT license
- See COPYRIGHT.md for details

### Future Enhancements
- Merchandise store (t-shirts, prints)
- Commission booking system
- Art portfolio/gallery
- Newsletter functionality
- Social media integration
- Product reviews/ratings
- Wishlist feature

### Known Limitations
- Single artist platform
- Limited product inventory (2 items)
- No inventory management system
- No automatic email notifications
- Manual order fulfillment

---

## Development Workflow

### Local Development
```bash
# 1. Clone repository
git clone https://github.com/StrataMind/art-and-apparel.git
cd art-and-apparel

# 2. Install dependencies
npm install

# 3. Set up environment
cp .env.example .env.local
# Edit .env.local with your credentials

# 4. Set up database
npm run db:push

# 5. Start dev server
npm run dev
# Visit http://localhost:3000
```

### Development Commands
```bash
npm run dev              # Start dev server
npm run build            # Build for production
npm start                # Start prod server
npm run lint             # Run ESLint
npm run db:push         # Push schema to DB
npm run db:studio       # Open Prisma Studio GUI
```

### Git Workflow
```bash
# Feature branch
git checkout -b feature/my-feature
git add .
git commit -m "Add my feature"
git push origin feature/my-feature
# Create pull request on GitHub

# After merge to main
git checkout main
git pull
npm install
npm run dev
```

---

## Key Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| next | 15.5.12 | React framework |
| react | 19.1.0 | UI library |
| typescript | 5 | Type safety |
| tailwindcss | 4.1.12 | Styling |
| next-auth | 4.24.11 | Authentication |
| prisma | 6.13.0 | Database ORM |
| bcryptjs | 3.0.2 | Password hashing |
| @prisma/client | 6.13.0 | Prisma client |

---

## Common Issues & Solutions

### Issue: "Cannot find module '@/lib/prisma'"
**Solution:** Run `npm install` to install dependencies

### Issue: "NEXTAUTH_SECRET not set"
**Solution:** Add to `.env.local`: `NEXTAUTH_SECRET=$(openssl rand -base64 32)`

### Issue: "Database connection failed"
**Solution:** Check DATABASE_URL in .env.local, ensure Neon is running

### Issue: "Google OAuth not working"
**Solution:** Verify CLIENT_ID and CLIENT_SECRET match Google OAuth console

### Issue: "Stripe payment failing"
**Solution:** Check STRIPE_SECRET_KEY is set in production

---

## Quick Reference

### Important Files
- `src/app/page.tsx` - Homepage logic
- `src/lib/auth.ts` - Authentication setup
- `prisma/schema.prisma` - Database structure
- `.env.example` - Required environment variables
- `package.json` - Dependencies and scripts

### Key Concepts
- **Next.js App Router:** File-based routing in `/app` directory
- **Prisma:** TypeScript ORM for database
- **NextAuth.js:** Authentication library for OAuth
- **Tailwind CSS:** Utility-first CSS framework
- **Stripe:** Payment processing service

### Important URLs
- **Local Dev:** http://localhost:3000
- **Production:** https://art-and-apparel.vercel.app
- **GitHub:** https://github.com/StrataMind/art-and-apparel
- **Artist Email:** qnovalabs@gmail.com

---

## For AI Assistants: Key Context

**When modifying this project, remember:**

1. **Two art pieces:** Only art1.jpg and art2.jpg exist
2. **Authentication required:** Checkout and donations need session
3. **Stripe integration:** All payments go through Stripe API
4. **Database-backed:** User data persists in PostgreSQL
5. **TypeScript:** Type safety required, compile-time errors matter
6. **Security-first:** No hardcoding secrets, use env variables
7. **Responsive design:** Must work on mobile, tablet, desktop
8. **Artist's brand:** Maintain neutral, elegant aesthetic
9. **Legal compliance:** Privacy, GDPR, CCPA compliant
10. **Future-ready:** Code should support merchandise expansion

---

**Document Version:** 1.0  
**Last Updated:** March 2026  
**Status:** Complete ✅

For questions, contact: qnovalabs@gmail.com
