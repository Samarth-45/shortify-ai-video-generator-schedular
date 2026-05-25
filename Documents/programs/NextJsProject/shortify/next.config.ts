import type { NextConfig } from "next";
import path from "path";
import { fileURLToPath } from "url";

// Pin the project root so Next.js does not walk up to ~/package-lock.json
// and watch the entire home directory (causes EMFILE + hung compiles).
const projectRoot = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  outputFileTracingRoot: projectRoot,
  // Remotion / rspack use native .node binaries — must not be webpack-bundled by Next.js
  serverExternalPackages: [
    "@supabase/supabase-js",
    "@supabase/ssr",
    "replicate",
    "@remotion/bundler",
    "@remotion/renderer",
    "@remotion/lambda",
    "@remotion/lambda-client",
    "@remotion/cli",
    "@remotion/compositor-darwin-arm64",
    "remotion",
    "@rspack/core",
    "@rspack/binding",
    "@rspack/binding-darwin-arm64",
  ],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "replicate.delivery",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
