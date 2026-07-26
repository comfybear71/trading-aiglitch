"use client";

import { useEffect, useState } from "react";
import { fetchOtcConfig } from "@/lib/glitch-otc";

export type TradePrices = Partial<Record<"SOL" | "BUDJU" | "USDC" | "GLITCH", number>>;

export function useTradePrices(enabled = true) {
  const [prices, setPrices] = useState<TradePrices>({ USDC: 1 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    (async () => {
      try {
        const [priceRes, otc] = await Promise.all([
          fetch("/api/trade/prices?symbols=SOL,BUDJU,USDC,GLITCH", { cache: "no-store" }),
          fetchOtcConfig(),
        ]);
        const data = await priceRes.json();
        const merged: TradePrices = { USDC: 1 };
        if (priceRes.ok && data.prices) {
          Object.assign(merged, data.prices);
        }
        if (otc?.price_usd != null && Number.isFinite(otc.price_usd)) {
          merged.GLITCH = otc.price_usd;
        }
        if (!cancelled) setPrices(merged);
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

export function fmtGlitchUnitUsd(price: number | null | undefined) {
  if (price == null || !Number.isFinite(price)) return null;
  return `$${price.toFixed(2)} OTC`;
}
