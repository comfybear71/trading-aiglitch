"use client";

import Link from "next/link";
import { BUDJU_GATE_REQUIRED_DEFAULT, BUDJU_SITE } from "@/lib/budju-brand";

function fmtCompact(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString(undefined, { maximumFractionDigits: 0 });
}

export function BudjuGateCallout({
  budjuBalance,
  budjuRequired = BUDJU_GATE_REQUIRED_DEFAULT,
  showSwapHint = true,
}: {
  budjuBalance: number;
  budjuRequired?: number;
  showSwapHint?: boolean;
}) {
  const pct = Math.min(100, (budjuBalance / budjuRequired) * 100);
  const shortfall = Math.max(0, budjuRequired - budjuBalance);

  return (
    <div
      className="relative overflow-hidden rounded-2xl border border-fuchsia-500/45 p-4 space-y-3 shadow-[0_0_32px_-8px_rgba(217,70,239,0.35)]"
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
      <div className="relative flex flex-wrap items-start gap-3">
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
            Official gate token ·{" "}
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
      </div>

      <div className="relative space-y-2">
        <div className="flex flex-wrap justify-between gap-2 text-[11px]">
          <span className="text-zinc-300">
            Your balance:{" "}
            <span className="font-bold text-fuchsia-200">{fmtCompact(budjuBalance)} $BUDJU</span>
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
        <p className="relative text-[11px] text-zinc-400 leading-relaxed">
          Below the gate you can still swap{" "}
          <span className="text-fuchsia-200 font-medium">SOL or USDC → $BUDJU</span> here on Jupiter. Get $BUDJU on{" "}
          <a
            href={BUDJU_SITE.home}
            target="_blank"
            rel="noopener noreferrer"
            className="text-fuchsia-300 hover:text-white underline"
          >
            budju.xyz
          </a>{" "}
          or Jupiter, then refresh your wallet.
        </p>
      )}

      <div className="relative flex flex-wrap gap-2 pt-1">
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
        <Link
          href="/swap?sell=SOL&buy=BUDJU"
          className="text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full bg-fuchsia-600/90 text-white hover:bg-fuchsia-500 transition-colors"
        >
          Buy $BUDJU
        </Link>
      </div>
    </div>
  );
}
