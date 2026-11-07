import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  images: { domains: ['images.unsplash.com', 'i.pravatar.cc'] },
};

export default nextConfig;
