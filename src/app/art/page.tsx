const paintings = [
  { 
    id: 1, 
    title: 'Sunset Dreams', 
    price: 250,
    size: '24" × 36"',
    medium: 'Oil on Canvas',
    description: 'A vibrant sunset over rolling hills',
    available: true
  },
  { 
    id: 2, 
    title: 'Ocean Waves', 
    price: 300,
    size: '30" × 40"',
    medium: 'Acrylic on Canvas',
    description: 'Powerful waves crashing on the shore',
    available: true
  },
  { 
    id: 3, 
    title: 'Mountain View', 
    price: 350,
    size: '36" × 48"',
    medium: 'Oil on Canvas',
    description: 'Majestic mountain landscape',
    available: true
  },
  { 
    id: 4, 
    title: 'Abstract Mind', 
    price: 200,
    size: '20" × 30"',
    medium: 'Mixed Media',
    description: 'Abstract expression of thoughts',
    available: false
  },
  { 
    id: 5, 
    title: 'City Lights', 
    price: 275,
    size: '24" × 36"',
    medium: 'Acrylic on Canvas',
    description: 'Urban nightscape with vibrant lights',
    available: true
  },
  { 
    id: 6, 
    title: 'Nature Flow', 
    price: 225,
    size: '20" × 30"',
    medium: 'Watercolor',
    description: 'Flowing natural forms and colors',
    available: true
  },
];

export default function ArtPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center mb-16">
        <h1 className="text-5xl mb-4">Original Paintings</h1>
        <div className="w-16 h-px bg-neutral-400 mx-auto mb-6"></div>
        <p className="text-lg text-neutral-600 max-w-2xl mx-auto leading-relaxed">
          Each piece is an original, one-of-a-kind artwork. All paintings are signed and come with a certificate of authenticity.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 max-w-6xl mx-auto">
        {paintings.map((painting) => (
          <div key={painting.id} className="border border-neutral-300 hover:shadow-2xl transition-all duration-300">
            <div className="aspect-[3/4] bg-neutral-100 flex items-center justify-center border-b border-neutral-300">
              <span className="text-neutral-400 text-sm uppercase tracking-widest">Image</span>
            </div>
            <div className="p-6">
              <h3 className="text-2xl mb-3 text-center">{painting.title}</h3>
              <p className="text-sm text-neutral-600 mb-4 text-center italic">{painting.description}</p>
              
              <div className="space-y-2 text-sm mb-6 text-center border-t border-b border-neutral-200 py-4">
                <p className="text-neutral-600">{painting.size}</p>
                <p className="text-neutral-600">{painting.medium}</p>
              </div>

              <div className="text-center">
                <p className="text-3xl mb-4">${painting.price}</p>
                {painting.available ? (
                  <button className="w-full bg-neutral-900 text-white px-6 py-3 hover:bg-black transition uppercase tracking-widest text-sm">
                    Purchase
                  </button>
                ) : (
                  <span className="block text-red-600 uppercase tracking-widest text-sm py-3">Sold</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-16 md:mt-24 bg-neutral-50 p-6 md:p-12 text-center max-w-3xl mx-auto border border-neutral-300">
        <h2 className="text-3xl mb-4">Commission Work</h2>
        <div className="w-16 h-px bg-neutral-400 mx-auto mb-6"></div>
        <p className="text-neutral-600 mb-8 leading-relaxed">
          Interested in a custom painting? I accept commissions for original artwork. Contact me to discuss your vision and bring your ideas to life.
        </p>
        <a href="mailto:artist@example.com" className="inline-block bg-neutral-900 text-white px-10 py-4 hover:bg-black transition uppercase tracking-widest text-sm">
          Request Commission
        </a>
      </div>
    </div>
  );
}
