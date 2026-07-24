/** Mainnet mints — keep in sync with aiglitch-api TRADE_ALLOWED_MINTS */
export const SOL_MINT = "So11111111111111111111111111111111111111112";
export const USDC_MINT = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";
export const BUDJU_MINT = "2ajYe8eh8btUZRpaZ1v7ewWDkcYJmVGvPuDTU5xrpump";
export const GLITCH_MINT = "5hfHCmaL6e9bvruy35RQyghMXseTE2mXJ7ukqKAcS8fT";

export const TRADE_SWAP_TOKENS = [
  { symbol: "SOL", mint: SOL_MINT, decimals: 9 },
  { symbol: "USDC", mint: USDC_MINT, decimals: 6 },
  { symbol: "BUDJU", mint: BUDJU_MINT, decimals: 6 },
  { symbol: "GLITCH", mint: GLITCH_MINT, decimals: 9 },
] as const;

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
