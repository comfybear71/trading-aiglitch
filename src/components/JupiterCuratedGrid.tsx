"use client";

import Link from "next/link";
import { fmtMarketUsd, swapHref } from "@/lib/market-pairs";
import type { TradeTokenRow } from "@/lib/trade-tokens";

export interface CuratedMarketToken extends TradeTokenRow {
  priceUsd?: number;
}

export function JupiterCuratedGrid({
  tokens,
  loading,
}: {
  tokens: CuratedMarketToken[];
  loading: boolean;
}) {
  if (loading && tokens.length === 0) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 h-[168px] animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
      <article className="rounded-xl border border-cyan-500/25 bg-cyan-950/10 p-4 flex flex-col min-h-[168px]">
        <p className="text-sm font-black text-white">SOL / USDC</p>
        <p className="text-[10px] text-zinc-500 mt-0.5">Jupiter · core pair</p>
        <p className="text-xs text-zinc-400 mt-3 flex-1">Primary on-ramp for swaps and LSTs.</p>
        <Link
          href={swapHref("SOL", "USDC")}
          className="mt-auto text-center py-2 rounded-lg bg-gradient-to-r from-cyan-600/85 to-purple-600/85 text-[11px] font-bold text-white hover:opacity-95"
        >
          Swap SOL ↔ USDC
        </Link>
      </article>

      {tokens.map((t) => {
        const quote = t.defaultQuote ?? "USDC";
        const href = swapHref(quote, t.symbol);
        return (
          <article
            key={t.symbol}
            className="rounded-xl border border-cyan-500/25 bg-cyan-950/10 p-4 flex flex-col min-h-[168px] hover:border-cyan-400/40 transition-colors"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-sm font-black text-white">{t.symbol}</p>
                <p className="text-[10px] text-zinc-500 mt-0.5">
                  Jupiter · vs {quote}
                  {t.yieldLst ? (
                    <span className="ml-1 text-amber-400/90">· staking yield LST</span>
                  ) : null}
                </p>
              </div>
              {t.yieldLst ? (
                <span className="text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded border border-amber-500/40 text-amber-300/90 shrink-0">
                  Yield
                </span>
              ) : null}
            </div>
            <p className="text-xl font-black text-white mt-3 tabular-nums">
              {t.priceUsd != null && t.priceUsd > 0 ? fmtMarketUsd(t.priceUsd) : "—"}
            </p>
            {t.yieldLst ? (
              <p className="text-[10px] text-zinc-500 mt-1">
                Swap in/out on Jupiter. Earn/Lend deposit UI coming later.
              </p>
            ) : (
              <p className="text-[10px] text-zinc-500 mt-1 flex-1">Curated major · same 1M $BUDJU swap gate.</p>
            )}
            <Link
              href={href}
              className="mt-auto pt-3 text-center py-2 rounded-lg bg-gradient-to-r from-cyan-600/85 to-purple-600/85 text-[11px] font-bold text-white hover:opacity-95"
            >
              Buy {t.symbol} with {quote}
            </Link>
          </article>
        );
      })}
    </div>
  );
}
