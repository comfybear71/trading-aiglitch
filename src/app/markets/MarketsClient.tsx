"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { GlitchInvestPromo } from "@/components/GlitchInvestPromo";
import { BudjuTraderStatusSlim } from "@/components/BudjuGateCallout";
import { useTraderWallet } from "@/context/TraderWalletContext";
import { GLITCH_EXCHANGE_PATH } from "@/lib/trade-tokens";
import { useOtcConfig } from "@/lib/use-otc-config";

/** External DEX reference lane only — §GLITCH uses platform OTC promo above. */
const MARKET_PAIR_IDS = ["BUDJU_USDC"] as const;

type PairMeta = { id: string; label: string; base: string; quote: string };

interface MarketSnapshot {
  pairId: string;
  label: string;
  base: string;
  quote: string;
  accent: "fuchsia";
  priceUsd: number;
  change24h: number;
  volume24h: number;
  marketCap: number;
  dataSource: string;
  error?: string;
}

function swapHref(sell: string, buy: string) {
  return `/swap?sell=${encodeURIComponent(sell)}&buy=${encodeURIComponent(buy)}`;
}

async function loadPair(meta: PairMeta): Promise<MarketSnapshot> {
  try {
    const res = await fetch(`/api/exchange?action=market&pair=${meta.id}`);
    const data = await res.json();
    if (!res.ok) {
      return {
        pairId: meta.id,
        label: meta.label,
        base: meta.base,
        quote: meta.quote,
        accent: "fuchsia",
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
      accent: "fuchsia",
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
      accent: "fuchsia",
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

export default function MarketsClient() {
  const trader = useTraderWallet();
  const [balanceRefreshing, setBalanceRefreshing] = useState(false);
  const { otc, loading: otcLoading, refresh: refreshOtc } = useOtcConfig();
  const [markets, setMarkets] = useState<MarketSnapshot[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshBalances = useCallback(async () => {
    setBalanceRefreshing(true);
    try {
      await trader.refresh();
    } finally {
      setBalanceRefreshing(false);
    }
  }, [trader]);

  useEffect(() => {
    if (trader.wallet) void trader.refresh();
  }, [trader.wallet, trader.refresh]);

  const refresh = useCallback(async () => {
    setLoading(true);
    await refreshOtc();
    try {
      const pairsRes = await fetch("/api/exchange?action=pairs");
      const pairsData = await pairsRes.json();
      const catalog: PairMeta[] = Array.isArray(pairsData.pairs) ? pairsData.pairs : [];
      const metas = MARKET_PAIR_IDS.map((id) => catalog.find((p) => p.id === id)).filter(
        (p): p is PairMeta => !!p,
      );
      const fallback: PairMeta[] = [
        { id: "BUDJU_USDC", label: "$BUDJU/USDC", base: "BUDJU", quote: "USDC" },
      ];
      const toLoad = metas.length > 0 ? metas : fallback;
      setMarkets(await Promise.all(toLoad.map(loadPair)));
    } finally {
      setLoading(false);
    }
  }, [refreshOtc]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <BudjuTraderStatusSlim
        walletConnected={!!trader.wallet}
        eligible={trader.eligible}
        budjuBalance={trader.eligibility?.budju_balance ?? 0}
        budjuRequired={trader.eligibility?.budju_required}
        onRefresh={trader.wallet ? () => void refreshBalances() : undefined}
        refreshing={balanceRefreshing}
      />

      <GlitchInvestPromo otc={otc} loading={otcLoading} variant="hero" />

      {trader.wallet && otc && (
        <div className="rounded-xl border border-purple-500/30 bg-purple-950/15 px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-bold text-white">§GLITCH</p>
            <p className="text-xs text-zinc-500 font-mono mt-0.5">
              {(trader.eligibility?.balances.glitch ?? 0).toLocaleString(undefined, {
                maximumFractionDigits: 0,
              })}{" "}
              GLITCH
              <span className="text-purple-400/90 ml-2">@ ${otc.price_usd.toFixed(2)} OTC</span>
            </p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-sm font-semibold text-zinc-200">
              $
              {(
                (trader.eligibility?.balances.glitch ?? 0) * otc.price_usd
              ).toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </p>
            <Link
              href={GLITCH_EXCHANGE_PATH}
              className="text-[10px] text-purple-400/90 hover:text-purple-300 mt-0.5 inline-block"
            >
              Invest (OTC)
            </Link>
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-black text-zinc-200">Trade lanes</h1>
          <p className="text-[11px] text-zinc-500 mt-0.5">
            Jupiter: SOL · USDC · $BUDJU ·{" "}
            <Link href="/swap" className="text-cyan-500/80 hover:underline">
              Swap
            </Link>
          </p>
        </div>
        <button
          type="button"
          onClick={() => void refresh()}
          disabled={loading || otcLoading}
          className="px-3 py-1.5 rounded-lg border border-zinc-700 text-xs text-zinc-400 hover:text-cyan-300 disabled:opacity-50"
        >
          Refresh
        </button>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          {(["SOL", "USDC", "BUDJU"] as const).map((sym) => (
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
        <p className="text-gray-500 text-sm">Loading $BUDJU reference…</p>
      ) : (
        markets.map((m) => (
          <div
            key={m.pairId}
            className="rounded-xl border border-fuchsia-500/25 bg-fuchsia-950/10 p-4"
          >
            <p className="text-xs font-bold text-gray-400">{m.label} — DEX reference</p>
            {m.error ? (
              <p className="text-red-400 text-sm mt-2">{m.error}</p>
            ) : (
              <>
                <p className="text-2xl font-black text-white mt-1">{fmtUsd(m.priceUsd)}</p>
                <div className="flex flex-wrap gap-3 mt-2 text-[11px]">
                  <span className={m.change24h >= 0 ? "text-green-400" : "text-red-400"}>
                    24h {fmtPct(m.change24h)}
                  </span>
                  <span className="text-gray-500 capitalize">via {m.dataSource}</span>
                </div>
                <div className="flex gap-2 mt-4">
                  <Link
                    href={swapHref(m.base, m.quote)}
                    className="flex-1 text-center py-2 rounded-lg bg-gradient-to-r from-purple-600/80 to-cyan-600/80 text-[11px] font-bold text-white"
                  >
                    Trade on Swap
                  </Link>
                </div>
              </>
            )}
          </div>
        ))
      )}

      <p className="text-[10px] text-zinc-600 text-center pb-2">
        Persona bot treasury →{" "}
        <Link href="/ops" className="text-purple-400 hover:underline">
          Ops
        </Link>
      </p>
    </div>
  );
}
