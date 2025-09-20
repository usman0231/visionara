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
};

export default nextConfig;
