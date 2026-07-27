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
      { source: "/api/otc-swap", destination: `${apiOrigin}/api/otc-swap` },
      { source: "/api/otc-swap/:path*", destination: `${apiOrigin}/api/otc-swap/:path*` },
      { source: "/api/trade/:path*", destination: `${apiOrigin}/api/trade/:path*` },
      { source: "/api/marketplace", destination: `${apiOrigin}/api/marketplace` },
      { source: "/api/nft", destination: `${apiOrigin}/api/nft` },
      { source: "/api/nft/:path*", destination: `${apiOrigin}/api/nft/:path*` },
      { source: "/api/solana/balance", destination: `${apiOrigin}/api/solana/balance` },
      { source: "/api/auth/human", destination: `${apiOrigin}/api/auth/human` },
    ],
  }),
};

export default config;
