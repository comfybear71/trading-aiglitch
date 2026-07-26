"use client";

import Link from "next/link";
import { GLITCH_EXCHANGE_PATH } from "@/lib/trade-tokens";
import { useOtcConfig } from "@/lib/use-otc-config";
import { otcLifetimeSolFromOtc, otcTreasuryWalletSol } from "@/lib/glitch-otc";

type Hint = "buy" | "sell" | "generic";

export function GlitchOtcCallout({ hint = "generic" }: { hint?: Hint }) {
  const { otc } = useOtcConfig();
  const inWallet = otc ? otcTreasuryWalletSol(otc) : 0;
  const lifetime = otc ? otcLifetimeSolFromOtc(otc) : 0;
  const lead =
    hint === "sell"
      ? "§GLITCH sales are not open on Swap or Jupiter."
      : hint === "buy"
        ? "§GLITCH is not on Jupiter — buy with SOL on our exchange."
        : "§GLITCH does not trade on Jupiter.";

  return (
    <div className="rounded-xl border border-purple-500/30 bg-purple-950/20 p-4 space-y-2">
      <p className="text-sm font-bold text-purple-200">{lead}</p>
      {otc && (
        <p className="text-[10px] text-green-400/90 font-mono">
          Treasury {inWallet.toFixed(3)} SOL now · {lifetime.toFixed(2)} SOL lifetime OTC · ${otc.price_usd.toFixed(2)}{" "}
          now
        </p>
      )}
      <p className="text-[11px] text-zinc-400 leading-relaxed">
        We control the market on-chain (same rules as{" "}
        <Link href={GLITCH_EXCHANGE_PATH} className="text-purple-400 hover:underline">
          trade.aiglitch.app/exchange
        </Link>
        ): price rises <span className="text-zinc-300">$0.01 for every 10,000 §GLITCH sold</span>. Purchases
        build treasury SOL for exchange listings and promotion — and to avoid thin pools that bots can drain.
        <span className="text-zinc-500"> Selling §GLITCH is not available yet.</span>
      </p>
      <Link
        href={GLITCH_EXCHANGE_PATH}
        className="inline-block w-full text-center py-2.5 rounded-lg bg-gradient-to-r from-purple-600/90 to-cyan-600/90 text-[11px] font-bold text-white"
      >
        Invest in §GLITCH — buy with SOL
      </Link>
    </div>
  );
}
