import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Self-contained server bundle for the Cloud Run image (docs/07 stage 1).
  output: "standalone",
};

export default nextConfig;
