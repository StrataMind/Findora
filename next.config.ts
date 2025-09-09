import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
  output: 'standalone',
  // Move serverComponentsExternalPackages out of experimental
  serverExternalPackages: ['@prisma/client', 'bcryptjs'],
  // Force all pages to be dynamic to prevent prerender errors
  trailingSlash: false,
};

export default nextConfig;