import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  images: { unoptimized: true },
  turbopack: { root: "/Users/yukiiwata/video-generator" },
};

export default nextConfig;
