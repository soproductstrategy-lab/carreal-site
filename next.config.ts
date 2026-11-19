import type { NextConfig } from "next";

const rawSiteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
  process.env.VERCEL_PROJECT_PRODUCTION_URL ||
  process.env.VERCEL_URL ||
  "";
const isNoIndex =
  process.env.NEXT_PUBLIC_NOINDEX === "true" ||
  process.env.VERCEL_ENV === "preview" ||
  rawSiteUrl.includes(".vercel.app");

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  reactCompiler: true,
  // URLs canoniques avec slash final, cohérentes partout (liens internes, sitemap, canonical).
  trailingSlash: true,
  poweredByHeader: false,
  // En dev, affiche les requêtes vers Sanity dans le terminal.
  logging: { fetches: { fullUrl: true } },
  images: {
    formats: ["image/avif", "image/webp"],
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
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          ...(isNoIndex ? [{ key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" }] : []),
        ],
      },
    ];
  },
};

export default nextConfig;
