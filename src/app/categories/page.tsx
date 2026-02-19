import { prisma } from '@/lib/prisma';
import Link from 'next/link';

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({
    include: {
      _count: {
        select: { products: true },
      },
    },
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-serif mb-8">Categories</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/products?category=${category.slug}`}
            className="border border-neutral-300 p-8 hover:border-black hover:shadow-lg transition text-center"
          >
            <h2 className="text-2xl font-medium mb-2">{category.name}</h2>
            <p className="text-neutral-600">{category._count.products} products</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
