import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "@/components/providers/session-provider";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "sonner";
import { CartProvider } from "@/contexts/cart-context";
import { WishlistProvider } from "@/contexts/wishlist-context";
import CartSidebar from "@/components/cart/cart-sidebar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Findora - E-commerce Platform",
  description: "Modern e-commerce platform with secure authentication and seamless user experience",
  keywords: ["e-commerce", "shopping", "secure", "authentication", "next.js"],
  authors: [{ name: "Findora Team" }],
  icons: {
    icon: "/favicon.ico",
    apple: "/icon-192x192.svg",
  },
};

export function generateViewport() {
  return {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head />
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          <WishlistProvider>
            <CartProvider>
              {children}
              <CartSidebar />
              <Toaster />
              <Sonner position="top-right" />
            </CartProvider>
          </WishlistProvider>
        </Providers>
      </body>
    </html>
  );
}
