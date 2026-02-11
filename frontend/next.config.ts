import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  webpack: (config) => {
    // Use pdfjs-dist legacy build to silence "Please use the legacy build in Node.js environments" warning
    // (Next.js evaluates modules in Node during build, and the default build emits this warning)
    const pdfjsLegacy = path.resolve(
      __dirname,
      "node_modules/pdfjs-dist/legacy/build"
    );
    config.resolve.alias = {
      ...config.resolve.alias,
      "pdfjs-dist/build/pdf.mjs": path.join(pdfjsLegacy, "pdf.mjs"),
      "pdfjs-dist/build/pdf.min.mjs": path.join(pdfjsLegacy, "pdf.min.mjs"),
    };
    return config;
  },
};

export default nextConfig;
