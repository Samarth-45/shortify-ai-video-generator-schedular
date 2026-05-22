import type { NextConfig } from "next";
import path from "path";
import { fileURLToPath } from "url";

// Pin the project root so Next.js does not walk up to ~/package-lock.json
// and watch the entire home directory (causes EMFILE + hung compiles).
const projectRoot = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  outputFileTracingRoot: projectRoot,
};

export default nextConfig;
