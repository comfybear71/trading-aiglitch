"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { GlitchInvestPromo } from "@/components/GlitchInvestPromo";
import { BudjuMarketsPromo } from "@/components/BudjuMarketsPromo";
import { MarketPairGrid } from "@/components/MarketPairGrid";
import { useTraderWallet } from "@/context/TraderWalletContext";
import {
  fetchMarketSnapshot,
  fetchPairCatalog,
  swapHref,
  type MarketSnapshot,
} from "@/lib/market-pairs";
import { GLITCH_EXCHANGE_PATH } from "@/lib/trade-tokens";
import { useOtcConfig } from "@/lib/use-otc-config";

export default function MarketsClient() {
  const trader = useTraderWallet();
  const [balanceRefreshing, setBalanceRefreshing] = useState(false);
  const { otc, loading: otcLoading, refreshing: otcRefreshing, refresh: refreshOtc } =
    useOtcConfig();
  const refreshOtcRef = useRef(refreshOtc);
  refreshOtcRef.current = refreshOtc;

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

  const loadMarkets = useCallback(async () => {
    setLoading(true);
    try {
      const catalog = await fetchPairCatalog();
      const snapshots = await Promise.all(catalog.map((meta) => fetchMarketSnapshot(meta)));
      setMarkets(snapshots);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadMarkets();
  }, [loadMarkets]);

  const refreshAll = useCallback(() => {
    void refreshOtcRef.current();
    void loadMarkets();
  }, [loadMarkets]);

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-stretch">
        <BudjuMarketsPromo
          walletConnected={!!trader.wallet}
          eligible={trader.eligible}
          budjuBalance={trader.eligibility?.budju_balance ?? 0}
          budjuRequired={trader.eligibility?.budju_required}
          onRefresh={trader.wallet ? () => void refreshBalances() : undefined}
          refreshing={balanceRefreshing}
          className="min-h-[280px]"
        />
        <GlitchInvestPromo
          otc={otc}
          loading={otcLoading}
          refreshing={otcRefreshing}
          variant="compact"
          className="min-h-[280px]"
        />
      </div>

      <section className="rounded-2xl border border-zinc-800/90 bg-zinc-950/50 p-5 space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-purple-400/80">
              All pairs
            </p>
            <h1 className="text-xl font-black text-white mt-1">Live market grid</h1>
            <p className="text-sm text-zinc-500 mt-1 max-w-xl">
              §GLITCH and $BUDJU pairs from the exchange API — DexScreener / Jupiter / stored
              fallbacks. Swap SOL · USDC · $BUDJU on Jupiter; §GLITCH via OTC.{" "}
              <Link
                href={`${GLITCH_EXCHANGE_PATH}#how-we-earn`}
                className="text-purple-400/90 hover:underline"
              >
                How AIG!itch earns →
              </Link>
            </p>
          </div>
          <button
            type="button"
            onClick={() => refreshAll()}
            disabled={loading}
            className="px-3 py-1.5 rounded-lg border border-zinc-700 text-xs text-zinc-400 hover:text-cyan-300 disabled:opacity-50 shrink-0"
          >
            {loading ? "Refreshing…" : "Refresh all"}
          </button>
        </div>

        <MarketPairGrid markets={markets} loading={loading} skeletonCount={5} />

        <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/25 px-4 py-3 flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-wide text-zinc-500">
            Quick swap
          </span>
          {(["SOL", "USDC", "BUDJU"] as const).map((sym) => (
            <Link
              key={sym}
              href={swapHref(sym, sym === "USDC" ? "SOL" : "USDC")}
              className="text-[10px] font-bold px-2.5 py-1 rounded-full border border-zinc-700 text-zinc-400 hover:border-cyan-500/40 hover:text-cyan-300"
            >
              {sym} ↔ {sym === "USDC" ? "SOL" : "USDC"}
            </Link>
          ))}
          <Link
            href={GLITCH_EXCHANGE_PATH}
            className="text-[10px] font-bold px-2.5 py-1 rounded-full border border-purple-500/40 text-purple-300/90 hover:bg-purple-500/10"
          >
            Buy §GLITCH
          </Link>
        </div>
      </section>
    </div>
  );
}
