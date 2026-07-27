/** Mainnet mints — keep in sync with aiglitch-api src/lib/trade/curated-markets.ts */
export const SOL_MINT = "So11111111111111111111111111111111111111112";
/** Circle USDC on Solana devnet (magic link v1) */
export const DEVNET_USDC_MINT = "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU";
export const USDC_MINT =
  process.env.NEXT_PUBLIC_SOLANA_NETWORK === "devnet"
    ? DEVNET_USDC_MINT
    : "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";
export const BUDJU_MINT = "2ajYe8eh8btUZRpaZ1v7ewWDkcYJmVGvPuDTU5xrpump";
export const GLITCH_MINT = "5hfHCmaL6e9bvruy35RQyghMXseTE2mXJ7ukqKAcS8fT";

export type TradeTokenRow = {
  symbol: string;
  mint: string;
  decimals: number;
  defaultQuote?: "USDC" | "SOL";
  yieldLst?: boolean;
};

export const TRADE_CORE_TOKENS: TradeTokenRow[] = [
  { symbol: "SOL", mint: SOL_MINT, decimals: 9, defaultQuote: "USDC" },
  { symbol: "USDC", mint: USDC_MINT, decimals: 6, defaultQuote: "SOL" },
  { symbol: "BUDJU", mint: BUDJU_MINT, decimals: 6, defaultQuote: "USDC" },
  { symbol: "GLITCH", mint: GLITCH_MINT, decimals: 9, defaultQuote: "USDC" },
];

/** Curated Jupiter majors + LSTs (Phase 1). */
export const TRADE_CURATED_JUPITER_TOKENS: TradeTokenRow[] = [
  {
    symbol: "JUP",
    mint: "JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN",
    decimals: 6,
    defaultQuote: "USDC",
  },
  {
    symbol: "WIF",
    mint: "EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm",
    decimals: 6,
    defaultQuote: "USDC",
  },
  {
    symbol: "BONK",
    mint: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
    decimals: 5,
    defaultQuote: "USDC",
  },
  {
    symbol: "RAY",
    mint: "4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R",
    decimals: 6,
    defaultQuote: "USDC",
  },
  {
    symbol: "PYTH",
    mint: "HZ1JovNiVvGrGNiiYvEozEVgZ58xaU3RKwX8eACQBCt3",
    decimals: 6,
    defaultQuote: "USDC",
  },
  {
    symbol: "jupSOL",
    mint: "jupSoLaHXQiZZTSfEWMTRRgpnyFm8f6sZdosWBjx93v",
    decimals: 9,
    defaultQuote: "SOL",
    yieldLst: true,
  },
  {
    symbol: "mSOL",
    mint: "mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So",
    decimals: 9,
    defaultQuote: "SOL",
    yieldLst: true,
  },
];

export const TRADE_SWAP_TOKENS: TradeTokenRow[] = [
  ...TRADE_CORE_TOKENS,
  ...TRADE_CURATED_JUPITER_TOKENS,
];

/** Send / magic link — core lane only in v1. */
export const TRADE_SEND_TOKENS = TRADE_CORE_TOKENS;

/** Jupiter lane only — §GLITCH is OTC on trade.aiglitch.app/glitch (not on Jupiter). */
export const JUPITER_SWAP_TOKENS = TRADE_SWAP_TOKENS.filter((t) => t.symbol !== "GLITCH");

/** Canonical §GLITCH OTC buy */
export const GLITCH_EXCHANGE_PATH = "/glitch";
export const GLITCH_EXCHANGE_URL = "https://trade.aiglitch.app/glitch";

export function normalizeTradeSymbol(symbol: string): string {
  const upper = symbol.trim().toUpperCase();
  const row = TRADE_SWAP_TOKENS.find((t) => t.symbol.toUpperCase() === upper);
  return row?.symbol ?? symbol.trim();
}

export function getTradeToken(symbol: string): TradeTokenRow {
  const norm = normalizeTradeSymbol(symbol);
  const row = TRADE_SWAP_TOKENS.find((t) => t.symbol === norm);
  if (!row) throw new Error(`Token not enabled: ${symbol}`);
  return row;
}

export function isJupiterSwapSymbol(symbol: string): boolean {
  const norm = normalizeTradeSymbol(symbol);
  return JUPITER_SWAP_TOKENS.some((t) => t.symbol === norm);
}

export const TRADER_WALLET_STORAGE_KEY = "aiglitch-trade-wallet";

export interface TradeEligibility {
  wallet: string;
  eligible: boolean;
  budju_balance: number;
  budju_required: number;
  budju_shortfall: number;
  helius_enabled: boolean;
  balances: {
    sol: number;
    glitch: number;
    budju: number;
    usdc: number;
  };
}
