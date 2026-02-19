import './globals.css';
import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const metadata = {
  title: 'Art & Apparel Store',
  description: 'Original paintings and custom t-shirts',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <header className="border-b border-neutral-200">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <Link href="/" className="text-2xl font-serif">Art & Apparel</Link>
            
            <nav className="hidden md:flex gap-8">
              <Link href="/products" className="hover:underline">Products</Link>
              <Link href="/categories" className="hover:underline">Categories</Link>
            </nav>

            <div className="flex items-center gap-4">
              <Link href="/cart" className="hover:underline">Cart</Link>
              {session ? (
                <>
                  <Link href="/orders" className="hover:underline">Orders</Link>
                  {session.user.isAdmin && (
                    <Link href="/dashboard" className="hover:underline">Dashboard</Link>
                  )}
                  <Link href="/profile" className="hover:underline">Profile</Link>
                </>
              ) : (
                <Link href="/auth/signin" className="hover:underline">Sign In</Link>
              )}
            </div>
          </div>
        </header>

        <main>{children}</main>

        <footer className="border-t border-neutral-200 mt-20">
          <div className="container mx-auto px-4 py-8 text-center text-neutral-600">
            <p>&copy; {new Date().getFullYear()} Art & Apparel. All rights reserved.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
