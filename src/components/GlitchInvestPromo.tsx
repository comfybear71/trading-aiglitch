"use client";

import Link from "next/link";
import {
  GLITCH_DAILY_SOL_LIMIT,
  GLITCH_LISTING_GOAL_SOL,
  GLITCH_TREASURY_WALLET,
  otcTreasuryWalletSol,
  type OtcPublicConfig,
} from "@/lib/glitch-otc";
import { GLITCH_EXCHANGE_PATH } from "@/lib/trade-tokens";

function fmtSold(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

function TreasuryBlock({ otc }: { otc: OtcPublicConfig }) {
  const treasurySol = otcTreasuryWalletSol(otc);
  const pct = Math.min(100, (treasurySol / GLITCH_LISTING_GOAL_SOL) * 100);
  const treasuryUsd = treasurySol * (otc.sol_price_usd || 0);

  return (
    <div className="rounded-xl border border-green-500/20 bg-black/40 p-4">
      <p className="text-[10px] uppercase tracking-widest text-green-400/90 font-bold">Treasury (on-chain)</p>
      <div className="flex flex-wrap items-end gap-x-3 gap-y-1 mt-2">
        <span className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-cyan-400">
          {treasurySol.toFixed(3)} SOL
        </span>
        {treasuryUsd > 0 && (
          <span className="text-sm text-zinc-500 pb-1">≈ ${treasuryUsd.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
        )}
        <span className="text-xs text-zinc-600 pb-1">goal {GLITCH_LISTING_GOAL_SOL.toLocaleString()} SOL</span>
      </div>
      <div className="h-2.5 bg-zinc-900 rounded-full overflow-hidden mt-3 ring-1 ring-zinc-800">
        <div
          className="h-full bg-gradient-to-r from-green-500 via-emerald-400 to-cyan-400 rounded-full transition-all duration-700"
          style={{ width: `${Math.max(pct, treasurySol > 0 ? 2 : 0)}%` }}
        />
      </div>
      <p className="text-[10px] text-zinc-500 mt-2 leading-relaxed">
        {pct.toFixed(2)}% toward Raydium / Jupiter listing — SOL in this wallet (§GLITCH buys + treasury funding).
        Matches Phantom / Solscan.
      </p>
      <a
        href={`https://solscan.io/account/${GLITCH_TREASURY_WALLET}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-[10px] font-mono text-cyan-600 hover:text-cyan-400 mt-2 inline-block"
      >
        Verify treasury · {GLITCH_TREASURY_WALLET.slice(0, 6)}…{GLITCH_TREASURY_WALLET.slice(-6)}
      </a>
    </div>
  );
}

type Variant = "hero" | "compact";

export function GlitchInvestPromo({
  otc,
  loading,
  variant = "hero",
}: {
  otc: OtcPublicConfig | null;
  loading?: boolean;
  variant?: Variant;
}) {
  if (variant === "compact") {
    const treasurySol = otc ? otcTreasuryWalletSol(otc) : 0;
    const pct = Math.min(100, (treasurySol / GLITCH_LISTING_GOAL_SOL) * 100);
    return (
      <Link
        href={GLITCH_EXCHANGE_PATH}
        className="block rounded-xl border border-purple-500/35 bg-gradient-to-r from-purple-950/50 to-cyan-950/30 p-3 hover:border-purple-400/50 transition-colors"
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-[10px] font-bold text-purple-300 uppercase tracking-wide">§GLITCH fundraise</p>
            <p className="text-sm font-black text-white mt-0.5">
              {loading
                ? "…"
                : otc
                  ? `$${otc.price_usd.toFixed(2)} · ${treasurySol.toFixed(2)} SOL treasury`
                  : "Invest with SOL"}
            </p>
          </div>
          <span className="text-[10px] font-bold text-cyan-300 shrink-0">Invest →</span>
        </div>
        {!loading && otc && (
          <div className="h-1 bg-zinc-800 rounded-full mt-2 overflow-hidden">
            <div className="h-full bg-cyan-500/80 rounded-full" style={{ width: `${pct}%` }} />
          </div>
        )}
      </Link>
    );
  }

  return (
    <section className="relative overflow-hidden rounded-2xl border border-purple-500/30 bg-gradient-to-br from-purple-950/60 via-[#0a0612] to-cyan-950/40 p-5 sm:p-6 shadow-[0_0_40px_-12px_rgba(168,85,247,0.35)]">
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-fuchsia-600/10 blur-3xl rounded-full pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-40 h-40 bg-cyan-500/10 blur-3xl rounded-full pointer-events-none" />

      <div className="relative flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-fuchsia-400/90">
            Community round · on-chain OTC
          </p>
          <h2 className="text-2xl sm:text-3xl font-black text-white mt-1 leading-tight">
            Invest in{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-cyan-300">
              §GLITCH
            </span>
          </h2>
          <p className="text-sm text-zinc-400 mt-2 max-w-xl leading-relaxed">
            Help fund the glitch — your SOL builds the treasury that powers exchange listings, cross-platform promotion,
            and a bot-resistant launch. Price rises{" "}
            <span className="text-zinc-200">$0.01 every 10,000 §GLITCH sold</span>. Early backers lock the curve before
            the crowd hits Jupiter.
          </p>
        </div>
        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full border border-amber-500/40 text-amber-300/95 bg-amber-950/30 shrink-0">
          Buy only · no sell yet
        </span>
      </div>

      {loading && !otc ? (
        <p className="text-zinc-500 text-sm mt-6">Loading live treasury…</p>
      ) : otc ? (
        <div className="relative grid gap-4 mt-6 lg:grid-cols-[1fr_1.1fr]">
          <div className="space-y-3">
            <div className="flex flex-wrap gap-3">
              <div className="rounded-lg bg-black/30 border border-zinc-800 px-3 py-2 min-w-[120px]">
                <p className="text-[9px] uppercase text-zinc-500">Now</p>
                <p className="text-xl font-black text-white">${otc.price_usd.toFixed(2)}</p>
                <p className="text-[10px] text-zinc-600">{otc.price_sol.toFixed(8)} SOL</p>
              </div>
              <div className="rounded-lg bg-black/30 border border-zinc-800 px-3 py-2 min-w-[120px]">
                <p className="text-[9px] uppercase text-zinc-500">Next tier</p>
                <p className="text-xl font-black text-yellow-400/90">${otc.bonding_curve.next_price_usd.toFixed(2)}</p>
                <p className="text-[10px] text-zinc-600">
                  in {otc.bonding_curve.remaining_in_tier.toLocaleString()} §GLITCH
                </p>
              </div>
              <div className="rounded-lg bg-black/30 border border-zinc-800 px-3 py-2 min-w-[120px]">
                <p className="text-[9px] uppercase text-zinc-500">Community</p>
                <p className="text-xl font-black text-white">{otc.stats.total_swaps.toLocaleString()}</p>
                <p className="text-[10px] text-zinc-600">{fmtSold(otc.stats.total_glitch_sold)} §GLITCH sold</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 text-[10px]">
              <span className="px-2 py-1 rounded-md bg-zinc-900 border border-zinc-700 text-zinc-400">
                Pay with <span className="text-white font-bold">SOL</span> only
              </span>
              <span className="px-2 py-1 rounded-md bg-zinc-900 border border-zinc-700 text-zinc-400">
                {otc.min_purchase.toLocaleString()}–{otc.max_purchase >= 1_000_000 ? "1M" : otc.max_purchase.toLocaleString()} §GLITCH / tx
              </span>
              <span className="px-2 py-1 rounded-md bg-zinc-900 border border-zinc-700 text-zinc-400">
                {GLITCH_DAILY_SOL_LIMIT} SOL max / wallet / 24h
              </span>
            </div>

            <Link
              href={GLITCH_EXCHANGE_PATH}
              className="inline-flex w-full sm:w-auto items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 text-white font-black text-sm shadow-lg shadow-purple-900/40 hover:brightness-110 transition"
            >
              Buy §GLITCH — invest now
            </Link>
          </div>

          <TreasuryBlock otc={otc} />
        </div>
      ) : (
        <p className="text-amber-500/90 text-sm mt-4">Treasury stats temporarily unavailable — you can still invest on the exchange.</p>
      )}
    </section>
  );
}
