'use client';

import { useCart } from '@/contexts/cart-context';
import Link from 'next/link';

export default function CartPage() {
  const { state, removeItem, updateQuantity } = useCart();

  if (state.items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-4xl font-serif mb-4">Your Cart</h1>
        <p className="text-xl text-neutral-600 mb-8">Your cart is empty</p>
        <Link href="/products" className="inline-block bg-black text-white px-8 py-3 hover:bg-neutral-800">
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-serif mb-8">Your Cart</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          {state.items.map((item) => (
            <div key={item.id} className="flex gap-4 border-b border-neutral-200 py-6">
              {item.image && (
                <img src={item.image} alt={item.name} className="w-24 h-24 object-cover border" />
              )}
              <div className="flex-1">
                <Link href={`/products/${item.slug}`} className="font-medium hover:underline">
                  {item.name}
                </Link>
                <p className="text-neutral-600 mt-1">${item.price.toFixed(2)}</p>
                
                <div className="flex items-center gap-4 mt-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-8 h-8 border border-neutral-300 hover:border-black"
                    >
                      -
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-8 h-8 border border-neutral-300 hover:border-black"
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-red-600 hover:underline text-sm"
                  >
                    Remove
                  </button>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="border border-neutral-200 p-6 h-fit">
          <h2 className="text-2xl font-serif mb-6">Order Summary</h2>
          
          <div className="space-y-3 mb-6">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>${state.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span>${state.shipping.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax</span>
              <span>${state.tax.toFixed(2)}</span>
            </div>
            <div className="border-t border-neutral-200 pt-3 flex justify-between font-semibold text-lg">
              <span>Total</span>
              <span>${state.totalPrice.toFixed(2)}</span>
            </div>
          </div>

          <Link
            href="/checkout"
            className="block w-full bg-black text-white text-center py-3 hover:bg-neutral-800 transition"
          >
            Proceed to Checkout
          </Link>
        </div>
      </div>
    </div>
  );
}
