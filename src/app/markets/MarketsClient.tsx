"use client";

import { useEffect, useState } from "react";

interface MarketSnapshot {
  pairId: string;
  label: string;
  accent: "purple" | "fuchsia";
  priceUsd: number;
  change24h: number;
  volume24h: number;
  dataSource: string;
  error?: string;
}

async function loadPair(pairId: string, label: string, accent: "purple" | "fuchsia"): Promise<MarketSnapshot> {
  try {
    const res = await fetch(`/api/exchange?action=market&pair=${pairId}`);
    const data = await res.json();
    if (!res.ok) {
      return { pairId, label, accent, priceUsd: 0, change24h: 0, volume24h: 0, dataSource: "none", error: data.error || "Unavailable" };
    }
    return {
      pairId,
      label,
      accent,
      priceUsd: Number(data.price_usd ?? data.priceUsd ?? 0),
      change24h: Number(data.change_24h ?? data.change24h ?? 0),
      volume24h: Number(data.volume_24h ?? data.volume24h ?? 0),
      dataSource: String(data.data_source ?? data.dataSource ?? "unknown"),
    };
  } catch {
    return { pairId, label, accent, priceUsd: 0, change24h: 0, volume24h: 0, dataSource: "none", error: "Network error" };
  }
}

function fmtUsd(n: number) {
  if (n >= 1) return `$${n.toFixed(4)}`;
  if (n > 0) return `$${n.toFixed(6)}`;
  return "—";
}

function fmtPct(n: number) {
  const sign = n >= 0 ? "+" : "";
  return `${sign}${n.toFixed(2)}%`;
}

export default function MarketsClient() {
  const [markets, setMarkets] = useState<MarketSnapshot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const rows = await Promise.all([
        loadPair("BUDJU_USDC", "$BUDJU / USDC", "fuchsia"),
        loadPair("GLITCH_USDC", "§GLITCH / USDC", "purple"),
      ]);
      if (!cancelled) {
        setMarkets(rows);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-purple-500/20 bg-gradient-to-br from-purple-950/30 via-black to-cyan-950/20 p-5">
        <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-fuchsia-400 to-cyan-400">
          Markets
        </h1>
        <p className="text-gray-400 text-sm mt-1 max-w-xl">
          Live on-chain $BUDJU pricing and in-app §GLITCH reference prices. Bot activity runs in Ops — tuned for low fees, not high churn.
        </p>
      </div>

      {loading ? (
        <p className="text-gray-500 text-sm">Loading markets…</p>
      ) : (
        <div className="grid sm:grid-cols-2 gap-3">
          {markets.map((m) => (
            <div
              key={m.pairId}
              className={`rounded-xl border p-4 ${
                m.accent === "fuchsia"
                  ? "border-fuchsia-500/25 bg-fuchsia-950/10"
                  : "border-purple-500/25 bg-purple-950/10"
              }`}
            >
              <p className="text-xs font-bold text-gray-400">{m.label}</p>
              {m.error ? (
                <p className="text-red-400 text-sm mt-2">{m.error}</p>
              ) : (
                <>
                  <p className="text-2xl font-black text-white mt-1">{fmtUsd(m.priceUsd)}</p>
                  <div className="flex flex-wrap gap-3 mt-2 text-[11px]">
                    <span className={m.change24h >= 0 ? "text-green-400" : "text-red-400"}>
                      24h {fmtPct(m.change24h)}
                    </span>
                    <span className="text-gray-500">Vol {fmtUsd(m.volume24h)}</span>
                    <span className="text-gray-600">via {m.dataSource}</span>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="rounded-xl border border-gray-800 bg-gray-900/40 p-4 text-sm text-gray-400 space-y-2">
        <p>
          <span className="text-purple-300 font-bold">§GLITCH</span> — simulated in-app market (persona bots + treasury rules). Swap on-platform coming after BUDJU gate.
        </p>
        <p>
          <span className="text-fuchsia-300 font-bold">$BUDJU</span> — Solana token; hold enough in your wallet to unlock trading (threshold TBD, reference ~10M from budju.xyz marketing).
        </p>
      </div>
    </div>
  );
}
