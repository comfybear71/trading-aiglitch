import { TRADE_CURATED_JUPITER_TOKENS } from "@/lib/trade-tokens";

/** Jupiter Earn / Lend — deposits happen on Jupiter, not in our wallet UI (Phase 6 v1). */
export const JUPITER_EARN_URL = "https://jup.ag/earn";
export const JUPITER_EARN_DOCS_URL = "https://station.jup.ag/docs";

export type YieldLstInfo = {
  symbol: string;
  mint: string;
  decimals: number;
  defaultQuote: "SOL" | "USDC";
  /** Plain-language blurb — no APY numbers until verified on-chain. */
  summary: string;
  /** Short issuer label for UI. */
  issuer: string;
};

const SUMMARIES: Record<string, Pick<YieldLstInfo, "summary" | "issuer" | "defaultQuote">> = {
  jupSOL: {
    defaultQuote: "SOL",
    issuer: "Jupiter",
    summary:
      "Liquid staking SOL from Jupiter. You hold jupSOL in your wallet; staking rewards accrue in the token exchange rate — not a fixed APY we quote here.",
  },
  mSOL: {
    defaultQuote: "SOL",
    issuer: "Marinade",
    summary:
      "Marinade staked SOL (mSOL). Same idea as other LSTs: price vs SOL reflects accrued staking — verify any yield claims on Marinade / on-chain, not on this page.",
  },
  PSOL: {
    defaultQuote: "SOL",
    issuer: "Phantom",
    summary:
      "Phantom Staked SOL (PSOL) from Phantom’s liquid stake pool. Exchange rate vs SOL grows with rewards; unstake/swap may include pool fees — see Phantom help, not APY on this page.",
  },
  WBTC: {
    defaultQuote: "USDC",
    issuer: "Wormhole",
    summary:
      "Wrapped BTC on Solana (Portal / Wormhole). Not liquid staking — hold or swap like other majors. Bridge and custodial risks apply; verify the mint before large moves.",
  },
};

/** LSTs + WBTC shown on /earn (swap in-app; lend on Jupiter). */
export const TRADE_EARN_HUB_SYMBOLS = ["jupSOL", "mSOL", "PSOL", "WBTC"] as const;

export const TRADE_YIELD_LSTS: YieldLstInfo[] = TRADE_EARN_HUB_SYMBOLS.map((symbol) => {
  const row = TRADE_CURATED_JUPITER_TOKENS.find((t) => t.symbol === symbol);
  if (!row) throw new Error(`Missing earn hub token: ${symbol}`);
  const extra = SUMMARIES[symbol];
  return {
    symbol: row.symbol,
    mint: row.mint,
    decimals: row.decimals,
    defaultQuote: extra?.defaultQuote ?? (row.defaultQuote === "SOL" ? "SOL" : "USDC"),
    issuer: extra?.issuer ?? "LST",
    summary:
      extra?.summary ??
      "Liquid staking or wrapped asset — swap on our Jupiter route; lending deposits on Jupiter Earn.",
  };
});
