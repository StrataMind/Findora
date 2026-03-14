"use client";

import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";

export function Header() {
  const { data: session } = useSession();

  return (
    <header className="bg-slate-900 text-white sticky top-0 z-50 shadow-lg">
      <nav className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold">
          Art & Apparel
        </Link>

        <div className="flex items-center gap-6">
          <Link href="/art" className="hover:text-amber-400 transition">
            Gallery
          </Link>
          <Link href="/merchandise" className="hover:text-amber-400 transition">
            Shop
          </Link>

          {session?.user ? (
            <div className="flex items-center gap-4">
              <span className="text-sm">{session.user.name}</span>
              <button
                onClick={() => signOut()}
                className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded transition"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <button
              onClick={() => signIn("google")}
              className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded transition"
            >
              Sign In
            </button>
          )}
        </div>
      </nav>
    </header>
  );
}
