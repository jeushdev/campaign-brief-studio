import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep studio builds separate from existing Turbopack native-module junctions on Windows.
  distDir: ".next-studio",
  output: process.env.CAMPAIGN_STANDALONE === "true" ? "standalone" : undefined,
};

export default nextConfig;
