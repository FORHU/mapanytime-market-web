import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // Standalone output produces a self-contained server bundle
  // (.next/standalone) used by the production Dockerfile.
  output: "standalone",
  // Dev-only: origins allowed to request /_next/* internals. Matched on
  // hostname alone — ports are ignored, and localhost is allowed by default.
  // Add the LAN IP of any other machine that needs to reach the dev server.
  allowedDevOrigins: ["192.168.100.9"],

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
