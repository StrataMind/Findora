"use client";

import { useSession, signIn } from "next-auth/react";
import Image from "next/image";
import { useState } from "react";
import { formatPrice } from "@/lib/utils";

const FEATURED_ARTWORK = [
  {
    id: "1",
    title: "Neon Dreams",
    description: "A vibrant digital exploration of urban landscapes",
    price: 349,
    image: "/art1.jpg",
  },
  {
    id: "2",
    title: "Digital Canvas",
    description: "Contemporary digital art piece",
    price: 299,
    image: "/art2.jpg",
  },
];

export default function ArtPage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);

  const handlePurchase = async (artworkId: string, price: number) => {
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
          artworkId,
          quantity: 1,
        }),
      });

      if (response.ok) {
        alert("Purchase successful!");
      } else {
        alert("Purchase failed");
      }
    } catch (error) {
      console.error("Purchase error:", error);
      alert("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-12">Digital Artwork Gallery</h1>

      <div className="grid md:grid-cols-2 gap-8">
        {FEATURED_ARTWORK.map((artwork) => (
          <div key={artwork.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="relative h-64 bg-gray-200">
              <Image
                src={artwork.image}
                alt={artwork.title}
                fill
                className="object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect fill='%23ddd' width='400' height='300'/%3E%3Ctext x='50%' y='50%' text-anchor='middle' dy='.3em' font-family='sans-serif' font-size='18' fill='%23999'%3E{artwork.title}%3C/text%3E%3C/svg%3E";
                }}
              />
            </div>
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-2">{artwork.title}</h2>
              <p className="text-gray-600 mb-4">{artwork.description}</p>
              <div className="flex justify-between items-center">
                <span className="text-3xl font-bold text-blue-600">
                  {formatPrice(artwork.price)}
                </span>
                <button
                  onClick={() => handlePurchase(artwork.id, artwork.price)}
                  disabled={loading}
                  className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {loading ? "Processing..." : "Purchase"}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
