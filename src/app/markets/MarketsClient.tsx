"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

/** USDC-quoted lanes shown on trade (matches swap token set). */
const MARKET_PAIR_IDS = ["BUDJU_USDC", "GLITCH_USDC"] as const;

type PairMeta = { id: string; label: string; base: string; quote: string };

interface MarketSnapshot {
  pairId: string;
  label: string;
  base: string;
  quote: string;
  accent: "purple" | "fuchsia" | "cyan";
  priceUsd: number;
  change24h: number;
  volume24h: number;
  marketCap: number;
  dataSource: string;
  error?: string;
}

function accentForBase(base: string): MarketSnapshot["accent"] {
  if (base === "BUDJU") return "fuchsia";
  if (base === "GLITCH") return "purple";
  return "cyan";
}

function swapHref(sell: string, buy: string) {
  return `/swap?sell=${encodeURIComponent(sell)}&buy=${encodeURIComponent(buy)}`;
}

async function loadPair(meta: PairMeta): Promise<MarketSnapshot> {
  const accent = accentForBase(meta.base);
  try {
    const res = await fetch(`/api/exchange?action=market&pair=${meta.id}`);
    const data = await res.json();
    if (!res.ok) {
      return {
        pairId: meta.id,
        label: meta.label,
        base: meta.base,
        quote: meta.quote,
        accent,
        priceUsd: 0,
        change24h: 0,
        volume24h: 0,
        marketCap: 0,
        dataSource: "none",
        error: data.error || "Unavailable",
      };
    }
    return {
      pairId: meta.id,
      label: meta.label,
      base: meta.base,
      quote: meta.quote,
      accent,
      priceUsd: Number(data.price_usd ?? data.priceUsd ?? 0),
      change24h: Number(data.change_24h ?? data.change24h ?? 0),
      volume24h: Number(data.volume_24h ?? data.volume24h ?? 0),
      marketCap: Number(data.market_cap ?? data.marketCap ?? 0),
      dataSource: String(data.data_source ?? data.dataSource ?? "unknown"),
    };
  } catch {
    return {
      pairId: meta.id,
      label: meta.label,
      base: meta.base,
      quote: meta.quote,
      accent,
      priceUsd: 0,
      change24h: 0,
      volume24h: 0,
      marketCap: 0,
      dataSource: "none",
      error: "Network error",
    };
  }
}

function fmtUsd(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1) return `$${n.toFixed(4)}`;
  if (n > 0) return `$${n.toFixed(6)}`;
  return "—";
}

function fmtPct(n: number) {
  const sign = n >= 0 ? "+" : "";
  return `${sign}${n.toFixed(2)}%`;
}

const ACCENT_BORDER = {
  fuchsia: "border-fuchsia-500/25 bg-fuchsia-950/10 hover:border-fuchsia-500/45",
  purple: "border-purple-500/25 bg-purple-950/10 hover:border-purple-500/45",
  cyan: "border-cyan-500/25 bg-cyan-950/10 hover:border-cyan-500/45",
} as const;

export default function MarketsClient() {
  const [markets, setMarkets] = useState<MarketSnapshot[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const pairsRes = await fetch("/api/exchange?action=pairs");
      const pairsData = await pairsRes.json();
      const catalog: PairMeta[] = Array.isArray(pairsData.pairs) ? pairsData.pairs : [];
      const metas = MARKET_PAIR_IDS.map((id) => catalog.find((p) => p.id === id)).filter(
        (p): p is PairMeta => !!p,
      );
      const fallback: PairMeta[] = [
        { id: "BUDJU_USDC", label: "$BUDJU/USDC", base: "BUDJU", quote: "USDC" },
        { id: "GLITCH_USDC", label: "§GLITCH/USDC", base: "GLITCH", quote: "USDC" },
      ];
      const toLoad = metas.length > 0 ? metas : fallback;
      setMarkets(await Promise.all(toLoad.map(loadPair)));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <div className="rounded-2xl border border-purple-500/20 bg-gradient-to-br from-purple-950/30 via-black to-cyan-950/20 p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-fuchsia-400 to-cyan-400">
              Markets
            </h1>
            <p className="text-gray-400 text-sm mt-1 max-w-xl">
              Reference prices for trade-lane tokens (DexScreener / Jupiter / stored fallback via API).
              Execute swaps on{" "}
              <Link href="/swap" className="text-cyan-400 hover:underline">
                Swap
              </Link>
              . Persona bot treasury flows live under{" "}
              <Link href="/ops" className="text-purple-400 hover:underline">
                Ops
              </Link>
              .
            </p>
          </div>
          <button
            type="button"
            onClick={() => void refresh()}
            disabled={loading}
            className="px-3 py-1.5 rounded-lg border border-zinc-700 text-xs text-zinc-400 hover:text-cyan-300 disabled:opacity-50"
          >
            Refresh
          </button>
        </div>
        <div className="flex flex-wrap gap-2 mt-4">
          {(["SOL", "USDC", "BUDJU", "GLITCH"] as const).map((sym) => (
            <Link
              key={sym}
              href={swapHref(sym, sym === "USDC" ? "SOL" : "USDC")}
              className="text-[10px] font-bold px-2.5 py-1 rounded-full border border-zinc-700 text-zinc-400 hover:border-cyan-500/40 hover:text-cyan-300"
            >
              Swap {sym}
            </Link>
          ))}
        </div>
      </div>

      {loading && markets.length === 0 ? (
        <p className="text-gray-500 text-sm">Loading markets…</p>
      ) : (
        <div className="grid sm:grid-cols-2 gap-3">
          {markets.map((m) => (
            <div
              key={m.pairId}
              className={`rounded-xl border p-4 transition-colors ${ACCENT_BORDER[m.accent]}`}
            >
              <p className="text-xs font-bold text-gray-400">{m.label}</p>
              {m.error ? (
                <p className="text-red-400 text-sm mt-2">{m.error}</p>
              ) : (
                <>
                  <p className="text-2xl font-black text-white mt-1">{fmtUsd(m.priceUsd)}</p>
                  <p className="text-[10px] text-zinc-500 mt-0.5">USD per {m.base}</p>
                  <div className="flex flex-wrap gap-3 mt-2 text-[11px]">
                    <span className={m.change24h >= 0 ? "text-green-400" : "text-red-400"}>
                      24h {fmtPct(m.change24h)}
                    </span>
                    <span className="text-gray-500">Vol {fmtUsd(m.volume24h)}</span>
                    {m.marketCap > 0 && (
                      <span className="text-gray-500">MCap {fmtUsd(m.marketCap)}</span>
                    )}
                    <span className="text-gray-600 capitalize">via {m.dataSource}</span>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Link
                      href={swapHref(m.base, m.quote)}
                      className="flex-1 text-center py-2 rounded-lg bg-gradient-to-r from-purple-600/80 to-cyan-600/80 text-[11px] font-bold text-white"
                    >
                      Sell {m.base}
                    </Link>
                    <Link
                      href={swapHref(m.quote, m.base)}
                      className="flex-1 text-center py-2 rounded-lg border border-zinc-600 text-[11px] font-bold text-zinc-300 hover:border-cyan-500/40"
                    >
                      Buy {m.base}
                    </Link>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="rounded-xl border border-gray-800 bg-gray-900/40 p-4 text-sm text-gray-400 space-y-2">
        <p>
          <span className="text-fuchsia-300 font-bold">$BUDJU</span> — Solana token; hold{" "}
          <span className="text-zinc-300">1M+</span> on-chain to unlock Swap on this app.
        </p>
        <p>
          <span className="text-purple-300 font-bold">§GLITCH</span> — in-app economy + OTC on{" "}
          <a
            href="https://aiglitch.app/exchange"
            className="text-purple-400 hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            aiglitch.app/exchange
          </a>
          . Swap §GLITCH here when you meet the BUDJU gate.
        </p>
        <p className="text-[11px] text-zinc-600 pt-1">
          Not a order book or limit venue — use Swap for instant Jupiter routes. Limit / DCA: jup.ag (coming here in v2).
        </p>
      </div>
    </div>
  );
}
