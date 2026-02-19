import Link from 'next/link';
import { prisma } from '@/lib/prisma';

export default async function HomePage() {
  const products = await prisma.product.findMany({
    take: 8,
    include: { images: true, category: true },
    orderBy: { createdAt: 'desc' }
  });

  const categories = await prisma.category.findMany();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-neutral-100 py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-serif mb-4">Art & Apparel</h1>
          <p className="text-xl text-neutral-600 mb-8">Original paintings and custom t-shirts</p>
          <Link href="/products" className="inline-block bg-black text-white px-8 py-3 hover:bg-neutral-800">
            Shop Now
          </Link>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-serif text-center mb-12">Shop by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {categories.map((category) => (
              <Link key={category.id} href={`/products?category=${category.slug}`} 
                className="border border-neutral-300 p-6 text-center hover:border-black transition">
                <h3 className="text-lg font-medium">{category.name}</h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-neutral-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-serif text-center mb-12">Latest Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.map((product) => (
              <Link key={product.id} href={`/products/${product.slug}`} className="group">
                <div className="bg-white border border-neutral-200 overflow-hidden">
                  {product.images[0] && (
                    <img src={product.images[0].url} alt={product.name} 
                      className="w-full h-64 object-cover group-hover:opacity-90 transition" />
                  )}
                  <div className="p-4">
                    <h3 className="font-medium mb-2">{product.name}</h3>
                    <p className="text-neutral-600">${product.price.toFixed(2)}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
