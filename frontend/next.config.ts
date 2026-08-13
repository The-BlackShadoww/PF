import type { NextConfig } from "next";

// Browser requests go through Vercel so session cookies are first-party cookies
// for the frontend domain. Keep the Render URL server-only.
const apiProxyTarget = (
  process.env.API_PROXY_TARGET ?? "http://localhost:3001/api/v1"
).replace(/\/$/, "");

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: `${apiProxyTarget}/:path*`,
      },
    ];
  },
};

export default nextConfig;
