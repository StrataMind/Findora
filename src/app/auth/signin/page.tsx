"use client";

import { signIn } from "next-auth/react";

export default function SignInPage() {
  return (
    <div className="max-w-md mx-auto px-4 py-32">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold mb-8 text-center">Sign In</h1>
        <button
          onClick={() => signIn("google", { redirect: true, callbackUrl: "/" })}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition"
        >
          Sign in with Google
        </button>
        <p className="text-center text-gray-600 mt-6">
          Secure authentication powered by Google
        </p>
      </div>
    </div>
  );
}
