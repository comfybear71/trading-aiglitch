"use client";

import { GLITCH_EXCHANGE_URL } from "@/lib/trade-tokens";

type Hint = "buy" | "sell" | "generic";

export function GlitchOtcCallout({ hint = "generic" }: { hint?: Hint }) {
  const lead =
    hint === "sell"
      ? "§GLITCH sales are not open on Swap or Jupiter."
      : hint === "buy"
        ? "§GLITCH is not on Jupiter — buy with SOL on our exchange."
        : "§GLITCH does not trade on Jupiter.";

  return (
    <div className="rounded-xl border border-purple-500/30 bg-purple-950/20 p-4 space-y-2">
      <p className="text-sm font-bold text-purple-200">{lead}</p>
      <p className="text-[11px] text-zinc-400 leading-relaxed">
        We control the market on-chain (same rules as{" "}
        <a href={GLITCH_EXCHANGE_URL} className="text-purple-400 hover:underline" target="_blank" rel="noopener noreferrer">
          aiglitch.app/exchange
        </a>
        ): price rises <span className="text-zinc-300">$0.01 for every 10,000 §GLITCH sold</span>. Purchases
        build treasury SOL for exchange listings and promotion — and to avoid thin pools that bots can drain.
        <span className="text-zinc-500"> Selling §GLITCH is not available yet.</span>
      </p>
      <a
        href={GLITCH_EXCHANGE_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block w-full text-center py-2.5 rounded-lg bg-gradient-to-r from-purple-600/90 to-cyan-600/90 text-[11px] font-bold text-white"
      >
        Invest in §GLITCH — buy with SOL
      </a>
    </div>
  );
}
