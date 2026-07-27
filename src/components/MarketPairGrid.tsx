"use client";

import Link from "next/link";
import {
  fmtMarketPct,
  fmtMarketUsd,
  fmtMarketVol,
  glitchPairUiMeta,
  pairActions,
  type MarketSnapshot,
} from "@/lib/market-pairs";

function PairSkeleton() {
  return (
    <li className="px-4 py-3 h-16 bg-zinc-900/40 animate-pulse border-b border-zinc-800/80 last:border-0" />
  );
}

function MarketPairRow({ m }: { m: MarketSnapshot }) {
  const actions = pairActions(m.base, m.quote);
  const glitchUi = glitchPairUiMeta(m.base, m.quote);
  const primary = actions.find((a) => a.variant === "primary") ?? actions[0];
  const isGlitch = m.base === "GLITCH" || m.quote === "GLITCH";
  const routeLabel = isGlitch ? "OTC · SOL checkout only" : "Jupiter / Raydium · SPL";

  return (
    <li className="px-4 py-3 flex flex-wrap items-center gap-3 gap-y-2 hover:bg-purple-950/10 transition-colors">
      <div className="min-w-[160px] flex-1">
        <p className="text-sm font-black text-white flex items-center gap-1.5">
          {m.baseIcon && <span aria-hidden>{m.baseIcon}</span>}
          <span>{m.label}</span>
        </p>
        <p className="text-[10px] text-zinc-500 mt-0.5">
          {routeLabel}
          {m.dexName && !isGlitch ? ` · ${m.dexName}` : ""}
          {glitchUi?.featuredOtc ? " · featured OTC" : ""}
        </p>
        {glitchUi ? (
          <p className="text-[10px] text-purple-300/70 mt-0.5 leading-snug max-w-md">{glitchUi.subtitle}</p>
        ) : null}
      </div>

      {m.error ? (
        <p className="text-red-400/90 text-xs flex-1">{m.error}</p>
      ) : (
        <>
          <p className="text-base font-black text-white tabular-nums sm:w-28 sm:text-right">
            {fmtMarketUsd(m.priceUsd)}
          </p>
          <span
            className={`text-[11px] font-bold tabular-nums hidden sm:inline ${
              m.change24h >= 0 ? "text-green-400" : "text-red-400"
            }`}
          >
            {fmtMarketPct(m.change24h)}
          </span>
          <div className="hidden lg:flex flex-wrap gap-x-3 text-[10px] text-zinc-500 min-w-[200px]">
            <span>{fmtMarketVol(m.volume24h)}</span>
            {m.marketCap > 0 && <span>Mcap {fmtMarketUsd(m.marketCap)}</span>}
            {m.holderCount != null && m.holderCount > 0 && (
              <span>{m.holderCount.toLocaleString()} holders</span>
            )}
          </div>
        </>
      )}

      {primary && (
        <Link
          href={primary.href}
          className="ml-auto shrink-0 px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-600/85 to-cyan-600/85 text-[11px] font-bold text-white hover:opacity-95"
        >
          {primary.label}
        </Link>
      )}
    </li>
  );
}

export function MarketPairGrid({
  markets,
  loading,
  skeletonCount = 3,
}: {
  markets: MarketSnapshot[];
  loading: boolean;
  skeletonCount?: number;
}) {
  if (loading && markets.length === 0) {
    return (
      <ul className="rounded-xl border border-zinc-800/90 divide-y divide-zinc-800/80 overflow-hidden">
        {Array.from({ length: skeletonCount }, (_, i) => (
          <PairSkeleton key={i} />
        ))}
      </ul>
    );
  }

  return (
    <ul className="rounded-xl border border-zinc-800/90 divide-y divide-zinc-800/80 overflow-hidden bg-zinc-950/30">
      {markets.map((m) => (
        <MarketPairRow key={m.pairId} m={m} />
      ))}
    </ul>
  );
}
