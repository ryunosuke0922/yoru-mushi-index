import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: [
    "@yoru-mushi-index/area",
    "@yoru-mushi-index/astro",
    "@yoru-mushi-index/core",
    "@yoru-mushi-index/shared",
    "@yoru-mushi-index/weather",
  ],
};

export default nextConfig;
