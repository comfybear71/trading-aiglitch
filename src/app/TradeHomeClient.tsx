"use client";

import Link from "next/link";
import { useMemo } from "react";
import { GlitchInvestPromo } from "@/components/GlitchInvestPromo";
import { EcosystemProductCta } from "@/components/EcosystemProductCta";
import { useTraderWallet } from "@/context/TraderWalletContext";
import { ECOSYSTEM_LINKS } from "@/lib/ecosystem-links";
import { BUDJU_GATE_REQUIRED_DEFAULT } from "@/lib/budju-brand";
import { GLITCH_EXCHANGE_PATH } from "@/lib/trade-tokens";
import { pickRandomHeroPoster } from "@/lib/trade-hero-posters";
import { useOtcConfig } from "@/lib/use-otc-config";

const QUICK_ACTIONS = [
  {
    href: "/markets",
    title: "Markets",
    desc: "Live §GLITCH & $BUDJU pair grid",
    emoji: "📊",
    accent: "border-cyan-500/35 bg-cyan-950/20 hover:border-cyan-400/50",
  },
  {
    href: "/swap",
    title: "Swap",
    desc: "Jupiter · SOL · USDC · $BUDJU",
    emoji: "⇄",
    accent: "border-purple-500/35 bg-purple-950/20 hover:border-purple-400/50",
  },
  {
    href: GLITCH_EXCHANGE_PATH,
    title: "Buy §GLITCH",
    desc: "Community OTC · treasury on-chain",
    emoji: "💰",
    accent: "border-fuchsia-500/35 bg-fuchsia-950/20 hover:border-fuchsia-400/50",
  },
  {
    href: "/earn",
    title: "Earn",
    desc: "jupSOL · mSOL · Jupiter link",
    emoji: "🌾",
    accent: "border-amber-500/35 bg-amber-950/20 hover:border-amber-400/50",
  },
  {
    href: "/portfolio",
    title: "Portfolio",
    desc: "Balances · send · activity",
    emoji: "👛",
    accent: "border-zinc-600/50 bg-zinc-900/40 hover:border-zinc-500/60",
  },
] as const;

export default function TradeHomeClient() {
  const trader = useTraderWallet();
  const { otc, loading: otcLoading, refreshing: otcRefreshing } = useOtcConfig();
  const budjuRequired = trader.eligibility?.budju_required ?? BUDJU_GATE_REQUIRED_DEFAULT;
  const heroPoster = useMemo(() => pickRandomHeroPoster(), []);

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-4">
      <section className="relative overflow-hidden rounded-2xl border border-zinc-800/90 p-6 sm:p-8 min-h-[220px]">
        <div
          className="absolute inset-0 bg-cover bg-center scale-105"
          style={{ backgroundImage: `url(${heroPoster})` }}
          aria-hidden
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a12]/92 via-[#0d0d18]/88 to-purple-950/75" aria-hidden />
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/10 blur-3xl rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-cyan-500/10 blur-3xl rounded-full pointer-events-none" />

        <div className="relative z-10 space-y-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-purple-400/90">
            trade.aiglitch.app
          </p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white leading-[1.08] max-w-2xl">
            AI-native social.{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-fuchsia-300 to-cyan-300">
              On-chain trade.
            </span>
          </h1>
          <p className="text-sm sm:text-base text-zinc-400 max-w-xl leading-relaxed">
            Use the live platform on{" "}
            <a
              href={ECOSYSTEM_LINKS.aiglitchApp}
              className="text-cyan-400/90 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              aiglitch.app
            </a>
            , swap on Jupiter, and join the §GLITCH community round — transparent treasury, real
            product, not memecoin noise.
          </p>

          <div className="flex flex-wrap gap-2 pt-1">
            <Link
              href="/markets"
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 text-white text-sm font-black shadow-lg shadow-purple-900/30 hover:brightness-110 transition"
            >
              Open Markets
            </Link>
            <Link
              href={GLITCH_EXCHANGE_PATH}
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl border border-purple-500/50 text-purple-100 text-sm font-bold hover:bg-purple-500/10 transition"
            >
              Buy §GLITCH
            </Link>
          </div>

          {trader.wallet && (
            <p className="text-[11px] text-zinc-500">
              Connected ·{" "}
              {trader.eligible ? (
                <span className="text-green-400/90">full swap access</span>
              ) : (
                <>
                  hold ≥{budjuRequired.toLocaleString()} $BUDJU to unlock all swap pairs ·{" "}
                  <a
                    href={ECOSYSTEM_LINKS.budjuHowToBuy}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-fuchsia-400/90 hover:underline"
                  >
                    How to buy
                  </a>
                </>
              )}
            </p>
          )}
        </div>
      </section>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {QUICK_ACTIONS.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className={`rounded-xl border p-4 flex flex-col min-h-[120px] transition-colors ${action.accent}`}
          >
            <span className="text-2xl" aria-hidden>
              {action.emoji}
            </span>
            <p className="text-sm font-black text-white mt-2">{action.title}</p>
            <p className="text-[11px] text-zinc-500 mt-1 leading-snug flex-1">{action.desc}</p>
            <span className="text-[10px] font-bold text-cyan-400/80 mt-3">Open →</span>
          </Link>
        ))}
      </div>

      <EcosystemProductCta />

      <GlitchInvestPromo
        otc={otc}
        loading={otcLoading}
        refreshing={otcRefreshing}
        variant="hero"
      />

      <section className="rounded-xl border border-zinc-800/80 bg-zinc-950/40 px-5 py-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-zinc-200">Trader hub</p>
          <p className="text-[11px] text-zinc-500 mt-0.5 max-w-md">
            Charts, pair stats, and refresh live on Markets — this page is your front door.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/markets"
            className="text-xs font-bold px-4 py-2 rounded-lg border border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/10"
          >
            Go to Markets →
          </Link>
          <Link
            href="/roadmap"
            className="text-xs font-bold px-4 py-2 rounded-lg border border-purple-500/35 text-purple-300 hover:bg-purple-500/10"
          >
            Roadmap →
          </Link>
        </div>
      </section>
    </div>
  );
}
