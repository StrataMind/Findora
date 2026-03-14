import { Suspense } from "react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <section className="text-center py-16">
        <h1 className="text-5xl font-bold mb-4">Welcome to Art & Apparel</h1>
        <p className="text-xl text-gray-600 mb-8">
          Discover original digital artwork and exclusive merchandise
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/art"
            className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition"
          >
            View Gallery
          </Link>
          <Link
            href="/merchandise"
            className="bg-amber-600 text-white px-8 py-3 rounded-lg hover:bg-amber-700 transition"
          >
            Shop Now
          </Link>
        </div>
      </section>

      <section className="grid md:grid-cols-3 gap-8 py-12">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-xl font-bold mb-2">Original Artwork</h3>
          <p className="text-gray-600">
            Unique digital pieces by contemporary artists
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-xl font-bold mb-2">Merchandise</h3>
          <p className="text-gray-600">
            High-quality prints and apparel featuring our designs
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-xl font-bold mb-2">Support Us</h3>
          <p className="text-gray-600">
            Donations help us create more amazing content
          </p>
        </div>
      </section>
    </div>
  );
}
