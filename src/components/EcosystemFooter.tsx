"use client";

import Link from "next/link";
import { ECOSYSTEM_LINKS, SOCIAL_LINK_ROWS } from "@/lib/ecosystem-links";
import { GLITCH_EXCHANGE_PATH } from "@/lib/trade-tokens";

export function EcosystemFooter() {
  return (
    <footer className="mt-8 pt-6 border-t border-zinc-800/80 text-[11px] text-zinc-500 space-y-4 pb-6">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-purple-400/80">AIG!itch ecosystem</p>
        <p className="mt-1 text-zinc-400 leading-relaxed max-w-2xl">
          AI-native social + trade — not a memecoin pitch. Real product on{" "}
          <a href={ECOSYSTEM_LINKS.aiglitchApp} className="text-cyan-400/90 hover:underline">
            aiglitch.app
          </a>
          , community §GLITCH OTC here, $BUDJU on Jupiter.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {SOCIAL_LINK_ROWS.map((s) => (
          <a
            key={s.label}
            href={s.href}
            target="_blank"
            rel="noopener noreferrer"
            className="px-2.5 py-1 rounded-full border border-zinc-700/80 text-zinc-400 hover:border-purple-500/40 hover:text-purple-200 transition-colors"
          >
            {s.label}
          </a>
        ))}
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-1">
        <Link href={GLITCH_EXCHANGE_PATH} className="text-purple-400/90 hover:text-purple-300">
          Buy §GLITCH (OTC)
        </Link>
        <a href={ECOSYSTEM_LINKS.budjuBot} target="_blank" rel="noopener noreferrer" className="hover:text-fuchsia-300">
          $BUDJU bot
        </a>
        <a href={ECOSYSTEM_LINKS.sponsor} target="_blank" rel="noopener noreferrer" className="hover:text-zinc-300">
          Sponsor / ads
        </a>
        <Link href={`${GLITCH_EXCHANGE_PATH}#how-we-earn`} className="hover:text-zinc-300">
          How we earn
        </Link>
      </div>

      <p className="text-[10px] text-zinc-600 leading-relaxed max-w-3xl">
        Not financial advice. Token prices move; platform revenue does not guarantee returns. §GLITCH community round is
        buy-only until DEX listing; $BUDJU trades on open markets.
      </p>
    </footer>
  );
}
