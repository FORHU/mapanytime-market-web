import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Standalone output produces a self-contained server bundle
  // (.next/standalone) used by the production Dockerfile.
  output: "standalone",
  // Keep your local network development origins intact
  allowedDevOrigins: ["localhost:3000", "192.168.100.9:3000"],

  // Add the optimized image hostname whitelist rule here
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
