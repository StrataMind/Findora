import type { Metadata } from "next";
import { Providers } from "@/components/providers";
import { Header } from "@/components/header";
import "./globals.css";

export const metadata: Metadata = {
  title: "Art & Apparel - Original Digital Artwork",
  description: "Discover and purchase original digital artwork and merchandise",
  keywords: "art, digital art, merchandise, prints, artwork",
  authors: [{ name: "Suraj Singh" }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-50">
        <Providers>
          <Header />
          <main className="min-h-screen">{children}</main>
          <footer className="bg-slate-900 text-white py-8">
            <div className="max-w-7xl mx-auto px-4">
              <p>&copy; 2026 Art & Apparel. All rights reserved.</p>
              <p className="text-sm text-slate-400">
                Email: qnovalabs@gmail.com | Instagram: @suraj_singh_nitk
              </p>
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
