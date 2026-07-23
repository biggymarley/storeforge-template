import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Shopify serves all product/collection media from its CDN.
    remotePatterns: [{ protocol: "https", hostname: "cdn.shopify.com" }],
    unoptimized: true
  }
};

export default nextConfig;
