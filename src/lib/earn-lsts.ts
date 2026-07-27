import { TRADE_CURATED_JUPITER_TOKENS } from "@/lib/trade-tokens";

/** Jupiter Earn / Lend — deposits happen on Jupiter, not in our wallet UI (Phase 6 v1). */
export const JUPITER_EARN_URL = "https://jup.ag/earn";
export const JUPITER_EARN_DOCS_URL = "https://station.jup.ag/docs";

export type YieldLstInfo = {
  symbol: string;
  mint: string;
  decimals: number;
  defaultQuote: "SOL";
  /** Plain-language blurb — no APY numbers until verified on-chain. */
  summary: string;
  /** Short issuer label for UI. */
  issuer: string;
};

export const TRADE_YIELD_LSTS: YieldLstInfo[] = TRADE_CURATED_JUPITER_TOKENS.filter(
  (t) => t.yieldLst,
).map((t) => {
  if (t.symbol === "jupSOL") {
    return {
      symbol: t.symbol,
      mint: t.mint,
      decimals: t.decimals,
      defaultQuote: "SOL" as const,
      issuer: "Jupiter",
      summary:
        "Liquid staking SOL from Jupiter. You hold jupSOL in your wallet; staking rewards accrue in the token exchange rate — not a fixed APY we quote here.",
    };
  }
  if (t.symbol === "mSOL") {
    return {
      symbol: t.symbol,
      mint: t.mint,
      decimals: t.decimals,
      defaultQuote: "SOL" as const,
      issuer: "Marinade",
      summary:
        "Marinade staked SOL (mSOL). Same idea as other LSTs: price vs SOL reflects accrued staking — verify any yield claims on Marinade / on-chain, not on this page.",
    };
  }
  return {
    symbol: t.symbol,
    mint: t.mint,
    decimals: t.decimals,
    defaultQuote: "SOL" as const,
    issuer: "LST",
    summary: "Liquid staking token — swap on our Jupiter route; lending deposits on Jupiter Earn.",
  };
});
