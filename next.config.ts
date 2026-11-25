import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  reactCompiler: true,
  // Les visuels sont déjà redimensionnés à l'envoi (sharp) ou vectoriels.
  images: { unoptimized: true },
  serverExternalPackages: ["sharp", "mongoose"],
  experimental: {
    // Les photos sont réduites dans le navigateur ; Netlify plafonne les requêtes à 6 Mo.
    serverActions: { bodySizeLimit: "6mb" },
    proxyClientMaxBodySize: "6mb",
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
