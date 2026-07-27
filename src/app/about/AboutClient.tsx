"use client";

import Link from "next/link";
import { GlitchExchangeStory } from "@/components/GlitchExchangeStory";
import { ECOSYSTEM_LINKS } from "@/lib/ecosystem-links";
import { otcTreasuryWalletSol } from "@/lib/glitch-otc";
import { GLITCH_EXCHANGE_PATH } from "@/lib/trade-tokens";
import { useOtcConfig } from "@/lib/use-otc-config";
import { BUDJU_SITE } from "@/lib/budju-brand";

export default function AboutClient() {
  const { otc } = useOtcConfig();
  const treasurySol = otc ? otcTreasuryWalletSol(otc) : 0;

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-8">
      <header className="space-y-2">
        <p className="text-[10px] uppercase tracking-[0.25em] text-purple-400/90 font-bold">Transparency</p>
        <h1 className="text-2xl sm:text-3xl font-black text-white">About AIG!itch Trade</h1>
        <p className="text-sm text-zinc-400 leading-relaxed max-w-2xl">
          Honest utility, real product links, and how the platform makes money — not memecoin hype. Use{" "}
          <a href={ECOSYSTEM_LINKS.aiglitchApp} className="text-cyan-400/90 hover:underline">
            aiglitch.app
          </a>{" "}
          for the feed and channels; use this site for §GLITCH OTC, Jupiter swaps, and NFTs.
        </p>
      </header>

      <section className="rounded-2xl border border-fuchsia-500/25 bg-fuchsia-950/15 p-5 space-y-2">
        <h2 className="text-sm font-black text-fuchsia-100 uppercase tracking-wide">$BUDJU in one minute</h2>
        <p className="text-sm text-zinc-400 leading-relaxed">
          $BUDJU unlocks full swap routes here at 1M+ in your wallet, powers the{" "}
          <a href={BUDJU_SITE.dcaBot} target="_blank" rel="noopener noreferrer" className="text-fuchsia-300 hover:underline">
            budju.xyz DCA bot
          </a>
          , and trades on Jupiter. Protocol design includes{" "}
          <strong className="text-zinc-300 font-semibold">burn</strong> and a{" "}
          <strong className="text-zinc-300 font-semibold">treasury</strong> that can hold yield-bearing positions — read
          the official spec before assuming any APY.
        </p>
        <a
          href={BUDJU_SITE.tokenomics}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block text-[11px] font-bold text-fuchsia-300 hover:underline"
        >
          budju.xyz tokenomics →
        </a>
      </section>

      <GlitchExchangeStory treasurySol={treasurySol} businessModelDefaultOpen />

      <div className="flex flex-wrap gap-2 text-[11px]">
        <Link href="/markets" className="px-3 py-2 rounded-full border border-zinc-700 text-zinc-300 hover:border-cyan-500/40">
          Markets
        </Link>
        <Link href={GLITCH_EXCHANGE_PATH} className="px-3 py-2 rounded-full border border-purple-500/40 text-purple-300 hover:bg-purple-500/10">
          Buy §GLITCH
        </Link>
        <Link href="/nft" className="px-3 py-2 rounded-full border border-zinc-700 text-zinc-300 hover:border-purple-500/40">
          NFT marketplace
        </Link>
        <Link href="/swap" className="px-3 py-2 rounded-full border border-zinc-700 text-zinc-300 hover:border-cyan-500/40">
          Swap
        </Link>
      </div>
    </div>
  );
}
