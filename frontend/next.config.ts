import type { NextConfig } from "next";
import path from "path";

// Use pdfjs-dist legacy build to silence "Please use the legacy build in Node.js environments" warning
const pdfjsLegacy = path.resolve(
  __dirname,
  "node_modules/pdfjs-dist/legacy/build"
);

const nextConfig: NextConfig = {
  turbopack: {
    resolveAlias: {
      "pdfjs-dist/build/pdf.mjs": path.join(pdfjsLegacy, "pdf.mjs"),
      "pdfjs-dist/build/pdf.min.mjs": path.join(pdfjsLegacy, "pdf.min.mjs"),
    },
  },
  // Webpack config for `next build --webpack` (if used)
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "pdfjs-dist/build/pdf.mjs": path.join(pdfjsLegacy, "pdf.mjs"),
      "pdfjs-dist/build/pdf.min.mjs": path.join(pdfjsLegacy, "pdf.min.mjs"),
    };
    return config;
  },
};

export default nextConfig;
