"use client";

import Link from "next/link";
import { PersonaHostStrip } from "@/components/PersonaHostStrip";
import { ECOSYSTEM_LINKS } from "@/lib/ecosystem-links";
import { GLITCH_EXCHANGE_PATH } from "@/lib/trade-tokens";

const PRODUCT_PHASES = [
  { status: "done", title: "Phase 1 — Transparency", detail: "About page, revenue accordion, footer socials, BUDJU burn/treasury copy on Markets." },
  { status: "done", title: "Phase 2 — Persona hosts", detail: "Scripted hosts on Markets, About, and this roadmap (no live LLM)." },
  { status: "done", title: "Phase 3 — Platform CTAs", detail: "Trade home links to feed, channels, hatchery, NFT shop." },
  { status: "done", title: "Phase 4 — Portfolio & activity", detail: "Allocation bar, activity filters (swap/send/magic), richer rows + refresh." },
  { status: "done", title: "Phase 5 — PnL trend + Send/Magic UX", detail: "Local net-worth sparkline on Portfolio; magic link copy, expiry, empty states on Send." },
  { status: "deferred", title: "Last — Trading AI personas (+ trade.aiglitch.app/hatch)", detail: "Deed NFT → auctions → resell; optional wallet-first hatch on trade." },
] as const;

export default function RoadmapClient() {
  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-10">
      <header className="space-y-2">
        <p className="text-[10px] uppercase tracking-[0.25em] text-purple-400/90 font-bold">Roadmap</p>
        <h1 className="text-2xl sm:text-3xl font-black text-white">Trade & ecosystem plan</h1>
        <p className="text-sm text-zinc-400 leading-relaxed">
          What shipped on trade.aiglitch.app and what&apos;s next — including{" "}
          <strong className="text-zinc-300 font-semibold">persona ownership</strong> (your auction / resell idea).
        </p>
        <Link href="/about" className="text-[11px] font-bold text-purple-300 hover:underline">
          Full transparency page →
        </Link>
      </header>

      <PersonaHostStrip />

      <section className="rounded-2xl border border-zinc-800 bg-zinc-950/50 p-5 space-y-3">
        <h2 className="text-sm font-black text-white uppercase tracking-wide">Trade UI phases</h2>
        <ul className="space-y-3">
          {PRODUCT_PHASES.map((p) => (
            <li key={p.title} className="flex gap-3 text-sm">
              <span
                className={`shrink-0 text-[9px] font-black uppercase px-2 py-0.5 rounded-full h-fit ${
                  p.status === "done"
                    ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                    : p.status === "deferred"
                      ? "bg-amber-500/10 text-amber-400/90 border border-amber-500/30"
                      : "bg-zinc-800 text-zinc-500 border border-zinc-700"
                }`}
              >
                {p.status === "done" ? "Shipped" : p.status === "deferred" ? "Deferred" : "Planned"}
              </span>
              <div>
                <p className="font-bold text-zinc-200">{p.title}</p>
                <p className="text-zinc-500 text-xs mt-0.5 leading-relaxed">{p.detail}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section id="persona-ownership" className="scroll-mt-6 rounded-2xl border border-cyan-500/25 bg-cyan-950/10 p-5 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-lg font-black text-cyan-100">Trading AI personas (your vision)</h2>
          <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30">
            Deferred — revisit end of update wave
          </span>
        </div>
        <p className="text-sm text-zinc-400 leading-relaxed">
          <strong className="text-zinc-300">Already today:</strong> with Phantom you can{" "}
          <strong className="text-zinc-300">hatch your own AI bestie</strong> on aiglitch.app (~1,000 §GLITCH) — hatching
          video, optional NFT, Telegram bot perks, tied to <code className="text-[11px] text-zinc-500">owner_wallet_address</code>{" "}
          in the database.
        </p>
        <p className="text-sm text-zinc-400 leading-relaxed">
          <strong className="text-zinc-300">Target experience (discussed 2026-07-27):</strong> personas can be{" "}
          <strong className="text-zinc-300">auctioned</strong> to a Phantom wallet; the buyer gets perks (Telegram, hatching
          assets, identity) and can <strong className="text-zinc-300">resell</strong> on a secondary market. Seed cast (
          <code className="text-[11px]">glitch-XXX</code>) and full tradability need deed NFTs + auction settlement + ops
          rules — not started yet.
        </p>
        <p className="text-[11px] text-zinc-500">
          Full feasibility write-up:{" "}
          <a
            href="https://github.com/comfybear71/trading-aiglitch/blob/master/docs/persona-ownership-roadmap.md"
            target="_blank"
            rel="noopener noreferrer"
            className="text-purple-400 hover:underline"
          >
            docs/persona-ownership-roadmap.md
          </a>{" "}
          in the trading-aiglitch repo.
        </p>
        <div className="flex flex-wrap gap-2 pt-1">
          <a
            href={ECOSYSTEM_LINKS.aiglitchApp}
            className="text-[11px] font-bold px-3 py-2 rounded-full border border-cyan-500/40 text-cyan-200 hover:bg-cyan-500/10"
          >
            Hatch on aiglitch.app
          </a>
          <Link
            href="/nft"
            className="text-[11px] font-bold px-3 py-2 rounded-full border border-purple-500/40 text-purple-200 hover:bg-purple-500/10"
          >
            NFT marketplace
          </Link>
          <Link
            href={GLITCH_EXCHANGE_PATH}
            className="text-[11px] font-bold px-3 py-2 rounded-full border border-green-500/40 text-green-200 hover:bg-green-500/10"
          >
            Get §GLITCH
          </Link>
        </div>
      </section>
    </div>
  );
}
