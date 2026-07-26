"use client";

import { useCallback, useEffect, useState } from "react";

export interface BudjuMarketSnapshot {
  priceUsd: number;
  change24h: number;
  marketCap: number;
  volume24h: number;
  holders: number | null;
  dataSource: string;
}

export function useBudjuMarket(_mint: string, enabled = true) {
  const [market, setMarket] = useState<BudjuMarketSnapshot | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!enabled) return;
    setLoading(true);
    try {
      const marketRes = await fetch("/api/exchange?action=market&pair=BUDJU_USDC", {
        cache: "no-store",
      });
      const data = await marketRes.json();
      if (marketRes.ok) {
        const holdersRaw = data.holder_count ?? data.holderCount;
        const holders =
          holdersRaw != null && Number.isFinite(Number(holdersRaw)) ? Number(holdersRaw) : null;
        setMarket({
          priceUsd: Number(data.price_usd ?? data.priceUsd ?? 0),
          change24h: Number(data.change_24h ?? data.change24h ?? 0),
          marketCap: Number(data.market_cap ?? data.marketCap ?? 0),
          volume24h: Number(data.volume_24h ?? data.volume24h ?? 0),
          holders,
          dataSource: String(data.data_source ?? data.dataSource ?? "unknown"),
        });
      }
    } catch {
      /* keep last */
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { market, loading, refresh };
}

function fmtUsdPrice(n: number) {
  if (n <= 0) return "—";
  if (n >= 1) return `$${n.toFixed(4)}`;
  return `$${n.toFixed(8).replace(/\.?0+$/, "")}`;
}

function fmtMktCap(n: number) {
  if (n <= 0) return "—";
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
  return `$${n.toFixed(0)}`;
}

export { fmtUsdPrice, fmtMktCap };
