"use client";

import Link from "next/link";
import {
  accentCardClass,
  fmtMarketPct,
  fmtMarketUsd,
  fmtMarketVol,
  pairActions,
  type MarketSnapshot,
} from "@/lib/market-pairs";

function PairSkeleton() {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 animate-pulse space-y-3">
      <div className="h-4 w-28 bg-zinc-800 rounded" />
      <div className="h-8 w-24 bg-zinc-800 rounded" />
      <div className="h-3 w-full bg-zinc-800/80 rounded" />
      <div className="h-9 w-full bg-zinc-800 rounded-lg mt-2" />
    </div>
  );
}

function MarketPairCard({ m }: { m: MarketSnapshot }) {
  const actions = pairActions(m.base, m.quote);
  const primary = actions.find((a) => a.variant === "primary") ?? actions[0];
  const secondary = actions.find((a) => a.variant === "secondary");

  return (
    <article
      className={`rounded-xl border p-4 flex flex-col min-h-[200px] transition-colors ${accentCardClass(m.accent)}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-black text-white flex items-center gap-1.5">
            {m.baseIcon && <span aria-hidden>{m.baseIcon}</span>}
            <span>{m.label}</span>
          </p>
          <p className="text-[10px] text-zinc-500 mt-0.5 capitalize">
            {m.dexName ? `${m.dexName} · ` : ""}
            {m.dataSource}
            {m.base === "GLITCH" || m.quote === "GLITCH" ? " · OTC for §GLITCH" : ""}
          </p>
        </div>
        {!m.error && (
          <span
            className={`text-[11px] font-bold tabular-nums shrink-0 ${
              m.change24h >= 0 ? "text-green-400" : "text-red-400"
            }`}
          >
            {fmtMarketPct(m.change24h)}
          </span>
        )}
      </div>

      {m.error ? (
        <p className="text-red-400/90 text-sm mt-3 flex-1">{m.error}</p>
      ) : (
        <>
          <p className="text-2xl font-black text-white mt-3 tabular-nums">{fmtMarketUsd(m.priceUsd)}</p>
          <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 text-[10px] text-zinc-500">
            <span>{fmtMarketVol(m.volume24h)}</span>
            {m.marketCap > 0 && <span>Mcap {fmtMarketUsd(m.marketCap)}</span>}
            {m.liquidityUsd > 0 && <span>Liq {fmtMarketUsd(m.liquidityUsd)}</span>}
            {m.holderCount != null && m.holderCount > 0 && (
              <span>{m.holderCount.toLocaleString()} holders</span>
            )}
          </div>
        </>
      )}

      <div className="flex gap-2 mt-auto pt-4">
        {primary && (
          <Link
            href={primary.href}
            className="flex-1 text-center py-2 rounded-lg bg-gradient-to-r from-purple-600/85 to-cyan-600/85 text-[11px] font-bold text-white hover:opacity-95"
          >
            {primary.label}
          </Link>
        )}
        {secondary && (
          <Link
            href={secondary.href}
            className="px-3 py-2 rounded-lg border border-zinc-600/80 text-[11px] font-bold text-zinc-300 hover:border-cyan-500/40 hover:text-cyan-200"
          >
            {secondary.label}
          </Link>
        )}
      </div>
    </article>
  );
}

export function MarketPairGrid({
  markets,
  loading,
  skeletonCount = 5,
}: {
  markets: MarketSnapshot[];
  loading: boolean;
  skeletonCount?: number;
}) {
  if (loading && markets.length === 0) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
        {Array.from({ length: skeletonCount }, (_, i) => (
          <PairSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
      {markets.map((m) => (
        <MarketPairCard key={m.pairId} m={m} />
      ))}
    </div>
  );
}
