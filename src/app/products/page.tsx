import { prisma } from '@/lib/prisma';
import Link from 'next/link';

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: { search?: string; category?: string };
}) {
  const products = await prisma.product.findMany({
    where: {
      ...(searchParams.search && {
        OR: [
          { name: { contains: searchParams.search, mode: 'insensitive' } },
          { description: { contains: searchParams.search, mode: 'insensitive' } },
        ],
      }),
      ...(searchParams.category && {
        category: { slug: searchParams.category },
      }),
    },
    include: { 
      images: { take: 1, orderBy: { position: 'asc' } },
      category: { select: { name: true } }
    },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  const categories = await prisma.category.findMany({
    select: { id: true, name: true, slug: true }
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-serif mb-8">Products</h1>

      <div className="mb-8 flex gap-4 flex-wrap">
        <Link
          href="/products"
          className={`px-4 py-2 border ${!searchParams.category ? 'bg-black text-white' : 'border-neutral-300 hover:border-black'}`}
        >
          All
        </Link>
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/products?category=${cat.slug}`}
            className={`px-4 py-2 border ${searchParams.category === cat.slug ? 'bg-black text-white' : 'border-neutral-300 hover:border-black'}`}
          >
            {cat.name}
          </Link>
        ))}
      </div>

      {products.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-xl text-neutral-600">No products found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map((product) => (
            <Link key={product.id} href={`/products/${product.slug}`}>
              <div className="bg-white border border-neutral-200 hover:shadow-lg transition">
                {product.images[0] && (
                  <img
                    src={product.images[0].url}
                    alt={product.name}
                    className="w-full h-64 object-cover"
                    loading="lazy"
                  />
                )}
                <div className="p-4">
                  <h3 className="font-medium mb-2">{product.name}</h3>
                  {product.category && (
                    <p className="text-sm text-neutral-500 mb-2">{product.category.name}</p>
                  )}
                  <p className="text-lg font-semibold">${product.price.toFixed(2)}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
