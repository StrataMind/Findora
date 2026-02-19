import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="py-32" style={{ backgroundColor: '#f5f2eb' }}>
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <h1 className="text-6xl mb-6 tracking-wide">Art & Apparel</h1>
          <div className="w-24 h-px mx-auto mb-6" style={{ backgroundColor: '#8b7355' }}></div>
          <p className="text-xl text-neutral-700 mb-12 leading-relaxed">
            Original paintings and custom designs, crafted with passion and attention to detail
          </p>
          <div className="flex gap-6 justify-center">
            <Link href="/art" className="px-10 py-4 hover:opacity-90 transition uppercase tracking-widest text-sm" style={{ backgroundColor: '#2d2d2d', color: '#faf8f3' }}>
              View Collection
            </Link>
            <Link href="#donate" className="border-2 px-10 py-4 hover:text-white transition uppercase tracking-widest text-sm" style={{ borderColor: '#2d2d2d', color: '#2d2d2d' }}>
              Support Artist
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Sections */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl mb-4">Explore</h2>
            <div className="w-16 h-px mx-auto" style={{ backgroundColor: '#8b7355' }}></div>
          </div>

          <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
            {/* Art Section */}
            <Link href="/art" className="group">
              <div className="bg-white border border-neutral-300 overflow-hidden hover:shadow-2xl transition-all duration-300">
                <div className="aspect-[4/3] flex items-center justify-center border-b border-neutral-300" style={{ backgroundColor: '#f5f2eb' }}>
                  <span className="text-neutral-500 text-sm uppercase tracking-widest">Original Paintings</span>
                </div>
                <div className="p-8 text-center">
                  <h3 className="text-2xl mb-4 group-hover:opacity-70 transition">Original Art</h3>
                  <p className="text-neutral-600 mb-6 leading-relaxed">
                    One-of-a-kind paintings available for purchase. Each piece is signed and comes with certificate of authenticity.
                  </p>
                  <span className="text-sm uppercase tracking-widest pb-1" style={{ borderBottom: '1px solid #2d2d2d' }}>View Collection</span>
                </div>
              </div>
            </Link>

            {/* Merchandise Section */}
            <Link href="/merchandise" className="group">
              <div className="bg-white border border-neutral-300 overflow-hidden hover:shadow-2xl transition-all duration-300">
                <div className="aspect-[4/3] flex items-center justify-center border-b border-neutral-300" style={{ backgroundColor: '#f5f2eb' }}>
                  <span className="text-neutral-500 text-sm uppercase tracking-widest">Merchandise</span>
                </div>
                <div className="p-8 text-center">
                  <h3 className="text-2xl mb-4 group-hover:opacity-70 transition">Merchandise</h3>
                  <p className="text-neutral-600 mb-6 leading-relaxed">
                    T-shirts, prints, and more featuring original designs. Launching soon.
                  </p>
                  <span className="text-sm uppercase tracking-widest pb-1" style={{ borderBottom: '1px solid #2d2d2d' }}>Learn More</span>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Donation */}
      <section id="donate" className="py-24" style={{ backgroundColor: '#f5f2eb' }}>
        <div className="container mx-auto px-4 max-w-2xl text-center">
          <h2 className="text-4xl mb-4">Support My Art</h2>
          <div className="w-16 h-px mx-auto mb-8" style={{ backgroundColor: '#8b7355' }}></div>
          <p className="text-lg text-neutral-700 mb-12 leading-relaxed">
            Your support helps me continue creating. Every contribution is deeply appreciated.
          </p>
          
          <div className="grid grid-cols-4 gap-4 mb-8">
            {[5, 10, 25, 50].map((amount) => (
              <button
                key={amount}
                className="bg-white border-2 border-neutral-300 py-6 hover:border-neutral-800 hover:bg-neutral-800 hover:text-white transition-all"
              >
                <span className="text-2xl">${amount}</span>
              </button>
            ))}
          </div>

          <div className="mb-8">
            <input
              type="number"
              placeholder="Custom amount"
              className="w-full px-6 py-4 bg-white border-2 border-neutral-300 focus:border-neutral-800 focus:outline-none mb-4 text-center"
            />
            <button className="w-full text-white py-4 hover:opacity-90 transition uppercase tracking-widest" style={{ backgroundColor: '#2d2d2d' }}>
              Donate Now
            </button>
          </div>

          <p className="text-sm text-neutral-600 uppercase tracking-wide">
            Secure payment powered by Stripe
          </p>
        </div>
      </section>

      {/* About */}
      <section className="py-24">
        <div className="container mx-auto px-4 max-w-2xl text-center">
          <h2 className="text-4xl mb-4">About the Artist</h2>
          <div className="w-16 h-px mx-auto mb-8" style={{ backgroundColor: '#8b7355' }}></div>
          <p className="text-lg text-neutral-700 leading-relaxed">
            I&apos;m an artist dedicated to creating original paintings and designs. 
            Each piece is crafted with passion, attention to detail, and a deep love for the creative process. 
            Thank you for visiting my gallery and supporting my work.
          </p>
        </div>
      </section>
    </div>
  );
}
