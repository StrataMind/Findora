'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useCart } from '@/contexts/cart-context';

export default function Header() {
  const { data: session } = useSession();
  const { state } = useCart();

  return (
    <header className="border-b border-neutral-200 bg-white">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="text-2xl font-serif hover:opacity-80">
          Art & Apparel
        </Link>
        
        <nav className="hidden md:flex gap-8">
          <Link href="/products" className="hover:underline">Products</Link>
          <Link href="/categories" className="hover:underline">Categories</Link>
        </nav>

        <div className="flex items-center gap-4 text-sm">
          <Link href="/cart" className="hover:underline">
            Cart{state.totalItems > 0 && ` (${state.totalItems})`}
          </Link>
          {session ? (
            <>
              {session.user.isAdmin && (
                <Link href="/dashboard" className="hover:underline">Dashboard</Link>
              )}
              <button onClick={() => signOut()} className="hover:underline">
                Sign Out
              </button>
            </>
          ) : (
            <Link href="/auth/signin" className="hover:underline">Sign In</Link>
          )}
        </div>
      </div>
    </header>
  );
}
