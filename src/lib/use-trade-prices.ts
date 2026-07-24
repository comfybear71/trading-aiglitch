"use client";

import { useEffect, useState } from "react";

export type TradePrices = Partial<Record<"SOL" | "BUDJU" | "USDC" | "GLITCH", number>>;

export function useTradePrices(enabled = true) {
  const [prices, setPrices] = useState<TradePrices>({ USDC: 1 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/trade/prices?symbols=SOL,BUDJU,USDC,GLITCH");
        const data = await res.json();
        if (!cancelled && res.ok && data.prices) {
          setPrices({ USDC: 1, ...data.prices });
        }
      } catch {
        /* keep last / USDC default */
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [enabled]);

  return { prices, loading };
}

export function usdValue(amount: number, symbol: string, prices: TradePrices): number | null {
  const p = prices[symbol as keyof TradePrices];
  if (p == null || !Number.isFinite(amount)) return null;
  return amount * p;
}

export function fmtUsd(n: number | null) {
  if (n == null || !Number.isFinite(n)) return "—";
  if (n >= 1000) return `$${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
  return `$${n.toFixed(2)}`;
}
