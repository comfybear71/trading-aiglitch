"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

/** External DEX reference lane only — §GLITCH uses platform OTC (see GlitchOtcPanel). */
const MARKET_PAIR_IDS = ["BUDJU_USDC"] as const;

const TREASURY_WALLET = "7SGf93WGk7VpSmreARzNujPbEpyABq2Em9YvaCirWi56";
const DEX_LISTING_TARGET_SOL = 5000;

type PairMeta = { id: string; label: string; base: string; quote: string };

interface MarketSnapshot {
  pairId: string;
  label: string;
  base: string;
  quote: string;
  accent: "purple" | "fuchsia" | "cyan";
  priceUsd: number;
  change24h: number;
  volume24h: number;
  marketCap: number;
  dataSource: string;
  error?: string;
}

interface OtcConfig {
  price_usd: number;
  price_sol: number;
  treasury_wallet: string;
  treasury_sol: number;
  bonding_curve: {
    next_price_usd: number;
    remaining_in_tier: number;
    tier_size: number;
  };
  stats: { total_glitch_sold: number };
}

function swapHref(sell: string, buy: string) {
  return `/swap?sell=${encodeURIComponent(sell)}&buy=${encodeURIComponent(buy)}`;
}

async function loadPair(meta: PairMeta): Promise<MarketSnapshot> {
  const accent = "fuchsia" as const;
  try {
    const res = await fetch(`/api/exchange?action=market&pair=${meta.id}`);
    const data = await res.json();
    if (!res.ok) {
      return {
        pairId: meta.id,
        label: meta.label,
        base: meta.base,
        quote: meta.quote,
        accent,
        priceUsd: 0,
        change24h: 0,
        volume24h: 0,
        marketCap: 0,
        dataSource: "none",
        error: data.error || "Unavailable",
      };
    }
    return {
      pairId: meta.id,
      label: meta.label,
      base: meta.base,
      quote: meta.quote,
      accent,
      priceUsd: Number(data.price_usd ?? data.priceUsd ?? 0),
      change24h: Number(data.change_24h ?? data.change24h ?? 0),
      volume24h: Number(data.volume_24h ?? data.volume24h ?? 0),
      marketCap: Number(data.market_cap ?? data.marketCap ?? 0),
      dataSource: String(data.data_source ?? data.dataSource ?? "unknown"),
    };
  } catch {
    return {
      pairId: meta.id,
      label: meta.label,
      base: meta.base,
      quote: meta.quote,
      accent,
      priceUsd: 0,
      change24h: 0,
      volume24h: 0,
      marketCap: 0,
      dataSource: "none",
      error: "Network error",
    };
  }
}

function fmtUsd(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1) return `$${n.toFixed(4)}`;
  if (n > 0) return `$${n.toFixed(6)}`;
  return "—";
}

function fmtPct(n: number) {
  const sign = n >= 0 ? "+" : "";
  return `${sign}${n.toFixed(2)}%`;
}

const ACCENT_BORDER = {
  fuchsia: "border-fuchsia-500/25 bg-fuchsia-950/10 hover:border-fuchsia-500/45",
  purple: "border-purple-500/25 bg-purple-950/10 hover:border-purple-500/45",
  cyan: "border-cyan-500/25 bg-cyan-950/10 hover:border-cyan-500/45",
} as const;

function GlitchOtcPanel({ otc }: { otc: OtcConfig | null }) {
  const treasurySol = otc?.treasury_sol ?? 0;
  const pct = Math.min(100, (treasurySol / DEX_LISTING_TARGET_SOL) * 100);

  return (
    <div className={`rounded-xl border p-4 ${ACCENT_BORDER.purple}`}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-xs font-bold text-gray-400">§GLITCH — platform market (on-chain OTC)</p>
          <p className="text-[10px] text-zinc-500 mt-0.5 max-w-md">
            We set price on our bonding curve — buy with SOL on{" "}
            <a
              href="https://aiglitch.app/exchange"
              className="text-purple-400 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              aiglitch.app/exchange
            </a>
            . <span className="text-zinc-400">Selling §GLITCH is not open yet.</span>
          </p>
        </div>
        <span className="text-[10px] font-bold text-amber-300/90 uppercase tracking-wide shrink-0">
          Buy / invest only
        </span>
      </div>

      {otc ? (
        <>
          <p className="text-2xl font-black text-white mt-2">${otc.price_usd.toFixed(2)}</p>
          <p className="text-[10px] text-zinc-500">{otc.price_sol.toFixed(8)} SOL per §GLITCH</p>
          <p className="text-[11px] text-gray-500 mt-2">
            Bonding curve: +$0.01 per 10,000 §GLITCH sold · next tier $
            {otc.bonding_curve.next_price_usd.toFixed(2)} in{" "}
            {otc.bonding_curve.remaining_in_tier.toLocaleString()} §GLITCH
          </p>

          <div className="mt-4 rounded-lg bg-gray-900/60 border border-gray-800 p-3">
            <p className="text-[10px] text-gray-500 mb-1">
              Help us raise SOL — treasury funds exchange listings, marketing, and bot-safe pool depth
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-black text-green-400">{treasurySol.toFixed(1)} SOL</span>
              <span className="text-gray-600 text-xs">/ {DEX_LISTING_TARGET_SOL.toLocaleString()} SOL</span>
            </div>
            <div className="h-2 bg-gray-800 rounded-full overflow-hidden mt-2">
              <div
                className="h-full bg-gradient-to-r from-green-500 to-cyan-400 rounded-full transition-all"
                style={{ width: `${pct}%` }}
              />
            </div>
            <p className="text-[9px] text-zinc-600 mt-1">
              {pct.toFixed(1)}% of {DEX_LISTING_TARGET_SOL.toLocaleString()} SOL goal — thin pools get robbed by bots if we
              list too early; your SOL backs promotion and a safer launch.
            </p>
            <a
              href={`https://solscan.io/account/${TREASURY_WALLET}`}
              className="text-[10px] text-cyan-500/80 hover:underline mt-2 inline-block font-mono"
              target="_blank"
              rel="noopener noreferrer"
            >
              Treasury {TREASURY_WALLET.slice(0, 4)}…{TREASURY_WALLET.slice(-4)}
            </a>
          </div>

          <a
            href="https://aiglitch.app/exchange"
            className="block w-full text-center py-2.5 mt-4 rounded-lg bg-gradient-to-r from-purple-600/80 to-cyan-600/80 text-[11px] font-bold text-white"
            target="_blank"
            rel="noopener noreferrer"
          >
            Invest in §GLITCH — buy with SOL
          </a>
          <p className="text-[10px] text-zinc-600 mt-2 text-center">
            Early supporters get the bonding-curve price before Raydium / Jupiter and broader promotion.
          </p>
        </>
      ) : (
        <p className="text-gray-500 text-sm mt-2">Loading §GLITCH OTC…</p>
      )}
    </div>
  );
}

export default function MarketsClient() {
  const [markets, setMarkets] = useState<MarketSnapshot[]>([]);
  const [otc, setOtc] = useState<OtcConfig | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const [pairsRes, otcRes] = await Promise.all([
        fetch("/api/exchange?action=pairs"),
        fetch("/api/otc-swap?action=config"),
      ]);
      const pairsData = await pairsRes.json();
      const otcData = otcRes.ok ? await otcRes.json() : null;
      if (otcData?.price_usd != null) setOtc(otcData as OtcConfig);

      const catalog: PairMeta[] = Array.isArray(pairsData.pairs) ? pairsData.pairs : [];
      const metas = MARKET_PAIR_IDS.map((id) => catalog.find((p) => p.id === id)).filter(
        (p): p is PairMeta => !!p,
      );
      const fallback: PairMeta[] = [
        { id: "BUDJU_USDC", label: "$BUDJU/USDC", base: "BUDJU", quote: "USDC" },
      ];
      const toLoad = metas.length > 0 ? metas : fallback;
      setMarkets(await Promise.all(toLoad.map(loadPair)));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <div className="rounded-2xl border border-purple-500/20 bg-gradient-to-br from-purple-950/30 via-black to-cyan-950/20 p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-fuchsia-400 to-cyan-400">
              Markets
            </h1>
            <p className="text-gray-400 text-sm mt-1 max-w-xl">
              <span className="text-purple-300">§GLITCH</span> is priced on our on-chain OTC bonding curve (
              <a
                href="https://aiglitch.app/exchange"
                className="text-purple-400 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                exchange
              </a>
              ). <span className="text-fuchsia-300">$BUDJU</span> and wallet swaps use Jupiter on{" "}
              <Link href="/swap" className="text-cyan-400 hover:underline">
                Swap
              </Link>
              . Bot treasury flows:{" "}
              <Link href="/ops" className="text-purple-400 hover:underline">
                Ops
              </Link>
              .
            </p>
          </div>
          <button
            type="button"
            onClick={() => void refresh()}
            disabled={loading}
            className="px-3 py-1.5 rounded-lg border border-zinc-700 text-xs text-zinc-400 hover:text-cyan-300 disabled:opacity-50"
          >
            Refresh
          </button>
        </div>
        <div className="flex flex-wrap gap-2 mt-4">
          {(["SOL", "USDC", "BUDJU"] as const).map((sym) => (
            <Link
              key={sym}
              href={swapHref(sym, sym === "USDC" ? "SOL" : "USDC")}
              className="text-[10px] font-bold px-2.5 py-1 rounded-full border border-zinc-700 text-zinc-400 hover:border-cyan-500/40 hover:text-cyan-300"
            >
              Swap {sym}
            </Link>
          ))}
          <a
            href="https://aiglitch.app/exchange"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] font-bold px-2.5 py-1 rounded-full border border-purple-500/40 text-purple-300 hover:border-purple-400"
          >
            Invest §GLITCH
          </a>
        </div>
      </div>

      <GlitchOtcPanel otc={otc} />

      {loading && markets.length === 0 ? (
        <p className="text-gray-500 text-sm">Loading $BUDJU reference…</p>
      ) : (
        <div className="grid sm:grid-cols-1 gap-3">
          {markets.map((m) => (
            <div
              key={m.pairId}
              className={`rounded-xl border p-4 transition-colors ${ACCENT_BORDER[m.accent]}`}
            >
              <p className="text-xs font-bold text-gray-400">{m.label} — external reference</p>
              {m.error ? (
                <p className="text-red-400 text-sm mt-2">{m.error}</p>
              ) : (
                <>
                  <p className="text-2xl font-black text-white mt-1">{fmtUsd(m.priceUsd)}</p>
                  <p className="text-[10px] text-zinc-500 mt-0.5">USD per {m.base} (DEX / API)</p>
                  <div className="flex flex-wrap gap-3 mt-2 text-[11px]">
                    <span className={m.change24h >= 0 ? "text-green-400" : "text-red-400"}>
                      24h {fmtPct(m.change24h)}
                    </span>
                    <span className="text-gray-500">Vol {fmtUsd(m.volume24h)}</span>
                    {m.marketCap > 0 && (
                      <span className="text-gray-500">MCap {fmtUsd(m.marketCap)}</span>
                    )}
                    <span className="text-gray-600 capitalize">via {m.dataSource}</span>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Link
                      href={swapHref(m.base, m.quote)}
                      className="flex-1 text-center py-2 rounded-lg bg-gradient-to-r from-purple-600/80 to-cyan-600/80 text-[11px] font-bold text-white"
                    >
                      Sell {m.base}
                    </Link>
                    <Link
                      href={swapHref(m.quote, m.base)}
                      className="flex-1 text-center py-2 rounded-lg border border-zinc-600 text-[11px] font-bold text-zinc-300 hover:border-cyan-500/40"
                    >
                      Buy {m.base}
                    </Link>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="rounded-xl border border-gray-800 bg-gray-900/40 p-4 text-sm text-gray-400 space-y-2">
        <p>
          <span className="text-purple-300 font-bold">§GLITCH — invest, do not sell (yet)</span> — purchases are buy-only on{" "}
          <a href="https://aiglitch.app/exchange" className="text-purple-400 hover:underline" target="_blank" rel="noopener noreferrer">
            aiglitch.app/exchange
          </a>
          . SOL goes to treasury{" "}
          <span className="font-mono text-[11px] text-zinc-500">{TREASURY_WALLET}</span> to hit{" "}
          <span className="text-zinc-300">{DEX_LISTING_TARGET_SOL.toLocaleString()} SOL</span>, fund listings and platform
          promotion, and avoid launching pools that sniper bots can empty.
        </p>
        <p>
          <span className="text-fuchsia-300 font-bold">$BUDJU</span> — hold{" "}
          <span className="text-zinc-300">1M+</span> on-chain to unlock Jupiter Swap (SOL / USDC / BUDJU lanes) on this app.
        </p>
        <p className="text-[11px] text-zinc-600 pt-1">
          Swap tab is for Jupiter routes — not §GLITCH exit liquidity. Limit / DCA on jup.ag (coming here later).
        </p>
      </div>
    </div>
  );
}
