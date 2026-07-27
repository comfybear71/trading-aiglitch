"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useTraderWallet } from "@/context/TraderWalletContext";
import { fmtUsd, usdValue, useTradePrices, fmtGlitchUnitUsd, mergeOtcGlitchPrice } from "@/lib/use-trade-prices";
import { HoldingsChips } from "@/components/HoldingsChips";
import { GlitchInvestPromo } from "@/components/GlitchInvestPromo";
import { useOtcConfig } from "@/lib/use-otc-config";
import { GLITCH_EXCHANGE_PATH } from "@/lib/trade-tokens";
import { TradeActivityPanel } from "@/components/TradeActivityPanel";
import { MagicLinkOpenLinks } from "@/components/MagicLinkOpenLinks";
import { CopyWalletAddress } from "@/components/CopyWalletAddress";
import { PortfolioNetWorthChart } from "@/components/PortfolioNetWorthChart";
import { TokenIcon } from "@/components/TokenIcon";
import { SwapActivityLine } from "@/components/SwapActivityLine";
import { BUDJU_SITE } from "@/lib/budju-brand";
import { useWalletTokenBalances } from "@/lib/use-wallet-token-balances";
import { useTradeTokenMeta, metaForSymbol } from "@/lib/use-trade-token-meta";
import {
  amountForSymbol,
  isMeaningfulBalance,
  WALLET_CORE_SYMBOLS,
} from "@/lib/wallet-token-balances";
import { TRADE_CURATED_JUPITER_TOKENS } from "@/lib/trade-tokens";
import {
  appendNetWorthSnapshot,
  fetchServerNetWorthHistory,
  loadNetWorthHistory,
  mergeNetWorthHistories,
  netWorthDelta,
  postServerNetWorthSnapshot,
  type NetWorthPoint,
} from "@/lib/portfolio-networth-history";
import {
  activityKindMeta,
  activityLabel,
  fetchTradeActivity,
  formatActivityWhen,
  solscanTxUrl,
  type TradeActivityItem,
} from "@/lib/trade-activity-api";

const HOLDINGS = [
  { key: "usdc", symbol: "USDC", label: "USDC", bar: "bg-emerald-500/80" },
  { key: "sol", symbol: "SOL", label: "SOL", bar: "bg-violet-500/80" },
  { key: "budju", symbol: "BUDJU", label: "$BUDJU", bar: "bg-fuchsia-500/80" },
  { key: "glitch", symbol: "GLITCH", label: "§GLITCH", bar: "bg-cyan-500/80" },
] as const;

function fmtAmount(n: number, max = 6) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  return n.toLocaleString(undefined, { maximumFractionDigits: max });
}

export default function PortfolioClient() {
  const trader = useTraderWallet();
  const { prices, loading: pricesLoading } = useTradePrices(!!trader.wallet);
  const [chipFilter, setChipFilter] = useState<string | null>(null);
  const [tab, setTab] = useState<"positions" | "activity">("positions");
  const [activityRefresh, setActivityRefresh] = useState(0);
  const [recentActivity, setRecentActivity] = useState<TradeActivityItem[]>([]);
  const [nwHistory, setNwHistory] = useState<NetWorthPoint[]>([]);
  const [nwServerSynced, setNwServerSynced] = useState(false);
  const { otc, loading: otcLoading, refreshing: otcRefreshing } = useOtcConfig();
  const tokenMeta = useTradeTokenMeta();
  const { rows: walletRows, reload: reloadWalletRows } = useWalletTokenBalances(trader.wallet);
  const b = trader.eligibility?.balances;
  const priceBook = mergeOtcGlitchPrice(prices, otc?.price_usd);
  const balanceKey = b
    ? [b.sol, b.usdc, b.budju, b.glitch, otc?.price_usd ?? ""].join("|")
    : "";

  const loadRecentActivity = useCallback(async () => {
    if (!trader.wallet) {
      setRecentActivity([]);
      return;
    }
    try {
      const all = await fetchTradeActivity(trader.wallet);
      setRecentActivity(all.slice(0, 3));
    } catch {
      setRecentActivity([]);
    }
  }, [trader.wallet]);

  useEffect(() => {
    if (tab === "positions") void loadRecentActivity();
  }, [tab, loadRecentActivity, activityRefresh]);

  useEffect(() => {
    if (!trader.wallet) {
      setNwHistory([]);
      setNwServerSynced(false);
      return;
    }
    let cancelled = false;
    (async () => {
      const local = loadNetWorthHistory(trader.wallet!);
      let server: NetWorthPoint[] = [];
      try {
        server = await fetchServerNetWorthHistory(trader.wallet!);
      } catch {
        server = [];
      }
      if (cancelled) return;
      setNwServerSynced(server.length > 0);
      setNwHistory(mergeNetWorthHistories(local, server));
    })();
    return () => {
      cancelled = true;
    };
  }, [trader.wallet]);

  useEffect(() => {
    if (!trader.wallet || pricesLoading) return;
    let net = 0;
    const bal = trader.eligibility?.balances;
    if (bal) {
      for (const h of HOLDINGS) {
        const v = usdValue(bal[h.key], h.symbol, priceBook);
        if (v != null) net += v;
      }
    }
    const local = appendNetWorthSnapshot(trader.wallet, net);
    void postServerNetWorthSnapshot(trader.wallet, net).then(async () => {
      try {
        const server = await fetchServerNetWorthHistory(trader.wallet!);
        setNwServerSynced(server.length > 0);
        setNwHistory(mergeNetWorthHistories(local, server));
      } catch {
        setNwHistory(local);
      }
    });
  }, [trader.wallet, pricesLoading, balanceKey, priceBook]);

  if (!trader.wallet) {
    return (
      <div className="max-w-2xl mx-auto rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 text-center">
        <p className="text-4xl mb-3">{"\u{1F45B}"}</p>
        <h1 className="text-xl font-black text-white">Portfolio</h1>
        <p className="text-zinc-400 text-sm mt-2">Connect wallet (top right) to see holdings.</p>
      </div>
    );
  }

  let netUsd = 0;
  if (b) {
    for (const h of HOLDINGS) {
      const amt = b[h.key];
      const v = usdValue(amt, h.symbol, priceBook);
      if (v != null) netUsd += v;
    }
  }
  const nwDelta = netWorthDelta(nwHistory.length ? nwHistory : loadNetWorthHistory(trader.wallet ?? ""));

  const curatedDecimals = new Map(TRADE_CURATED_JUPITER_TOKENS.map((t) => [t.symbol, t.decimals]));
  const extraHoldings =
    walletRows?.filter(
      (r) =>
        !WALLET_CORE_SYMBOLS.includes(r.symbol as (typeof WALLET_CORE_SYMBOLS)[number]) &&
        isMeaningfulBalance(r.symbol, r.amount),
    ) ?? [];

  const holdingAmount = (key: (typeof HOLDINGS)[number]["key"], symbol: string) => {
    if (walletRows) return amountForSymbol(walletRows, symbol);
    return b?.[key] ?? 0;
  };

  const refreshAll = () => {
    void trader.refresh();
    void reloadWalletRows();
    setActivityRefresh((k) => k + 1);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <GlitchInvestPromo
        otc={otc}
        loading={otcLoading}
        refreshing={otcRefreshing}
        variant="compact"
      />
      <div className="rounded-2xl border border-zinc-800 bg-[#12121a] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-green-400 uppercase tracking-wider">
                ● Connected
              </span>
              <span className="text-xs font-mono text-cyan-300">{trader.trunc}</span>
              <CopyWalletAddress address={trader.wallet} />
            </div>
            <p className="text-3xl font-black text-white mt-2">
              {pricesLoading ? "…" : fmtUsd(netUsd)}
            </p>
            <p className="text-xs text-zinc-500 mt-1">
              Estimated net worth (Jupiter + OTC §GLITCH price)
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              type="button"
              onClick={refreshAll}
              className="px-3 py-1.5 rounded-lg border border-zinc-700 text-xs text-zinc-400 hover:text-cyan-300"
            >
              Refresh
            </button>
            <Link
              href="/send"
              className="px-3 py-1.5 rounded-lg border border-zinc-700 text-xs text-zinc-300 hover:border-lime-500/40 hover:text-lime-300"
            >
              Send
            </Link>
            <Link
              href={
                chipFilter === "GLITCH"
                  ? GLITCH_EXCHANGE_PATH
                  : !trader.eligible
                    ? "/swap?sell=SOL&buy=BUDJU"
                    : chipFilter
                      ? `/swap?sell=${encodeURIComponent(chipFilter)}`
                      : "/swap"
              }
              {...(chipFilter === "GLITCH" ? {} : {})}
              className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-600/80 to-cyan-600/80 text-xs font-bold text-white"
            >
              {chipFilter === "GLITCH" ? "Invest §GLITCH" : "Swap"}
            </Link>
          </div>
        </div>
        {netUsd > 0 && b && (
          <div className="mt-4 space-y-2">
            <div className="flex h-2 rounded-full overflow-hidden gap-px bg-zinc-800">
              {HOLDINGS.map((h) => {
                const val = usdValue(b[h.key], h.symbol, priceBook) ?? 0;
                const pct = Math.max(0, (val / netUsd) * 100);
                if (pct < 0.5) return null;
                return (
                  <div
                    key={h.key}
                    className={`${h.bar} min-w-[2px]`}
                    style={{ width: `${pct}%` }}
                    title={`${h.label} ${pct.toFixed(1)}%`}
                  />
                );
              })}
            </div>
            <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-zinc-500">
              {HOLDINGS.map((h) => {
                const val = usdValue(b[h.key], h.symbol, priceBook) ?? 0;
                const pct = netUsd > 0 ? (val / netUsd) * 100 : 0;
                if (pct < 0.5) return null;
                return (
                  <span key={h.key} className="inline-flex items-center gap-1">
                    <span className={`w-1.5 h-1.5 rounded-full ${h.bar}`} aria-hidden />
                    {h.label} {pct.toFixed(0)}%
                  </span>
                );
              })}
            </div>
          </div>
        )}
        <div className="mt-4">
          <HoldingsChips
            activeSymbol={chipFilter}
            onSelect={(s) => setChipFilter((prev) => (prev === s ? null : s))}
            size="sm"
          />
        </div>
        {!trader.eligible && (
          <p className="text-[11px] mt-3 border-t border-fuchsia-500/20 pt-3 text-zinc-400 leading-relaxed">
            Trade unlocks at {(trader.eligibility?.budju_required ?? 1_000_000).toLocaleString()}{" "}
            <span className="text-fuchsia-300 font-bold">$BUDJU</span> — you have{" "}
            {fmtAmount(trader.eligibility?.budju_balance ?? 0, 0)}.{" "}
            <Link href="/swap?sell=SOL&buy=BUDJU" className="text-fuchsia-300 hover:text-white font-bold underline">
              Buy on Swap
            </Link>
            ,{" "}
            <a
              href={BUDJU_SITE.howToBuy}
              target="_blank"
              rel="noopener noreferrer"
              className="text-fuchsia-300 hover:text-white font-bold underline"
            >
              How to buy
            </a>
            , or{" "}
            <a
              href={BUDJU_SITE.tokenomics}
              target="_blank"
              rel="noopener noreferrer"
              className="text-fuchsia-300 hover:text-white font-bold underline"
            >
              Tokenomics
            </a>
            .
          </p>
        )}
      </div>

      <PortfolioNetWorthChart
        points={nwHistory}
        deltaUsd={nwDelta.usd}
        deltaPct={nwDelta.pct}
        serverSynced={nwServerSynced}
      />

      <div className="flex border-b border-zinc-800 text-sm">
        <button
          type="button"
          onClick={() => setTab("positions")}
          className={`px-4 py-2 font-bold transition-colors ${
            tab === "positions"
              ? "text-white border-b-2 border-cyan-400"
              : "text-zinc-600 hover:text-zinc-300"
          }`}
        >
          Positions
        </button>
        <button
          type="button"
          onClick={() => setTab("activity")}
          className={`px-4 py-2 font-bold transition-colors ${
            tab === "activity"
              ? "text-white border-b-2 border-cyan-400"
              : "text-zinc-600 hover:text-zinc-300"
          }`}
        >
          Activity
        </button>
      </div>

      {tab === "activity" ? (
        <div className="space-y-4">
          <MagicLinkOpenLinks onChanged={() => setActivityRefresh((k) => k + 1)} />
          <div className="rounded-2xl border border-zinc-800 bg-[#12121a] overflow-hidden">
            <TradeActivityPanel
              wallet={trader.wallet}
              refreshKey={activityRefresh}
              showToolbar
              emptyText="Swaps, sends, and magic-link events appear here after you trade."
            />
          </div>
        </div>
      ) : (
      <div className="rounded-2xl border border-zinc-800 overflow-hidden">
        <div className="px-4 py-3 border-b border-zinc-800 flex justify-between text-[10px] uppercase text-zinc-500 font-semibold">
          <span>Holdings</span>
          <span>Value</span>
        </div>
        <ul className="divide-y divide-zinc-800/80">
          {HOLDINGS.filter((h) => !chipFilter || h.symbol === chipFilter).map((h) => {
            const amt = holdingAmount(h.key, h.symbol);
            const val = usdValue(amt, h.symbol, priceBook);
            const pct = netUsd > 0 && val != null ? Math.min(100, (val / netUsd) * 100) : 0;
            const m = metaForSymbol(tokenMeta, h.symbol);
            return (
              <li key={h.key} className="px-4 py-3 flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1 flex gap-3">
                  <TokenIcon
                    symbol={h.symbol}
                    iconUrl={m?.iconUrl}
                    iconEmoji={m?.iconEmoji}
                    size={32}
                    className="mt-0.5"
                  />
                  <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-bold text-white">{h.label}</p>
                    {netUsd > 0 && val != null && val > 0 && (
                      <span className="text-[10px] text-zinc-500 shrink-0">{pct.toFixed(1)}%</span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-500 font-mono mt-0.5">
                    {fmtAmount(amt)} {h.symbol}
                    {h.symbol === "GLITCH" && fmtGlitchUnitUsd(priceBook.GLITCH) && (
                      <span className="text-purple-400/80 ml-1">@ {fmtGlitchUnitUsd(priceBook.GLITCH)}</span>
                    )}
                  </p>
                  {netUsd > 0 && val != null && val > 0 && (
                    <div className="mt-2 h-1 rounded-full bg-zinc-800 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-purple-500/70 to-cyan-500/70"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  )}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm text-zinc-300">{fmtUsd(val)}</p>
                  {h.symbol === "GLITCH" ? (
                    <Link
                      href={GLITCH_EXCHANGE_PATH}
                      className="text-[10px] text-purple-400/90 hover:text-purple-300 mt-1 inline-block"
                    >
                      Invest (OTC)
                    </Link>
                  ) : (
                    <Link
                      href={`/swap?sell=${encodeURIComponent(h.symbol)}`}
                      className="text-[10px] text-cyan-500/80 hover:text-cyan-400 mt-1 inline-block"
                    >
                      Trade
                    </Link>
                  )}
                </div>
              </li>
            );
          })}
          {extraHoldings
            .filter((r) => !chipFilter || chipFilter === r.symbol)
            .map((r) => {
              const val = usdValue(r.amount, r.symbol, priceBook);
              const m = metaForSymbol(tokenMeta, r.symbol);
              return (
                <li key={r.mint} className="px-4 py-3 flex items-center justify-between gap-3 bg-zinc-950/20">
                  <div className="min-w-0 flex-1 flex gap-3">
                    <TokenIcon
                      symbol={r.symbol}
                      iconUrl={m?.iconUrl}
                      iconEmoji={m?.iconEmoji}
                      size={32}
                      className="mt-0.5"
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-white">{r.symbol}</p>
                      <p className="text-xs text-zinc-500 font-mono mt-0.5">
                        {fmtAmount(r.amount, curatedDecimals.get(r.symbol) ?? 6)}{" "}
                        {r.symbol}
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm text-zinc-300">{fmtUsd(val)}</p>
                    <Link
                      href={`/swap?sell=${encodeURIComponent(r.symbol)}`}
                      className="text-[10px] text-cyan-500/80 hover:text-cyan-400 mt-1 inline-block"
                    >
                      Trade
                    </Link>
                  </div>
                </li>
              );
            })}
        </ul>
      </div>
      )}

      {tab === "positions" && recentActivity.length > 0 && (
        <div className="rounded-2xl border border-zinc-800 bg-[#12121a] overflow-hidden">
          <div className="px-4 py-2 flex items-center justify-between border-b border-zinc-800">
            <p className="text-[10px] uppercase text-zinc-500 font-semibold">Recent activity</p>
            <button
              type="button"
              onClick={() => setTab("activity")}
              className="text-[10px] text-cyan-500 hover:underline"
            >
              View all
            </button>
          </div>
          <ul className="divide-y divide-zinc-800/80">
            {recentActivity.map((a) => {
              const meta = activityKindMeta(a.kind);
              return (
              <li key={a.id} className="px-4 py-2 flex justify-between gap-2 text-sm">
                <div className="min-w-0">
                  <span className="text-[9px] font-bold uppercase text-zinc-600 mr-1">{meta.label}</span>
                  {a.kind === "swap" && a.detail ? (
                    <SwapActivityLine detail={a.detail} fallback={activityLabel(a)} />
                  ) : (
                    <span className="text-zinc-400 truncate">{activityLabel(a)}</span>
                  )}
                  <span className="text-[10px] text-zinc-600 ml-1">{formatActivityWhen(a.at)}</span>
                </div>
                {a.signature ? (
                  <a
                    href={solscanTxUrl(a.signature)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] text-cyan-500 shrink-0"
                  >
                    Solscan
                  </a>
                ) : null}
              </li>
            );
            })}
          </ul>
        </div>
      )}

      <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-[11px]">
        <Link href="/markets" className="text-zinc-500 hover:text-cyan-400">
          Markets
        </Link>
        <Link href="/nft" className="text-zinc-500 hover:text-purple-400">
          NFT shop
        </Link>
        <Link href="/about" className="text-zinc-500 hover:text-zinc-300">
          Transparency
        </Link>
        <Link href="/roadmap" className="text-zinc-500 hover:text-purple-300">
          Roadmap
        </Link>
      </div>

      {!trader.eligibility?.helius_enabled && (
        <p className="text-[10px] text-amber-600 text-center">
          Balance reader may be on RPC fallback — refresh if numbers look wrong.
        </p>
      )}

      <p className="text-[10px] text-zinc-600 text-center leading-relaxed">
        AI persona treasury tools are admin-only — no action needed here.
      </p>
    </div>
  );
}
