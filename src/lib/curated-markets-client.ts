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

export async function fetchCuratedPrices(symbols: string[]): Promise<Record<string, number>> {
  if (symbols.length === 0) return {};
  try {
    const res = await fetch(
      `/api/trade/prices?symbols=${encodeURIComponent(symbols.join(","))}`,
      { cache: "no-store" },
    );
    const data = await res.json();
    return (data.prices ?? {}) as Record<string, number>;
  } catch {
    return {};
  }
}
