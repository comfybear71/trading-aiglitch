import type { TradeEligibility } from "@/lib/trade-tokens";

const KEY: Record<string, keyof TradeEligibility["balances"]> = {
  SOL: "sol",
  BUDJU: "budju",
  USDC: "usdc",
  GLITCH: "glitch",
};

export function balanceForSymbol(
  eligibility: TradeEligibility | null | undefined,
  symbol: string,
): number {
  if (!eligibility?.balances) return 0;
  const k = KEY[symbol];
  return k ? eligibility.balances[k] : 0;
}

/** Human-readable amount for swap inputs (avoid float noise). */
export function formatSwapAmount(value: number, decimals: number): string {
  if (!Number.isFinite(value) || value <= 0) return "";
  const maxFrac = Math.min(decimals, 6);
  const s = value.toFixed(maxFrac);
  return s.replace(/\.?0+$/, "");
}

/** Leave a little SOL for fees when using MAX. */
export function maxPayAmount(symbol: string, balance: number): number {
  if (balance <= 0) return 0;
  if (symbol === "SOL") return Math.max(0, balance - 0.01);
  return balance;
}
