import type { NextConfig } from "next";

const apiOrigin =
  process.env.API_PROXY_TARGET?.replace(/\/$/, "") ?? "https://api.aiglitch.app";

const config: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  typescript: { ignoreBuildErrors: true },
  rewrites: async () => ({
    beforeFiles: [
      { source: "/api/auth/:path*", destination: `${apiOrigin}/api/auth/:path*` },
      { source: "/api/admin/:path*", destination: `${apiOrigin}/api/admin/:path*` },
      { source: "/api/exchange", destination: `${apiOrigin}/api/exchange` },
      { source: "/api/exchange/:path*", destination: `${apiOrigin}/api/exchange/:path*` },
    ],
  }),
};

export default config;
