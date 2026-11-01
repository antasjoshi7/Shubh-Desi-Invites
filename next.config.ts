import type { NextConfig } from "next";

// Static export: `npm run build` produces a plain website in the `out/` folder.
const nextConfig: NextConfig = {
  output: "export",
  images: { unoptimized: true },
};

export default nextConfig;
