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

const HOLDERS_CACHE_KEY = "budju-holders-v1";
const HOLDERS_TTL_MS = 10 * 60_000;

function readHoldersCache(): number | null {
  if (typeof sessionStorage === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(HOLDERS_CACHE_KEY);
    if (!raw) return null;
    const { at, n } = JSON.parse(raw) as { at: number; n: number };
    if (Date.now() - at > HOLDERS_TTL_MS) return null;
    return n;
  } catch {
    return null;
  }
}

function writeHoldersCache(n: number) {
  try {
    sessionStorage.setItem(HOLDERS_CACHE_KEY, JSON.stringify({ at: Date.now(), n }));
  } catch {
    /* ignore */
  }
}

/** Best-effort holder count (pump.fun metadata); not required for UI. */
async function fetchBudjuHolders(mint: string): Promise<number | null> {
  const cached = readHoldersCache();
  if (cached != null) return cached;
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(`https://frontend-api.pump.fun/coins/${mint}`, {
      signal: controller.signal,
      cache: "no-store",
    });
    clearTimeout(timeoutId);
    if (!res.ok) return null;
    const data = (await res.json()) as {
      holder_count?: number;
      holders?: number;
      num_holders?: number;
    };
    const n = data.holder_count ?? data.holders ?? data.num_holders ?? null;
    if (n != null && Number.isFinite(n)) {
      writeHoldersCache(n);
      return n;
    }
    return null;
  } catch {
    return null;
  }
}

export function useBudjuMarket(mint: string, enabled = true) {
  const [market, setMarket] = useState<BudjuMarketSnapshot | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!enabled) return;
    setLoading(true);
    try {
      const [marketRes, holders] = await Promise.all([
        fetch("/api/exchange?action=market&pair=BUDJU_USDC", { cache: "no-store" }),
        fetchBudjuHolders(mint),
      ]);
      const data = await marketRes.json();
      if (marketRes.ok) {
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
  }, [enabled, mint]);

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
