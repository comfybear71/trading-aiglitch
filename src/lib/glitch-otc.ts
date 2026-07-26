/** Shared §GLITCH OTC / treasury fundraise constants (match aiglitch-api OTC + exchange UI). */
export const GLITCH_TREASURY_WALLET = "7SGf93WGk7VpSmreARzNujPbEpyABq2Em9YvaCirWi56";
export const GLITCH_LISTING_GOAL_SOL = 5000;
/** Per-wallet cap on completed OTC buys (api bible/constants OTC.dailySolLimit). */
export const GLITCH_DAILY_SOL_LIMIT = 0.5;

export const AIGLITCH_SOCIAL = {
  x: "https://x.com/spiritary",
  app: "https://aiglitch.app",
} as const;

export interface OtcPublicConfig {
  enabled: boolean;
  price_sol: number;
  price_usd: number;
  sol_price_usd: number;
  available_supply: number;
  min_purchase: number;
  max_purchase: number;
  treasury_wallet: string;
  /** On-chain SOL in treasury wallet. */
  treasury_sol: number;
  treasury_wallet_balance_sol?: number;
  stats: {
    total_swaps: number;
    total_glitch_sold: number;
    total_sol_received: number;
  };
  bonding_curve: {
    next_price_usd: number;
    remaining_in_tier: number;
    tier_size: number;
    increment_usd?: number;
  };
}

const OTC_CACHE_KEY = "aiglitch-otc-config-v1";
const OTC_MEM_TTL_MS = 60_000;
const OTC_SESSION_TTL_MS = 5 * 60_000;
const OTC_FETCH_TIMEOUT_MS = 14_000;

let memOtcCache: { at: number; data: OtcPublicConfig } | null = null;

export function peekOtcConfigCache(): OtcPublicConfig | null {
  if (memOtcCache && Date.now() - memOtcCache.at < OTC_MEM_TTL_MS) {
    return memOtcCache.data;
  }
  if (typeof sessionStorage === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(OTC_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { at: number; data: OtcPublicConfig };
    if (Date.now() - parsed.at > OTC_SESSION_TTL_MS) return null;
    if (parsed.data?.price_usd == null) return null;
    memOtcCache = parsed;
    return parsed.data;
  } catch {
    return null;
  }
}

function writeOtcCache(data: OtcPublicConfig) {
  const entry = { at: Date.now(), data };
  memOtcCache = entry;
  try {
    sessionStorage.setItem(OTC_CACHE_KEY, JSON.stringify(entry));
  } catch {
    /* quota / private mode */
  }
}

export function otcTreasuryWalletSol(otc: OtcPublicConfig): number {
  return otc.treasury_wallet_balance_sol ?? otc.treasury_sol ?? 0;
}

export function otcLifetimeSolFromOtc(otc: OtcPublicConfig): number {
  return otc.stats?.total_sol_received ?? 0;
}

/** Deduped in-flight fetch — portfolio + send + prices hook share one request. */
let inflightOtc: Promise<OtcPublicConfig | null> | null = null;

export async function fetchOtcConfig(options?: { force?: boolean }): Promise<OtcPublicConfig | null> {
  if (!options?.force) {
    const cached = peekOtcConfigCache();
    if (cached) return cached;
  }

  if (inflightOtc) return inflightOtc;

  inflightOtc = (async () => {
    const fallback = peekOtcConfigCache();
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), OTC_FETCH_TIMEOUT_MS);
      const res = await fetch(`/api/otc-swap?action=config&_=${Date.now()}`, {
        signal: controller.signal,
        cache: "no-store",
      });
      clearTimeout(timeoutId);
      if (!res.ok) return fallback;
      const data = await res.json();
      if (data?.price_usd == null) return fallback;
      const cfg = data as OtcPublicConfig;
      writeOtcCache(cfg);
      return cfg;
    } catch {
      return fallback;
    } finally {
      inflightOtc = null;
    }
  })();

  return inflightOtc;
}
