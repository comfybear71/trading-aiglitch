"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { PersonaHostStrip } from "@/components/PersonaHostStrip";
import { fetchCuratedPrices } from "@/lib/curated-markets-client";
import {
  JUPITER_EARN_DOCS_URL,
  JUPITER_EARN_URL,
  TRADE_YIELD_LSTS,
} from "@/lib/earn-lsts";
import { fmtMarketUsd, swapHref } from "@/lib/market-pairs";

export default function EarnClient() {
  const [prices, setPrices] = useState<Record<string, number | undefined>>({});
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const symbols = [...TRADE_YIELD_LSTS.map((t) => t.symbol), "SOL"];
      const p = await fetchCuratedPrices(symbols);
      setPrices(p);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-10">
      <header className="space-y-2">
        <p className="text-[10px] uppercase tracking-[0.25em] text-amber-400/90 font-bold">Phase 6</p>
        <h1 className="text-2xl sm:text-3xl font-black text-white">Earn &amp; liquid staking</h1>
        <p className="text-sm text-zinc-400 leading-relaxed max-w-2xl">
          <strong className="text-zinc-300 font-semibold">Swap</strong> jupSOL and mSOL here via Jupiter (same 1M{" "}
          $BUDJU gate as other majors). <strong className="text-zinc-300 font-semibold">Deposit / lend</strong> on{" "}
          <a href={JUPITER_EARN_URL} target="_blank" rel="noopener noreferrer" className="text-amber-300/90 hover:underline">
            Jupiter Earn
          </a>{" "}
          — we do not custody lend positions in trade.aiglitch.app yet.
        </p>
      </header>

      <section className="rounded-2xl border border-amber-500/25 bg-amber-950/10 p-4 space-y-2">
        <h2 className="text-xs font-black uppercase tracking-wide text-amber-200/90">Honesty first</h2>
        <p className="text-sm text-zinc-400 leading-relaxed">
          No guaranteed returns. LST exchange rates move with staking rewards; Jupiter Earn/Lend has smart-contract and
          market risk. This is not financial advice. We do not show APY numbers until we can verify a live source
          on-chain.
        </p>
      </section>

      <PersonaHostStrip />

      <section className="space-y-3">
        <h2 className="text-sm font-black text-white uppercase tracking-wide">Curated LSTs</h2>
        <ul className="rounded-xl border border-zinc-800/90 divide-y divide-zinc-800/80 overflow-hidden bg-zinc-950/30">
          {TRADE_YIELD_LSTS.map((lst) => {
            const price = prices[lst.symbol];
            const solPrice = prices.SOL;
            const hrefIn = swapHref("SOL", lst.symbol);
            const hrefOut = swapHref(lst.symbol, "SOL");
            return (
              <li key={lst.symbol} className="p-4 space-y-3">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-lg font-black text-white">{lst.symbol}</p>
                      <span className="text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded border border-amber-500/40 text-amber-300/90">
                        {lst.issuer}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-500 mt-1 leading-relaxed">{lst.summary}</p>
                  </div>
                  <p className="text-base font-black text-white tabular-nums shrink-0">
                    {loading ? "…" : price != null && price > 0 ? fmtMarketUsd(price) : "—"}
                    {solPrice != null && solPrice > 0 && price != null && price > 0 ? (
                      <span className="block text-[10px] font-normal text-zinc-500 text-right">
                        ~{(price / solPrice).toFixed(4)} SOL
                      </span>
                    ) : null}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link
                    href={hrefIn}
                    className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-600/85 to-purple-600/85 text-[11px] font-bold text-white hover:opacity-95"
                  >
                    Swap SOL → {lst.symbol}
                  </Link>
                  <Link
                    href={hrefOut}
                    className="px-3 py-1.5 rounded-lg border border-zinc-700 text-[11px] font-bold text-zinc-300 hover:border-cyan-500/40"
                  >
                    Swap {lst.symbol} → SOL
                  </Link>
                  <a
                    href={JUPITER_EARN_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-lg border border-amber-500/40 text-[11px] font-bold text-amber-200/90 hover:bg-amber-500/10"
                  >
                    Earn on Jupiter ↗
                  </a>
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="rounded-2xl border border-zinc-800 bg-zinc-950/50 p-5 space-y-2">
        <h2 className="text-sm font-black text-zinc-200 uppercase tracking-wide">What&apos;s next</h2>
        <p className="text-sm text-zinc-500 leading-relaxed">
          In-app Jupiter Earn deposit/withdraw needs product spec + wallet flows. Until then, use Jupiter directly and
          keep LST swaps on{" "}
          <Link href="/swap" className="text-cyan-400/90 hover:underline">
            Swap
          </Link>{" "}
          or{" "}
          <Link href="/markets" className="text-cyan-400/90 hover:underline">
            Markets
          </Link>
          .
        </p>
        <a
          href={JUPITER_EARN_DOCS_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block text-[11px] font-bold text-cyan-400/90 hover:underline"
        >
          Jupiter docs ↗
        </a>
      </section>

      <div className="flex flex-wrap gap-2 text-[11px]">
        <Link href="/markets" className="px-3 py-2 rounded-full border border-zinc-700 text-zinc-300 hover:border-cyan-500/40">
          Markets
        </Link>
        <Link href="/roadmap" className="px-3 py-2 rounded-full border border-zinc-700 text-zinc-300 hover:border-purple-500/40">
          Roadmap
        </Link>
        <Link href="/about" className="px-3 py-2 rounded-full border border-zinc-700 text-zinc-300 hover:border-purple-500/40">
          Transparency
        </Link>
      </div>
    </div>
  );
}
