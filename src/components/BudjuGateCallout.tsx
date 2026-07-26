"use client";

import Link from "next/link";
import { BUDJU_GATE_REQUIRED_DEFAULT, BUDJU_SITE } from "@/lib/budju-brand";

function fmtCompact(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString(undefined, { maximumFractionDigits: 0 });
}

function fmtFull(n: number) {
  return n.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

function BudjuPanelShell({
  children,
  compact = false,
  className = "",
}: {
  children: React.ReactNode;
  compact?: boolean;
  className?: string;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-fuchsia-500/45 shadow-[0_0_32px_-8px_rgba(217,70,239,0.35)] ${
        compact ? "p-3 space-y-2" : "p-4 space-y-3"
      } ${className}`}
      style={{
        background: "linear-gradient(135deg, #1a0533 0%, #140820 45%, #0d0612 100%)",
      }}
    >
      <div
        className="absolute inset-0 opacity-[0.12] pointer-events-none"
        style={{
          backgroundImage:
            "repeating-linear-gradient(45deg, #d946ef 0, #d946ef 1px, transparent 0, transparent 50%)",
          backgroundSize: "12px 12px",
        }}
      />
      <div className="relative">{children}</div>
    </div>
  );
}

function BudjuLinkPills({ showBuyOnSwap = true }: { showBuyOnSwap?: boolean }) {
  return (
    <div className="flex flex-wrap gap-2 pt-1">
      {(
        [
          ["budju.xyz", BUDJU_SITE.home],
          ["How to buy", BUDJU_SITE.trade],
          ["Tokenomics", BUDJU_SITE.tokenomics],
        ] as const
      ).map(([label, href]) => (
        <a
          key={label}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full border border-fuchsia-500/40 text-fuchsia-200/90 hover:bg-fuchsia-500/15 hover:text-white transition-colors"
        >
          {label}
        </a>
      ))}
      {showBuyOnSwap && (
        <Link
          href="/swap?sell=SOL&buy=BUDJU"
          className="text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full bg-fuchsia-600/90 text-white hover:bg-fuchsia-500 transition-colors"
        >
          Buy $BUDJU
        </Link>
      )}
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
      {refreshing ? "Refreshing…" : "Refresh balance"}
    </button>
  );
}

export function BudjuApprovedCallout({
  budjuBalance,
  budjuRequired = BUDJU_GATE_REQUIRED_DEFAULT,
  onRefresh,
  refreshing,
}: {
  budjuBalance: number;
  budjuRequired?: number;
  onRefresh?: () => void;
  refreshing?: boolean;
}) {
  return (
    <BudjuPanelShell>
      <div className="flex flex-wrap items-start gap-3">
        <a
          href={BUDJU_SITE.home}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 block rounded-lg bg-fuchsia-950/40 p-2 border border-fuchsia-500/30 hover:border-fuchsia-400/60 transition-colors"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={BUDJU_SITE.logo} alt="BUDJU" className="h-10 w-auto max-w-[140px] object-contain" />
        </a>
        <div className="min-w-0 flex-1">
          <p className="text-lg font-black text-fuchsia-100 tracking-tight uppercase">$BUDJU</p>
          <p className="text-[11px] text-fuchsia-100/70 mt-0.5">
            Gate token ·{" "}
            <a
              href={BUDJU_SITE.home}
              target="_blank"
              rel="noopener noreferrer"
              className="text-fuchsia-300 hover:text-white underline underline-offset-2"
            >
              budju.xyz
            </a>
          </p>
        </div>
        <RefreshBalancesButton onRefresh={onRefresh} refreshing={refreshing} />
      </div>

      <div className="mt-3 rounded-xl border border-emerald-400/40 bg-emerald-950/30 px-3 py-2.5 flex flex-wrap items-center gap-2">
        <span className="text-emerald-300 text-lg" aria-hidden>
          ✓
        </span>
        <span className="text-sm font-black text-emerald-200 uppercase tracking-wide">
          Approved for trading
        </span>
        <span className="text-[11px] text-emerald-100/80 ml-auto">
          Full swap · portfolio · send unlocked
        </span>
      </div>

      <div className="space-y-2">
        <div className="flex flex-wrap justify-between gap-2 text-[11px]">
          <span className="text-zinc-300">
            Your balance:{" "}
            <span className="font-bold text-fuchsia-200 text-sm">{fmtFull(budjuBalance)} $BUDJU</span>
            <span className="text-zinc-500 ml-1">({fmtCompact(budjuBalance)})</span>
          </span>
          <span className="text-emerald-400/90 font-medium">
            ≥ {budjuRequired.toLocaleString()} required
          </span>
        </div>
        <div className="h-2 rounded-full bg-black/50 overflow-hidden ring-1 ring-emerald-500/30">
          <div className="h-full w-full rounded-full bg-gradient-to-r from-emerald-600 via-fuchsia-500 to-pink-300" />
        </div>
      </div>

      <BudjuLinkPills />
    </BudjuPanelShell>
  );
}

export { BudjuLinkPills };

export function BudjuGateCallout({
  budjuBalance,
  budjuRequired = BUDJU_GATE_REQUIRED_DEFAULT,
  showSwapHint = true,
  onRefresh,
  refreshing,
}: {
  budjuBalance: number;
  budjuRequired?: number;
  showSwapHint?: boolean;
  onRefresh?: () => void;
  refreshing?: boolean;
}) {
  const pct = Math.min(100, (budjuBalance / budjuRequired) * 100);
  const shortfall = Math.max(0, budjuRequired - budjuBalance);

  return (
    <BudjuPanelShell>
      <div className="flex flex-wrap items-start gap-3">
        <a
          href={BUDJU_SITE.home}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 block rounded-lg bg-fuchsia-950/40 p-1.5 border border-fuchsia-500/30 hover:border-fuchsia-400/60 transition-colors"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={BUDJU_SITE.logo} alt="BUDJU" className="h-8 w-auto max-w-[120px] object-contain" />
        </a>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-black text-fuchsia-200 tracking-tight">
            Hold $BUDJU to unlock AIG!itch Trade
          </p>
          <p className="text-[11px] text-fuchsia-100/70 mt-0.5">
            Official gate token · checks your{" "}
            <span className="text-fuchsia-200/90">connected wallet</span> ·{" "}
            <a
              href={BUDJU_SITE.home}
              target="_blank"
              rel="noopener noreferrer"
              className="text-fuchsia-300 hover:text-white underline underline-offset-2"
            >
              budju.xyz
            </a>
          </p>
        </div>
        <RefreshBalancesButton onRefresh={onRefresh} refreshing={refreshing} />
      </div>

      <div className="space-y-2">
        <div className="flex flex-wrap justify-between gap-2 text-[11px]">
          <span className="text-zinc-300">
            Your balance:{" "}
            <span className="font-bold text-fuchsia-200">{fmtCompact(budjuBalance)} $BUDJU</span>
            <span className="text-zinc-500 ml-1">({fmtFull(budjuBalance)})</span>
          </span>
          <span className="text-zinc-500">
            Need {budjuRequired.toLocaleString()} ({fmtCompact(shortfall)} more)
          </span>
        </div>
        <div className="h-2 rounded-full bg-black/50 overflow-hidden ring-1 ring-fuchsia-500/25">
          <div
            className="h-full rounded-full bg-gradient-to-r from-fuchsia-600 via-fuchsia-400 to-pink-300 transition-all duration-500"
            style={{ width: `${Math.max(pct, budjuBalance > 0 ? 3 : 0)}%` }}
          />
        </div>
      </div>

      {showSwapHint && (
        <p className="text-[11px] text-zinc-400 leading-relaxed">
          Below the gate you can still swap{" "}
          <span className="text-fuchsia-200 font-medium">SOL or USDC → $BUDJU</span> here on Jupiter. Get $BUDJU on{" "}
          <a
            href={BUDJU_SITE.trade}
            target="_blank"
            rel="noopener noreferrer"
            className="text-fuchsia-300 hover:text-white underline"
          >
            How to buy
          </a>{" "}
          on budju.xyz or swap below, then tap <span className="text-fuchsia-200">Refresh balance</span>.
        </p>
      )}

      <BudjuLinkPills />
    </BudjuPanelShell>
  );
}

export function BudjuTraderStatus({
  eligible,
  budjuBalance,
  budjuRequired = BUDJU_GATE_REQUIRED_DEFAULT,
  onRefresh,
  refreshing,
}: {
  eligible: boolean;
  budjuBalance: number;
  budjuRequired?: number;
  onRefresh?: () => void;
  refreshing?: boolean;
}) {
  if (eligible) {
    return (
      <BudjuApprovedCallout
        budjuBalance={budjuBalance}
        budjuRequired={budjuRequired}
        onRefresh={onRefresh}
        refreshing={refreshing}
      />
    );
  }
  return (
    <BudjuGateCallout
      budjuBalance={budjuBalance}
      budjuRequired={budjuRequired}
      onRefresh={onRefresh}
      refreshing={refreshing}
    />
  );
}

/** Compact gate strip for Markets and other dense pages — same BUDJU look as Swap. */
export function BudjuTraderStatusSlim({
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
  const pct = Math.min(100, (budjuBalance / budjuRequired) * 100);

  return (
    <BudjuPanelShell compact className={`h-full ${className}`}>
      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        <a
          href={BUDJU_SITE.home}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 rounded-md bg-fuchsia-950/40 p-1 border border-fuchsia-500/30 hover:border-fuchsia-400/60"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={BUDJU_SITE.logo} alt="BUDJU" className="h-6 w-auto max-w-[72px] object-contain" />
        </a>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-black text-fuchsia-100 uppercase tracking-tight leading-none">$BUDJU</p>
          {walletConnected ? (
            <p className="text-[10px] text-zinc-400 mt-0.5 truncate">
              <span className="text-fuchsia-200 font-bold">{fmtCompact(budjuBalance)}</span>
              <span className="text-zinc-600 mx-1">·</span>
              {eligible ? (
                <span className="text-emerald-400 font-semibold">Approved for trading</span>
              ) : (
                <span>
                  {fmtCompact(Math.max(0, budjuRequired - budjuBalance))} to gate (
                  {budjuRequired.toLocaleString()})
                </span>
              )}
            </p>
          ) : (
            <p className="text-[10px] text-zinc-500 mt-0.5">
              Connect wallet (top right) to check gate · 1M required
            </p>
          )}
        </div>
        {walletConnected && onRefresh && (
          <RefreshBalancesButton onRefresh={onRefresh} refreshing={refreshing} />
        )}
        {!walletConnected && (
          <Link
            href="/swap?sell=SOL&buy=BUDJU"
            className="text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full bg-fuchsia-600/90 text-white hover:bg-fuchsia-500 shrink-0"
          >
            Buy $BUDJU
          </Link>
        )}
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
            style={eligible ? undefined : { width: `${Math.max(pct, budjuBalance > 0 ? 4 : 0)}%` }}
          />
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <BudjuLinkPills showBuyOnSwap={!walletConnected || !eligible} />
        {walletConnected && eligible && (
          <Link
            href="/swap"
            className="text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full border border-emerald-500/40 text-emerald-200/90 hover:bg-emerald-500/10 sm:ml-auto"
          >
            Open Swap
          </Link>
        )}
      </div>
    </BudjuPanelShell>
  );
}
