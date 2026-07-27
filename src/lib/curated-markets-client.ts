import type { TradeTokenRow } from "@/lib/trade-tokens";

export interface CuratedMarketsResponse {
  tokens: Array<
    TradeTokenRow & {
      defaultQuote: "USDC" | "SOL";
      yieldLst: boolean;
    }
  >;
  otc: {
    paymentAssets: string[];
    treasuryListingGoalSol: number;
    note: string;
  };
}

export async function fetchCuratedMarkets(): Promise<CuratedMarketsResponse | null> {
  try {
    const res = await fetch("/api/trade/markets/curated", { cache: "no-store" });
    if (!res.ok) return null;
    return (await res.json()) as CuratedMarketsResponse;
  } catch {
    return null;
  }
}

async function fetchPriceBatch(symbols: string[]): Promise<Record<string, number>> {
  const res = await fetch(
    `/api/trade/prices?symbols=${encodeURIComponent(symbols.join(","))}`,
    { cache: "no-store" },
  );
  const data = await res.json();
  return (data.prices ?? {}) as Record<string, number>;
}

export async function fetchCuratedPrices(symbols: string[]): Promise<Record<string, number>> {
  if (symbols.length === 0) return {};
  try {
    const unique = [...new Set(symbols)];
    const prices = await fetchPriceBatch(unique);
    const missing = unique.filter((s) => prices[s] == null || prices[s] <= 0);
    await Promise.all(
      missing.map(async (sym) => {
        try {
          const one = await fetchPriceBatch([sym]);
          if (one[sym] != null && one[sym] > 0) prices[sym] = one[sym];
        } catch {
          /* ignore per-symbol failure */
        }
      }),
    );
    return prices;
  } catch {
    return {};
  }
}
