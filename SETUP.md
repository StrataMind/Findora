# Art & Apparel - Setup Guide

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Configuration
Copy and update `.env.local` with your credentials:
```bash
# Database (PostgreSQL via Neon)
DATABASE_URL="postgresql://user:password@host:5432/artstore"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"  # or your deployment URL
NEXTAUTH_SECRET="generate-a-random-secret-here"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

### 3. Setup Database
```bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# (Optional) View database in UI
npx prisma studio
```

### 4. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes (auth, checkout, donate)
│   ├── art/               # Art gallery page
│   ├── merchandise/       # Shop page
│   ├── auth/signin/       # Sign in page
│   ├── privacy/           # Privacy policy
│   ├── terms/             # Terms of service
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── header.tsx         # Navigation
│   └── providers.tsx      # NextAuth provider
├── lib/                   # Utilities
│   ├── auth.ts            # NextAuth config
│   ├── prisma.ts          # Prisma client
│   └── utils.ts           # Helper functions
├── middleware.ts          # Route protection
└── types/                 # TypeScript definitions
prisma/
└── schema.prisma          # Database schema
```

## Features

- ✅ Authentication (Google OAuth via NextAuth)
- ✅ Digital artwork gallery
- ✅ Merchandise store
- ✅ Payment integration (Stripe-ready)
- ✅ Donation support
- ✅ User orders tracking
- ✅ TypeScript support
- ✅ Tailwind CSS styling

## Available Scripts

```bash
npm run dev        # Start development server
npm run build      # Build for production
npm start          # Start production server
npm run lint       # Run ESLint
npm run db:push    # Sync Prisma schema
npm run db:studio  # Open Prisma Studio
```

## Deployment

### Vercel (Recommended)
1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Other Platforms
- Environment: Node.js 18+
- Build command: `npm run build`
- Start command: `npm start`
- Port: 3000

## Support

- Email: qnovalabs@gmail.com
- Instagram: @suraj_singh_nitk
