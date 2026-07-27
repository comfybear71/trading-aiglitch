"use client";

import { useMemo } from "react";
import type { NetWorthPoint } from "@/lib/portfolio-networth-history";

type Props = {
  points: NetWorthPoint[];
  deltaUsd: number | null;
  deltaPct: number | null;
};

export function PortfolioNetWorthChart({ points, deltaUsd, deltaPct }: Props) {
  const path = useMemo(() => {
    if (points.length < 2) return null;
    const w = 320;
    const h = 72;
    const pad = 4;
    const vals = points.map((p) => p.usd);
    const min = Math.min(...vals);
    const max = Math.max(...vals);
    const span = max - min || 1;
    return points
      .map((p, i) => {
        const x = pad + (i / (points.length - 1)) * (w - pad * 2);
        const y = pad + (1 - (p.usd - min) / span) * (h - pad * 2);
        return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(" ");
  }, [points]);

  if (!path) {
    return (
      <div className="rounded-xl border border-zinc-800/80 bg-zinc-950/40 px-4 py-3">
        <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Net worth trend</p>
        <p className="text-[11px] text-zinc-600 mt-1">
          Visit Portfolio after trades — we chart snapshots on this device (not full on-chain PnL yet).
        </p>
      </div>
    );
  }

  const deltaLabel =
    deltaUsd != null
      ? `${deltaUsd >= 0 ? "+" : ""}${deltaUsd.toLocaleString(undefined, { maximumFractionDigits: 2 })} USD`
      : null;
  const pctLabel =
    deltaPct != null ? `${deltaPct >= 0 ? "+" : ""}${deltaPct.toFixed(2)}%` : null;

  return (
    <div className="rounded-xl border border-zinc-800/80 bg-zinc-950/40 px-4 py-3 space-y-2">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Net worth trend</p>
        {(deltaLabel || pctLabel) && (
          <p
            className={`text-[11px] font-bold ${
              (deltaUsd ?? 0) >= 0 ? "text-emerald-400/90" : "text-red-400/90"
            }`}
          >
            {deltaLabel}
            {pctLabel ? ` · ${pctLabel}` : ""}
            <span className="text-zinc-600 font-normal ml-1">(this device)</span>
          </p>
        )}
      </div>
      <svg viewBox="0 0 320 72" className="w-full h-[72px]" aria-hidden>
        <defs>
          <linearGradient id="nw-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgb(34 211 238)" stopOpacity="0.25" />
            <stop offset="100%" stopColor="rgb(34 211 238)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={`${path} L316,68 L4,68 Z`} fill="url(#nw-fill)" />
        <path d={path} fill="none" stroke="rgb(34 211 238)" strokeWidth="2" strokeLinecap="round" />
      </svg>
      <p className="text-[10px] text-zinc-600 leading-snug">
        Snapshots saved locally when you open Portfolio — honest session trend, not tax PnL.
      </p>
    </div>
  );
}
