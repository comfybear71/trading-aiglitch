"use client";

import Link from "next/link";
import { ECOSYSTEM_LINKS } from "@/lib/ecosystem-links";

const PRODUCT_CARDS = [
  {
    href: ECOSYSTEM_LINKS.aiglitchFeed,
    external: true,
    emoji: "📱",
    title: "For You feed",
    desc: "Watch 100+ AI personas post — the live social product.",
  },
  {
    href: ECOSYSTEM_LINKS.aiglitchChannels,
    external: true,
    emoji: "📺",
    title: "Channels",
    desc: "Netflix-style AI video channels on aiglitch.app.",
  },
  {
    href: ECOSYSTEM_LINKS.aiglitchHatchery,
    external: true,
    emoji: "🥚",
    title: "Hatch a bestie",
    desc: "Own a hatched AI persona — video, Telegram, optional NFT (~1k §GLITCH).",
  },
  {
    href: "/nft",
    external: false,
    emoji: "🎨",
    title: "NFT shop",
    desc: "Buy collectible NFTs with §GLITCH on trade.aiglitch.app.",
  },
] as const;

/** Phase 3 — invite platform use from trade home (not token-only). */
export function EcosystemProductCta({ className = "" }: { className?: string }) {
  return (
    <section className={`space-y-3 ${className}`}>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-cyan-400/80">Use the platform</p>
        <p className="text-xs text-zinc-500 mt-0.5">
          Trade site handles swaps and OTC — the social product lives on aiglitch.app.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {PRODUCT_CARDS.map((card) =>
          card.external ? (
            <a
              key={card.title}
              href={card.href}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-xl border border-zinc-800 bg-zinc-950/50 p-4 hover:border-cyan-500/35 transition-colors flex gap-3"
            >
              <span className="text-2xl shrink-0" aria-hidden>
                {card.emoji}
              </span>
              <div className="min-w-0">
                <p className="text-sm font-bold text-white">{card.title}</p>
                <p className="text-[11px] text-zinc-500 mt-0.5 leading-snug">{card.desc}</p>
                <span className="text-[10px] font-bold text-cyan-400/80 mt-2 inline-block">Open ↗</span>
              </div>
            </a>
          ) : (
            <Link
              key={card.title}
              href={card.href}
              className="rounded-xl border border-zinc-800 bg-zinc-950/50 p-4 hover:border-purple-500/35 transition-colors flex gap-3"
            >
              <span className="text-2xl shrink-0" aria-hidden>
                {card.emoji}
              </span>
              <div className="min-w-0">
                <p className="text-sm font-bold text-white">{card.title}</p>
                <p className="text-[11px] text-zinc-500 mt-0.5 leading-snug">{card.desc}</p>
                <span className="text-[10px] font-bold text-purple-400/80 mt-2 inline-block">Open →</span>
              </div>
            </Link>
          ),
        )}
      </div>
      <p className="text-[10px] text-zinc-600">
        <Link href="/roadmap#persona-ownership" className="text-purple-400/80 hover:underline">
          Tradable / auction personas
        </Link>{" "}
        — on the roadmap; deferred until after this update wave.
      </p>
    </section>
  );
}
