import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "image.tmdb.org",
      },
      {
        protocol: "https",
        hostname: "s4.anilist.co",
      },
    ],
  },
  cacheComponents: true,
  experimental: {
    viewTransition: true,
  },
};

export default nextConfig;
