import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Ignore type errors during production builds
  typescript: {
    ignoreBuildErrors: true,
  },
  // Ignore ESLint errors during production builds
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
