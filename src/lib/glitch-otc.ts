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
  treasury_sol: number;
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

export async function fetchOtcConfig(): Promise<OtcPublicConfig | null> {
  try {
    const res = await fetch("/api/otc-swap?action=config");
    if (!res.ok) return null;
    const data = await res.json();
    if (data?.price_usd == null) return null;
    return data as OtcPublicConfig;
  } catch {
    return null;
  }
}
