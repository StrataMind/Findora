# Art & Apparel Store

A simple, classic e-commerce website for selling paintings, t-shirts, and other products.

## Features

- Product catalog with categories
- Shopping cart
- Checkout & order management
- Admin dashboard for product management
- Clean, classic UI design

## Tech Stack

- Next.js 15 (App Router)
- TypeScript
- Prisma (PostgreSQL)
- NextAuth.js
- Tailwind CSS
- Cloudinary (image uploads)

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables in `.env`:
```
DATABASE_URL="your-postgresql-url"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
```

3. Set up database:
```bash
npm run db:push
```

4. Run development server:
```bash
npm run dev
```

5. Create admin user (in Prisma Studio or database):
```bash
npm run db:studio
```
Set `isAdmin: true` for your user account.

## Project Structure

```
src/
├── app/
│   ├── auth/          # Authentication pages
│   ├── cart/          # Shopping cart
│   ├── checkout/      # Checkout process
│   ├── dashboard/     # Admin dashboard
│   ├── orders/        # Order history
│   ├── products/      # Product pages
│   └── categories/    # Category pages
├── components/        # Reusable components
├── lib/              # Utilities & configurations
└── types/            # TypeScript types
```

## Admin Access

To manage products, create categories, and view orders, sign in with an account that has `isAdmin: true` in the database.

## License

MIT
