import { GLITCH_EXCHANGE_PATH, isJupiterSwapSymbol } from "@/lib/trade-tokens";
import { GLITCH_LISTING_GOAL_SOL as GOAL } from "@/lib/glitch-otc";

export type PairMeta = { id: string; label: string; base: string; quote: string };

export type PairAccent = "fuchsia" | "purple" | "cyan";

export interface MarketSnapshot {
  pairId: string;
  label: string;
  base: string;
  quote: string;
  baseIcon: string;
  quoteIcon: string;
  accent: PairAccent;
  priceUsd: number;
  change24h: number;
  volume24h: number;
  marketCap: number;
  liquidityUsd: number;
  holderCount: number | null;
  dataSource: string;
  dexName: string;
  error?: string;
}

export interface PairAction {
  href: string;
  label: string;
  variant: "primary" | "secondary";
}

export interface GlitchPairUiMeta {
  subtitle: string;
  featuredOtc?: boolean;
}

const FALLBACK_PAIRS: PairMeta[] = [
  { id: "GLITCH_USDC", label: "§GLITCH/USDC", base: "GLITCH", quote: "USDC" },
  { id: "GLITCH_SOL", label: "§GLITCH/SOL", base: "GLITCH", quote: "SOL" },
  { id: "BUDJU_USDC", label: "$BUDJU/USDC", base: "BUDJU", quote: "USDC" },
  { id: "BUDJU_SOL", label: "$BUDJU/SOL", base: "BUDJU", quote: "SOL" },
  { id: "GLITCH_BUDJU", label: "§GLITCH/$BUDJU", base: "GLITCH", quote: "BUDJU" },
];

export function swapHref(sell: string, buy: string) {
  return `/swap?sell=${encodeURIComponent(sell)}&buy=${encodeURIComponent(buy)}`;
}

export function pairAccent(base: string, quote: string): PairAccent {
  if (base === "BUDJU" || quote === "BUDJU") return "fuchsia";
  if (base === "GLITCH" || quote === "GLITCH") return "purple";
  return "cyan";
}

/** §GLITCH pair cards show reference quotes; OTC checkout is SOL-only until treasury goal. */
export function glitchPairUiMeta(base: string, quote: string): GlitchPairUiMeta | null {
  const hasGlitch = base === "GLITCH" || quote === "GLITCH";
  if (!hasGlitch) return null;
  const goal = GOAL;
  if (base === "GLITCH" && quote === "SOL") {
    return {
      featuredOtc: true,
      subtitle: `Checkout: SOL only · treasury goal ${goal.toLocaleString()} SOL`,
    };
  }
  return {
    subtitle: `Reference price · buy §GLITCH with SOL only (${goal.toLocaleString()} SOL roadmap)`,
  };
}

export function pairActions(base: string, quote: string): PairAction[] {
  const glitchMeta = glitchPairUiMeta(base, quote);
  if (glitchMeta) {
    const actions: PairAction[] = [
      { href: GLITCH_EXCHANGE_PATH, label: "Buy with SOL", variant: "primary" },
    ];
    if (base === "BUDJU" || quote === "BUDJU") {
      actions.push({
        href: swapHref("BUDJU", "USDC"),
        label: "Swap $BUDJU (not §GLITCH)",
        variant: "secondary",
      });
    }
    return actions;
  }

  if (isJupiterSwapSymbol(base) && isJupiterSwapSymbol(quote)) {
    return [{ href: swapHref(base, quote), label: "Swap", variant: "primary" }];
  }

  return [{ href: "/swap", label: "Open Swap", variant: "primary" }];
}

export async function fetchPairCatalog(): Promise<PairMeta[]> {
  try {
    const res = await fetch("/api/exchange?action=pairs");
    const data = await res.json();
    const catalog: PairMeta[] = Array.isArray(data.pairs) ? data.pairs : [];
    return catalog.length > 0 ? catalog : FALLBACK_PAIRS;
  } catch {
    return FALLBACK_PAIRS;
  }
}

export async function fetchMarketSnapshot(meta: PairMeta): Promise<MarketSnapshot> {
  const base = {
    pairId: meta.id,
    label: meta.label,
    base: meta.base,
    quote: meta.quote,
    baseIcon: "",
    quoteIcon: "",
    accent: pairAccent(meta.base, meta.quote),
    priceUsd: 0,
    change24h: 0,
    volume24h: 0,
    marketCap: 0,
    liquidityUsd: 0,
    holderCount: null as number | null,
    dataSource: "none",
    dexName: "",
  };

  try {
    const res = await fetch(`/api/exchange?action=market&pair=${meta.id}`);
    const data = await res.json();
    if (!res.ok) {
      return { ...base, error: data.error || "Unavailable" };
    }
    const rawHolder = data.holder_count ?? data.holderCount;
    return {
      ...base,
      baseIcon: String(data.base_icon ?? data.baseIcon ?? ""),
      quoteIcon: String(data.quote_icon ?? data.quoteIcon ?? ""),
      priceUsd: Number(data.price_usd ?? data.priceUsd ?? 0),
      change24h: Number(data.change_24h ?? data.change24h ?? 0),
      volume24h: Number(data.volume_24h ?? data.volume24h ?? 0),
      marketCap: Number(data.market_cap ?? data.marketCap ?? 0),
      liquidityUsd: Number(data.liquidity_usd ?? data.liquidityUsd ?? 0),
      holderCount:
        rawHolder != null && Number.isFinite(Number(rawHolder)) ? Number(rawHolder) : null,
      dataSource: String(data.data_source ?? data.dataSource ?? "unknown"),
      dexName: String(data.dex_name ?? data.dexName ?? ""),
    };
  } catch {
    return { ...base, error: "Network error" };
  }
}

export function fmtMarketUsd(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
  if (n >= 1) return `$${n.toFixed(4)}`;
  if (n > 0) return `$${n.toFixed(6)}`;
  return "—";
}

export function fmtMarketPct(n: number) {
  const sign = n >= 0 ? "+" : "";
  return `${sign}${n.toFixed(2)}%`;
}

export function fmtMarketVol(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M vol`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K vol`;
  if (n > 0) return `$${n.toFixed(0)} vol`;
  return "— vol";
}

export function accentCardClass(accent: PairAccent): string {
  switch (accent) {
    case "fuchsia":
      return "border-fuchsia-500/30 bg-fuchsia-950/15 hover:border-fuchsia-400/45";
    case "purple":
      return "border-purple-500/30 bg-purple-950/15 hover:border-purple-400/45";
    default:
      return "border-cyan-500/25 bg-cyan-950/10 hover:border-cyan-400/40";
  }
}
