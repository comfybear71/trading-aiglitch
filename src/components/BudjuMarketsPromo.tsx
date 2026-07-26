"use client";

import Link from "next/link";
import {
  BUDJU_BOT_REQUIRED,
  BUDJU_GATE_REQUIRED_DEFAULT,
  BUDJU_SITE,
} from "@/lib/budju-brand";
import { fmtMktCap, fmtUsdPrice, useBudjuMarket } from "@/lib/use-budju-market";
import { BUDJU_MINT } from "@/lib/trade-tokens";
import {
  BudjuPanelShell,
  fmtCompact,
} from "@/components/BudjuGateCallout";

const SOLSCAN_HOLDERS = `https://solscan.io/token/${BUDJU_MINT}#holders`;

function StatChip({
  label,
  value,
  sub,
  loading,
}: {
  label: string;
  value: string;
  sub?: React.ReactNode;
  loading?: boolean;
}) {
  return (
    <div className="rounded-lg bg-black/35 border border-fuchsia-500/25 px-2.5 py-2 min-w-[72px] flex-1">
      <p className="text-[9px] uppercase tracking-wide text-fuchsia-300/70 font-bold">{label}</p>
      {loading ? (
        <div className="h-5 w-14 bg-zinc-800/80 rounded mt-1.5 animate-pulse" />
      ) : (
        <p className="text-sm font-black text-white mt-0.5 tabular-nums">{value}</p>
      )}
      {sub && !loading && <p className="text-[9px] text-zinc-500 mt-0.5">{sub}</p>}
    </div>
  );
}

function RefreshBalancesButton({
  onRefresh,
  refreshing,
}: {
  onRefresh?: () => void;
  refreshing?: boolean;
}) {
  if (!onRefresh) return null;
  return (
    <button
      type="button"
      onClick={() => void onRefresh()}
      disabled={refreshing}
      className="text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full border border-fuchsia-400/50 text-fuchsia-100 hover:bg-fuchsia-500/20 disabled:opacity-50 transition-colors shrink-0"
    >
      {refreshing ? "Refreshing…" : "Check balance"}
    </button>
  );
}

/** Full-width Markets card — stats, mini chart, DCA bot story (matches §GLITCH promo density). */
export function BudjuMarketsPromo({
  eligible,
  budjuBalance,
  budjuRequired = BUDJU_GATE_REQUIRED_DEFAULT,
  onRefresh,
  refreshing,
  walletConnected,
  className = "",
}: {
  eligible: boolean;
  budjuBalance: number;
  budjuRequired?: number;
  onRefresh?: () => void;
  refreshing?: boolean;
  walletConnected: boolean;
  className?: string;
}) {
  const { market, loading: marketLoading } = useBudjuMarket(BUDJU_MINT);
  const botUnlocked = budjuBalance >= BUDJU_BOT_REQUIRED;
  const gatePct = Math.min(100, (budjuBalance / budjuRequired) * 100);
  const change = market?.change24h ?? 0;

  return (
    <BudjuPanelShell compact className={`h-full flex flex-col ${className}`}>
      <div className="flex flex-wrap items-start gap-2">
        <p className="text-[9px] font-bold uppercase tracking-widest text-fuchsia-300/80 w-full">
          Ecosystem token · Jupiter
        </p>
        <a
          href={BUDJU_SITE.home}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 rounded-md bg-fuchsia-950/40 p-1 border border-fuchsia-500/30 hover:border-fuchsia-400/60"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={BUDJU_SITE.logo} alt="BUDJU" className="h-7 w-auto max-w-[80px] object-contain" />
        </a>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-black text-fuchsia-100 uppercase tracking-tight leading-none">$BUDJU</p>
          {walletConnected ? (
            <p className="text-[10px] text-zinc-400 mt-0.5">
              Wallet{" "}
              <span className="text-fuchsia-200 font-bold">{fmtCompact(budjuBalance)}</span>
              {eligible ? (
                <span className="text-emerald-400 font-semibold ml-1">· Trade unlocked (1M+)</span>
              ) : (
                <span className="ml-1">· {(budjuRequired - budjuBalance).toLocaleString()} to trade gate</span>
              )}
            </p>
          ) : (
            <p className="text-[10px] text-zinc-500 mt-0.5">Connect wallet to check gate &amp; bot access</p>
          )}
        </div>
        {walletConnected && onRefresh && (
          <RefreshBalancesButton onRefresh={onRefresh} refreshing={refreshing} />
        )}
      </div>

      <div className="rounded-lg border border-fuchsia-500/20 bg-black/25 px-2.5 py-2">
        <p className="text-[11px] font-black text-fuchsia-100">The BUDJU trading bot</p>
        <p className="text-[10px] text-zinc-400 mt-1 leading-relaxed">
          Deposit and let the bot trade for you — dollar-cost averaging, fully automated, built on Solana. It works
          while you sleep.
        </p>
        <p className="text-[10px] text-zinc-500 mt-1.5">
          Hold{" "}
          <span className="text-fuchsia-200 font-semibold">{BUDJU_BOT_REQUIRED.toLocaleString()} $BUDJU</span> for the
          budju.xyz board ·{" "}
          <span className="text-zinc-400">{budjuRequired.toLocaleString()} for AIG!itch Trade here</span>
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <StatChip
          label="Price"
          loading={marketLoading}
          value={fmtUsdPrice(market?.priceUsd ?? 0)}
          sub={change !== 0 ? `24h ${change >= 0 ? "+" : ""}${change.toFixed(2)}%` : undefined}
        />
        <StatChip
          label="Mkt cap"
          loading={marketLoading}
          value={fmtMktCap(market?.marketCap ?? 0)}
        />
        <StatChip
          label="Holders"
          loading={marketLoading}
          value={market?.holders != null ? market.holders.toLocaleString() : "—"}
          sub={
            <a href={SOLSCAN_HOLDERS} target="_blank" rel="noopener noreferrer" className="text-fuchsia-400/90 hover:underline">
              {market?.holders != null ? "Solscan" : "View on Solscan"}
            </a>
          }
        />
      </div>

      {walletConnected && (
        <div
          className={`h-1.5 rounded-full bg-black/50 overflow-hidden ring-1 ${
            eligible ? "ring-emerald-500/30" : "ring-fuchsia-500/25"
          }`}
        >
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              eligible
                ? "w-full bg-gradient-to-r from-emerald-600 via-fuchsia-500 to-pink-300"
                : "bg-gradient-to-r from-fuchsia-600 via-fuchsia-400 to-pink-300"
            }`}
            style={eligible ? undefined : { width: `${Math.max(gatePct, budjuBalance > 0 ? 4 : 0)}%` }}
          />
        </div>
      )}

      <div className="flex flex-wrap gap-2 mt-auto pt-1">
        <a
          href={BUDJU_SITE.dcaBot}
          target="_blank"
          rel="noopener noreferrer"
          className={`text-[10px] font-black uppercase tracking-wide px-3 py-1.5 rounded-full shrink-0 ${
            botUnlocked
              ? "bg-gradient-to-r from-fuchsia-600 to-pink-500 text-white hover:brightness-110"
              : "border border-fuchsia-500/40 text-fuchsia-200/90 hover:bg-fuchsia-500/10"
          }`}
        >
          Launch trading bot →
        </a>
        <a
          href={BUDJU_SITE.howToBuy}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[10px] font-bold uppercase tracking-wide px-2.5 py-1.5 rounded-full border border-fuchsia-500/35 text-fuchsia-200/90 hover:bg-fuchsia-500/10"
        >
          How to buy
        </a>
        {!walletConnected && (
          <Link
            href="/swap?sell=SOL&buy=BUDJU"
            className="text-[10px] font-bold uppercase px-2.5 py-1.5 rounded-full bg-fuchsia-600/90 text-white hover:bg-fuchsia-500"
          >
            Buy on swap
          </Link>
        )}
        {walletConnected && eligible && (
          <Link
            href="/swap"
            className="text-[10px] font-bold uppercase px-2.5 py-1.5 rounded-full border border-emerald-500/40 text-emerald-200/90 hover:bg-emerald-500/10 sm:ml-auto"
          >
            Open swap
          </Link>
        )}
      </div>
    </BudjuPanelShell>
  );
}
