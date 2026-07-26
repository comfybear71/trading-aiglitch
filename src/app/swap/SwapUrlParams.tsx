"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { TRADE_SWAP_TOKENS } from "@/lib/trade-tokens";

function norm(raw: string | null): string | null {
  if (!raw) return null;
  const s = raw.trim().toUpperCase();
  return TRADE_SWAP_TOKENS.some((t) => t.symbol === s) ? s : null;
}

/** Apply ?sell= & ?buy= (aliases from= / to=) once on mount. */
export function useSwapUrlParams(
  setInputSymbol: (s: string) => void,
  setOutputSymbol: (s: string) => void,
) {
  const params = useSearchParams();

  useEffect(() => {
    const sell = norm(params.get("sell")) ?? norm(params.get("from"));
    const buy = norm(params.get("buy")) ?? norm(params.get("to"));
    if (sell) setInputSymbol(sell);
    if (buy && buy !== sell) setOutputSymbol(buy);
    else if (sell && !buy) {
      const other = TRADE_SWAP_TOKENS.find((t) => t.symbol !== sell);
      if (other) setOutputSymbol(other.symbol);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- one-shot URL hydrate
  }, [params]);
}
