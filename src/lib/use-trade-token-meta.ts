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
  return meta[symbol] ?? meta[symbol.toUpperCase()];
}
