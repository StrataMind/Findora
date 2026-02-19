'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';

export default function Header() {
  const { data: session } = useSession();

  return (
    <header className="border-b border-neutral-300 bg-white/80 backdrop-blur-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-6">
          <Link href="/" className="text-3xl tracking-wide hover:opacity-70 transition" style={{ color: '#2d2d2d' }}>
            Art & Apparel
          </Link>

          <nav className="hidden md:flex gap-12 text-sm uppercase tracking-widest">
            <Link href="/art" className="hover:opacity-70 transition" style={{ color: '#2d2d2d' }}>Paintings</Link>
            <Link href="/merchandise" className="hover:opacity-70 transition" style={{ color: '#2d2d2d' }}>Merchandise</Link>
            <a href="#donate" className="hover:opacity-70 transition" style={{ color: '#2d2d2d' }}>Support</a>
          </nav>

          <div className="flex items-center gap-6 text-sm">
            {session ? (
              <>
                <span className="text-neutral-600">Welcome, {session.user?.name?.split(' ')[0]}</span>
                <button onClick={() => signOut()} className="hover:opacity-70 transition uppercase tracking-wide" style={{ color: '#2d2d2d' }}>
                  Sign Out
                </button>
              </>
            ) : (
              <Link href="/auth/signin" className="hover:opacity-70 transition uppercase tracking-wide" style={{ color: '#2d2d2d' }}>
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
