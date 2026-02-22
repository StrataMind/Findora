'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useState } from 'react';

export default function Header() {
  const { data: session, status } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="border-b border-neutral-300 bg-white/80 backdrop-blur-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-4 md:py-6">
          <Link href="/" className="text-2xl md:text-3xl tracking-wide hover:opacity-70 transition" style={{ color: '#2d2d2d' }}>
            Art & Apparel
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex gap-12 text-sm uppercase tracking-widest">
            <Link href="/art" className="hover:opacity-70 transition" style={{ color: '#2d2d2d' }}>Paintings</Link>
            <Link href="/merchandise" className="hover:opacity-70 transition" style={{ color: '#2d2d2d' }}>Merchandise</Link>
            <a href="#donate" className="hover:opacity-70 transition" style={{ color: '#2d2d2d' }}>Support</a>
          </nav>

          <div className="flex items-center gap-4 text-sm">
            {/* Auth - desktop */}
            <div className="hidden md:flex items-center gap-6">
              {status === 'loading' ? (
                <span className="text-neutral-600">Loading...</span>
              ) : session ? (
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

            {/* Hamburger */}
            <button
              className="md:hidden flex flex-col gap-1.5 p-1"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              <span className={`block w-6 h-0.5 bg-neutral-800 transition-transform duration-300 ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
              <span className={`block w-6 h-0.5 bg-neutral-800 transition-opacity duration-300 ${menuOpen ? 'opacity-0' : ''}`} />
              <span className={`block w-6 h-0.5 bg-neutral-800 transition-transform duration-300 ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-neutral-200 py-4 flex flex-col gap-4 text-sm uppercase tracking-widest" style={{ color: '#2d2d2d' }}>
            <Link href="/art" onClick={() => setMenuOpen(false)} className="hover:opacity-70 transition">Paintings</Link>
            <Link href="/merchandise" onClick={() => setMenuOpen(false)} className="hover:opacity-70 transition">Merchandise</Link>
            <a href="#donate" onClick={() => setMenuOpen(false)} className="hover:opacity-70 transition">Support</a>
            <div className="border-t border-neutral-200 pt-4">
              {status === 'loading' ? (
                <span className="text-neutral-600">Loading...</span>
              ) : session ? (
                <div className="flex flex-col gap-2">
                  <span className="text-neutral-600 normal-case">Welcome, {session.user?.name?.split(' ')[0]}</span>
                  <button onClick={() => { signOut(); setMenuOpen(false); }} className="text-left hover:opacity-70 transition">Sign Out</button>
                </div>
              ) : (
                <Link href="/auth/signin" onClick={() => setMenuOpen(false)} className="hover:opacity-70 transition">Sign In</Link>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
