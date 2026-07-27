export type WalletTokenBalanceRow = {
  symbol: string;
  mint: string;
  decimals: number;
  amount: number;
};

export async function fetchWalletTokenBalances(
  wallet: string,
): Promise<WalletTokenBalanceRow[]> {
  const qs = new URLSearchParams({ wallet, _: String(Date.now()) });
  const res = await fetch(`/api/trade/wallet/balances?${qs}`, { cache: "no-store" });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Balance load failed");
  return (data.balances ?? []) as WalletTokenBalanceRow[];
}

/** Core lane symbols always listed first in portfolio / drawer. */
export const WALLET_CORE_SYMBOLS = ["USDC", "SOL", "BUDJU", "GLITCH"] as const;

const DUST: Record<string, number> = {
  BONK: 1,
  BUDJU: 0.01,
  GLITCH: 0.000_001,
};

export function balanceDustThreshold(symbol: string): number {
  return DUST[symbol] ?? 1e-8;
}

export function isMeaningfulBalance(symbol: string, amount: number): boolean {
  return amount > balanceDustThreshold(symbol);
}

export function amountForSymbol(
  rows: WalletTokenBalanceRow[] | null | undefined,
  symbol: string,
): number {
  if (!rows?.length) return 0;
  const row = rows.find((r) => r.symbol.toUpperCase() === symbol.toUpperCase());
  return row?.amount ?? 0;
}
