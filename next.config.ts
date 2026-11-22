import type { NextConfig } from "next";

/**
 * Two ways to build:
 *   npm run build          a Node server (Vercel, or a Render Web Service)
 *   npm run build:static   plain files in out/ (a Render Static Site, Netlify, any static host)
 */
const staticExport = process.env.STATIC_EXPORT === "1";

const nextConfig: NextConfig = staticExport
  ? {
      reactStrictMode: true,
      output: "export",
      // /tape/07/index.html, which every static host serves at /tape/07
      trailingSlash: true,
    }
  : {
      reactStrictMode: true,
      // Long-lived caching for recordings and photos; they rarely change.
      async headers() {
        return [{ source: "/audio/:file*", headers: [{ key: "Cache-Control", value: "public, max-age=604800" }] }];
      },
    };

export default nextConfig;
