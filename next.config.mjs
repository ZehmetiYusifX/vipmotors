import { fileURLToPath } from "node:url";

/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingRoot: fileURLToPath(new URL("./", import.meta.url)),
  images: {
    unoptimized: true
  },
  // Landing section routes resolve to the single landing page; serve it for
  // direct entry / refresh so the client can scroll to the matching section.
  async rewrites() {
    return [
      { source: "/services", destination: "/" },
      { source: "/catalog", destination: "/" },
      { source: "/reviews", destination: "/" },
      { source: "/support", destination: "/" },
      { source: "/contact", destination: "/" }
    ];
  },
  // The former oil-only catalog now lives at the unified storefront.
  async redirects() {
    return [{ source: "/oils", destination: "/shop", permanent: true }];
  }
};

export default nextConfig;
