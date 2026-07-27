"use client";

import { useEffect, useState } from "react";
import { loadTradeTokenMetaOnce, type TradeTokenMetaRow } from "@/lib/trade-token-meta";

export function useTradeTokenMeta() {
  const [meta, setMeta] = useState<Record<string, TradeTokenMetaRow>>({});

  useEffect(() => {
    let cancelled = false;
    void loadTradeTokenMetaOnce().then((m) => {
      if (!cancelled) setMeta(m);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return meta;
}

export function metaForSymbol(
  meta: Record<string, TradeTokenMetaRow>,
  symbol: string,
): TradeTokenMetaRow | undefined {
  if (meta[symbol]) return meta[symbol];
  const upper = symbol.toUpperCase();
  if (meta[upper]) return meta[upper];
  const key = Object.keys(meta).find((k) => k.toUpperCase() === upper);
  return key ? meta[key] : undefined;
}
