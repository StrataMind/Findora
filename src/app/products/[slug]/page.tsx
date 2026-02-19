'use client';

import { useState, useEffect } from 'react';
import { useCart } from '@/contexts/cart-context';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ProductPage({ params }: { params: { slug: string } }) {
  const [product, setProduct] = useState<any>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCart();
  const router = useRouter();

  useEffect(() => {
    fetch(`/api/products?slug=${params.slug}`)
      .then((res) => res.json())
      .then((data) => setProduct(data));
  }, [params.slug]);

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p>Loading...</p>
      </div>
    );
  }

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0]?.url,
      slug: product.slug,
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Link href="/products" className="text-neutral-600 hover:text-black mb-4 inline-block">
        ← Back to Products
      </Link>

      <div className="grid md:grid-cols-2 gap-12 mt-8">
        {/* Images */}
        <div>
          {product.images[selectedImage] && (
            <img
              src={product.images[selectedImage].url}
              alt={product.name}
              className="w-full h-96 object-cover border border-neutral-200 mb-4"
            />
          )}
          {product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {product.images.map((img: any, idx: number) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`border ${selectedImage === idx ? 'border-black' : 'border-neutral-200'}`}
                >
                  <img src={img.url} alt="" className="w-full h-20 object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div>
          <h1 className="text-4xl font-serif mb-4">{product.name}</h1>
          {product.category && (
            <p className="text-neutral-600 mb-4">{product.category.name}</p>
          )}
          <p className="text-3xl font-semibold mb-6">${product.price.toFixed(2)}</p>
          
          <div className="mb-6">
            <p className="text-neutral-700 leading-relaxed">{product.description}</p>
          </div>

          {product.inventory > 0 ? (
            <>
              <div className="mb-6">
                <label className="block mb-2 font-medium">Quantity</label>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 border border-neutral-300 hover:border-black"
                  >
                    -
                  </button>
                  <span className="text-lg">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.inventory, quantity + 1))}
                    className="w-10 h-10 border border-neutral-300 hover:border-black"
                  >
                    +
                  </button>
                </div>
                <p className="text-sm text-neutral-500 mt-2">{product.inventory} in stock</p>
              </div>

              <button
                onClick={handleAddToCart}
                className="w-full bg-black text-white py-4 hover:bg-neutral-800 transition"
              >
                Add to Cart
              </button>
            </>
          ) : (
            <p className="text-red-600 font-medium">Out of Stock</p>
          )}
        </div>
      </div>
    </div>
  );
}
