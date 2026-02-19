# Art & Apparel

A classic, elegant art gallery website for showcasing original paintings and accepting donations. Built with Next.js and featuring Google OAuth authentication.

## Features

- 🎨 Original paintings gallery with purchase options
- 👕 Merchandise page (coming soon)
- 💝 Donation system with custom amounts
- 🔐 Google Sign-In authentication
- 📱 Fully responsive design
- ✨ Classic cream aesthetic with serif typography

## Tech Stack

- **Framework:** Next.js 15
- **Database:** PostgreSQL with Prisma ORM
- **Authentication:** NextAuth.js (Google OAuth)
- **Styling:** Tailwind CSS
- **Fonts:** Playfair Display & Lora (Google Fonts)
- **Deployment:** Vercel

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- Google OAuth credentials

### Installation

1. Clone the repository:
```bash
git clone https://github.com/StrataMind/Findora.git
cd Findora
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables (`.env`):
```env
DATABASE_URL="postgresql://user:password@localhost:5432/artstore"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

4. Set up the database:
```bash
npm run db:push
```

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the site.

## Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (development)
   - `https://your-domain.com/api/auth/callback/google` (production)
6. Copy Client ID and Client Secret to `.env`

## Project Structure

```
src/
├── app/
│   ├── art/              # Paintings gallery page
│   ├── merchandise/      # Merchandise page (coming soon)
│   ├── auth/signin/      # Google sign-in page
│   ├── api/auth/         # NextAuth API routes
│   ├── layout.tsx        # Root layout with fonts
│   └── page.tsx          # Homepage
├── components/
│   ├── header.tsx        # Navigation header
│   └── providers.tsx     # Session provider
├── lib/
│   ├── auth.ts           # NextAuth configuration
│   └── prisma.ts         # Prisma client
└── types/
    └── next-auth.d.ts    # TypeScript types
```

## Database Schema

- **User** - Google OAuth users
- **Account** - OAuth account details
- **Session** - User sessions
- **Donation** - Donation records

## Customization

### Update Paintings

Edit `src/app/art/page.tsx` to add/modify paintings:
```typescript
const paintings = [
  { 
    title: 'Your Painting',
    price: 250,
    size: '24" × 36"',
    medium: 'Oil on Canvas',
    description: 'Description',
    available: true
  },
  // Add more...
];
```

### Change Colors

Edit `src/app/globals.css` to modify the color scheme:
```css
body {
  background-color: #faf8f3; /* Cream background */
}
```

### Update Contact Info

Edit `src/app/layout.tsx` footer section with your email and social links.

## Deployment

### Deploy to Vercel

1. Push code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy

### Environment Variables in Vercel

Add these in Project Settings → Environment Variables:
- `DATABASE_URL`
- `NEXTAUTH_URL` (your Vercel domain)
- `NEXTAUTH_SECRET`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run db:push` - Push schema to database
- `npm run db:studio` - Open Prisma Studio

## Design Features

- Classic cream background (#faf8f3)
- Serif typography (Playfair Display, Lora)
- Elegant spacing and borders
- Warm brown accents (#8b7355)
- Responsive grid layouts
- Smooth hover transitions

## License

MIT

## Support

For questions or issues, contact: artist@example.com
