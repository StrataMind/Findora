"use client";

import Image from "next/image";
import { useSession, signIn } from "next-auth/react";
import { useState } from "react";
import { formatPrice } from "@/lib/utils";

const MERCHANDISE = [
  {
    id: "m1",
    title: "Premium Art Print",
    description: "High-quality art print (12x16 inches)",
    price: 49.99,
    image: "/art1.jpg",
  },
  {
    id: "m2",
    title: "T-Shirt - Limited Edition",
    description: "100% cotton t-shirt with custom design",
    price: 34.99,
    image: "/art2.jpg",
  },
  {
    id: "m3",
    title: "Canvas Print",
    description: "Museum-quality canvas (18x24 inches)",
    price: 89.99,
    image: "/art1.jpg",
  },
  {
    id: "m4",
    title: "Hoodie - Artist Collaboration",
    description: "Comfortable hoodie with exclusive design",
    price: 59.99,
    image: "/art2.jpg",
  },
];

export default function MerchandisePage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);

  const handleAddToCart = async (itemId: string, price: number) => {
    if (!session) {
      signIn("google");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          artworkId: itemId,
          quantity: 1,
        }),
      });

      if (response.ok) {
        alert("Item added to order!");
      } else {
        alert("Failed to add item");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-4">Merchandise Store</h1>
      <p className="text-lg text-gray-600 mb-12">
        High-quality prints and apparel featuring our exclusive designs
      </p>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {MERCHANDISE.map((item) => (
          <div key={item.id} className="bg-white rounded-lg shadow hover:shadow-lg transition">
            <div className="relative h-48 bg-gray-200">
              <Image
                src={item.image}
                alt={item.title}
                fill
                className="object-cover rounded-t-lg"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='200'%3E%3Crect fill='%23ddd' width='300' height='200'/%3E%3Ctext x='50%' y='50%' text-anchor='middle' dy='.3em' font-family='sans-serif' font-size='14' fill='%23999'%3EMerchandise%3C/text%3E%3C/svg%3E";
                }}
              />
            </div>
            <div className="p-4">
              <h3 className="font-bold text-lg mb-1">{item.title}</h3>
              <p className="text-sm text-gray-600 mb-3">{item.description}</p>
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold text-blue-600">
                  {formatPrice(item.price)}
                </span>
                <button
                  onClick={() => handleAddToCart(item.id, item.price)}
                  disabled={loading}
                  className="bg-amber-600 text-white px-3 py-1 rounded text-sm hover:bg-amber-700 transition disabled:opacity-50"
                >
                  {loading ? "..." : "Buy"}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
