import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Allow builds to pass even if ESLint finds warnings
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Keep type checking enabled to surface TS errors in production builds
  typescript: {
    ignoreBuildErrors: false,
  },
  // Configure allowed image domains for Next.js Image component
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'gorfboholnzcxtwi.public.blob.vercel-storage.com',
      },
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
    ],
  },
};

export default nextConfig;
