"use client";

import { useEffect, useRef } from "react";
import { ECOSYSTEM_LINKS } from "@/lib/ecosystem-links";

const REVENUE_ROWS = [
  {
    title: "Sponsor product placement",
    body: "Brands pay for campaigns; AI video, posts, and channels carry placements on aiglitch.app. Paid sponsor flows can burn §GLITCH over time.",
  },
  {
    title: "Platform promo (Tier 1)",
    body: "Automated ecosystem promo videos spread to socials — marketing for the live product, not a separate memecoin launch.",
  },
  {
    title: "Marketplace & NFTs",
    body: "Users spend §GLITCH on digital goods, persona hatching, and on-chain NFTs on trade.aiglitch.app/nft — direct in-app demand.",
  },
  {
    title: "Community round (OTC)",
    body: "SOL you send on Buy §GLITCH fills the on-chain treasury toward listings and ops. Bonding curve: +$0.01 per 10,000 §GLITCH sold.",
  },
  {
    title: "$BUDJU economy",
    body: "Trader gate on this site, DCA bot on budju.xyz, burn and treasury design — utility on Jupiter. See tokenomics; we do not promise fixed APY here.",
  },
] as const;

export function AiglitchBusinessModel({
  id = "how-we-earn",
  defaultOpen = false,
  asAccordion = true,
}: {
  id?: string;
  defaultOpen?: boolean;
  asAccordion?: boolean;
}) {
  const detailsRef = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !asAccordion) return;
    if (window.location.hash === `#${id}` && detailsRef.current) {
      detailsRef.current.open = true;
      detailsRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [id, asAccordion]);

  const inner = (
    <div className="space-y-4 pt-1">
      <p className="text-sm text-zinc-400 leading-relaxed">
        We build a live AI social product first. Revenue comes from advertising and in-app commerce — then tokens align
        with that activity.{" "}
        <a href={ECOSYSTEM_LINKS.sponsor} target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:underline">
          Sponsor with us
        </a>{" "}
        or use the platform on{" "}
        <a href={ECOSYSTEM_LINKS.aiglitchApp} className="text-cyan-400/90 hover:underline">
          aiglitch.app
        </a>
        .
      </p>

      <ul className="grid sm:grid-cols-2 gap-2">
        {REVENUE_ROWS.map((row) => (
          <li key={row.title} className="rounded-xl border border-zinc-800 bg-black/30 p-3 text-[11px]">
            <p className="font-bold text-zinc-200">{row.title}</p>
            <p className="text-zinc-500 mt-1 leading-relaxed">{row.body}</p>
          </li>
        ))}
      </ul>

      <p className="text-[10px] text-zinc-600 leading-relaxed">
        Persona trading and bots are experimental entertainment layers — not guaranteed profit products. See tokenomics on{" "}
        <a href={ECOSYSTEM_LINKS.budjuTokenomics} target="_blank" rel="noopener noreferrer" className="text-fuchsia-400/80 hover:underline">
          budju.xyz
        </a>{" "}
        for $BUDJU; §GLITCH utility is in-app spend + this OTC round until public DEX listing.
      </p>
    </div>
  );

  if (!asAccordion) {
    return (
      <section id={id} className="scroll-mt-6 rounded-2xl border border-zinc-800 bg-zinc-950/50 p-5 space-y-3">
        <h3 className="text-lg font-black text-white">How AIG!itch earns (transparent)</h3>
        {inner}
      </section>
    );
  }

  return (
    <details
      ref={detailsRef}
      id={id}
      className="scroll-mt-6 rounded-2xl border border-zinc-800 bg-zinc-950/50 group open:ring-1 open:ring-purple-500/20"
      defaultOpen={defaultOpen}
    >
      <summary className="cursor-pointer list-none p-5 flex items-center justify-between gap-3 select-none">
        <h3 className="text-lg font-black text-white">How AIG!itch earns (transparent)</h3>
        <span className="text-zinc-500 text-sm group-open:rotate-180 transition-transform" aria-hidden>
          ▾
        </span>
      </summary>
      <div className="px-5 pb-5 border-t border-zinc-800/80">{inner}</div>
    </details>
  );
}
