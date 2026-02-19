import './globals.css';
import Header from '@/components/header';
import Providers from '@/components/providers';

export const metadata = {
  title: 'Art & Apparel - Original Paintings & Designs',
  description: 'Original paintings and custom designs by [Artist Name]',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600&family=Lora:wght@400;500;600&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased">
        <Providers>
          <Header />
          <main>{children}</main>
          <footer className="border-t border-neutral-300 mt-20" style={{ backgroundColor: '#f5f2eb' }}>
            <div className="container mx-auto px-4 py-12">
              <div className="grid md:grid-cols-3 gap-8 mb-8">
                <div>
                  <h3 className="text-lg font-medium mb-3">About</h3>
                  <p className="text-sm text-neutral-700 leading-relaxed">
                    Original artwork and designs crafted with passion and attention to detail.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-3">Contact</h3>
                  <p className="text-sm text-neutral-700">
                    Email: artist@example.com<br />
                    Instagram: @artistname
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-3">Newsletter</h3>
                  <div className="flex gap-2">
                    <input
                      type="email"
                      placeholder="Your email"
                      className="flex-1 px-3 py-2 text-sm bg-white border border-neutral-300 focus:border-neutral-800 focus:outline-none"
                    />
                    <button className="text-white px-4 py-2 text-sm hover:opacity-90" style={{ backgroundColor: '#2d2d2d' }}>
                      Subscribe
                    </button>
                  </div>
                </div>
              </div>
              <div className="text-center text-sm text-neutral-600 pt-8 border-t border-neutral-300">
                <p>&copy; {new Date().getFullYear()} Art & Apparel. All rights reserved.</p>
              </div>
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
