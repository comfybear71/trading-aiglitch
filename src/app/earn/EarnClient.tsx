"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { TokenIcon } from "@/components/TokenIcon";
import { fmtTokenAmount } from "@/components/WalletHoldingRow";
import { useTraderWallet } from "@/context/TraderWalletContext";
import { fetchCuratedMarkets, fetchCuratedPrices } from "@/lib/curated-markets-client";
import {
  JUPITER_EARN_DOCS_URL,
  JUPITER_EARN_URL,
  TRADE_YIELD_LSTS,
} from "@/lib/earn-lsts";
import { fmtMarketUsd, swapHref } from "@/lib/market-pairs";
import { metaForSymbol, useTradeTokenMeta } from "@/lib/use-trade-token-meta";
import { useWalletTokenBalances } from "@/lib/use-wallet-token-balances";
import { mergedTokenAmount } from "@/lib/wallet-token-balances";

type IconRow = { iconUrl?: string | null; iconEmoji?: string; name?: string };

export default function EarnClient() {
  const trader = useTraderWallet();
  const tokenMeta = useTradeTokenMeta();
  const { rows: walletRows, reload } = useWalletTokenBalances(trader.wallet);
  const [prices, setPrices] = useState<Record<string, number | undefined>>({});
  const [curatedIcons, setCuratedIcons] = useState<Record<string, IconRow>>({});
  const [loading, setLoading] = useState(true);

  const earnSymbols = useMemo(() => TRADE_YIELD_LSTS.map((t) => t.symbol), []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const symbols = [...earnSymbols, "SOL", "USDC"];
      const [p, curated] = await Promise.all([
        fetchCuratedPrices(symbols),
        fetchCuratedMarkets(),
      ]);
      setPrices(p);
      const iconMap: Record<string, IconRow> = {};
      for (const t of curated?.tokens ?? []) {
        iconMap[t.symbol] = {
          iconUrl: t.iconUrl,
          iconEmoji: t.iconEmoji,
          name: t.name,
        };
      }
      setCuratedIcons(iconMap);
    } finally {
      setLoading(false);
    }
  }, [earnSymbols]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (trader.wallet) void reload();
  }, [trader.wallet, reload]);

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-10">
      <header className="space-y-2">
        <p className="text-[10px] uppercase tracking-[0.25em] text-amber-400/90 font-bold">Phase 6</p>
        <h1 className="text-2xl sm:text-3xl font-black text-white">Earn &amp; liquid staking</h1>
        <p className="text-sm text-zinc-400 leading-relaxed max-w-2xl">
          <strong className="text-zinc-300 font-semibold">Swap</strong> jupSOL, mSOL, PSOL, and WBTC here via Jupiter
          (same 1M $BUDJU gate as other majors). <strong className="text-zinc-300 font-semibold">Deposit / lend</strong>{" "}
          on{" "}
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

      <section className="space-y-3">
        <h2 className="text-sm font-black text-white uppercase tracking-wide">Curated LSTs &amp; yield assets</h2>
        <ul className="rounded-xl border border-zinc-800/90 divide-y divide-zinc-800/80 overflow-hidden bg-zinc-950/30">
          {TRADE_YIELD_LSTS.map((lst) => {
            const price = prices[lst.symbol];
            const solPrice = prices.SOL;
            const quoteIn = lst.defaultQuote === "USDC" ? "USDC" : "SOL";
            const hrefIn = swapHref(quoteIn, lst.symbol);
            const hrefOut = swapHref(lst.symbol, quoteIn);
            const balance = trader.wallet ? mergedTokenAmount(walletRows, lst.symbol, 0) : 0;
            const walletUsd =
              balance > 0 && price != null && price > 0 && Number.isFinite(price)
                ? balance * price
                : null;
            const m = metaForSymbol(tokenMeta, lst.symbol);
            const curated = curatedIcons[lst.symbol];
            const iconUrl = curated?.iconUrl ?? m?.iconUrl;
            const iconEmoji = curated?.iconEmoji ?? m?.iconEmoji;
            return (
              <li key={lst.symbol} className="p-4 space-y-3">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1 flex gap-3">
                    <TokenIcon symbol={lst.symbol} iconUrl={iconUrl} iconEmoji={iconEmoji} size={40} />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-lg font-black text-white">{lst.symbol}</p>
                        <span className="text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded border border-amber-500/40 text-amber-300/90">
                          {lst.issuer}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-500 mt-1 leading-relaxed">{lst.summary}</p>
                      {trader.wallet ? (
                        <p className="text-[11px] text-cyan-300/90 font-mono mt-1.5">
                          Your wallet: {fmtTokenAmount(balance, lst.decimals <= 6 ? lst.decimals : 6)} {lst.symbol}
                          {walletUsd != null ? (
                            <span className="text-zinc-400 ml-2">· {fmtMarketUsd(walletUsd)}</span>
                          ) : balance > 0 && !loading ? (
                            <span className="text-zinc-600 ml-2">· USD —</span>
                          ) : null}
                        </p>
                      ) : null}
                    </div>
                  </div>
                  <p className="text-base font-black text-white tabular-nums shrink-0">
                    {loading ? "…" : price != null && price > 0 ? fmtMarketUsd(price) : "—"}
                    <span className="block text-[10px] font-normal text-zinc-500 text-right">per token</span>
                    {solPrice != null && solPrice > 0 && price != null && price > 0 && lst.defaultQuote === "SOL" ? (
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
                    Swap {quoteIn} → {lst.symbol}
                  </Link>
                  <Link
                    href={hrefOut}
                    className="px-3 py-1.5 rounded-lg border border-zinc-700 text-[11px] font-bold text-zinc-300 hover:border-cyan-500/40"
                  >
                    Swap {lst.symbol} → {quoteIn}
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
