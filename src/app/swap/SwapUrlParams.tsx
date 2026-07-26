"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { JUPITER_SWAP_TOKENS, isJupiterSwapSymbol } from "@/lib/trade-tokens";

function normJupiter(raw: string | null): string | null {
  if (!raw) return null;
  const s = raw.trim().toUpperCase();
  return isJupiterSwapSymbol(s) ? s : null;
}

export type GlitchUrlHint = null | "buy" | "sell";

/** Apply ?sell= & ?buy= once; §GLITCH routes to OTC (not Jupiter). */
export function useSwapUrlParams(
  setInputSymbol: (s: string) => void,
  setOutputSymbol: (s: string) => void,
  setGlitchHint?: (h: GlitchUrlHint) => void,
) {
  const params = useSearchParams();

  useEffect(() => {
    const rawSell = (params.get("sell") ?? params.get("from"))?.trim().toUpperCase() ?? null;
    const rawBuy = (params.get("buy") ?? params.get("to"))?.trim().toUpperCase() ?? null;

    let hint: GlitchUrlHint = null;
    if (rawSell === "GLITCH") hint = "sell";
    else if (rawBuy === "GLITCH") hint = "buy";
    setGlitchHint?.(hint);

    const sell = normJupiter(params.get("sell")) ?? normJupiter(params.get("from"));
    const buy = normJupiter(params.get("buy")) ?? normJupiter(params.get("to"));

    if (sell) setInputSymbol(sell);
    if (buy && buy !== sell) setOutputSymbol(buy);
    else if (sell && !buy) {
      const other = JUPITER_SWAP_TOKENS.find((t) => t.symbol !== sell);
      if (other) setOutputSymbol(other.symbol);
    } else if (hint && !sell) {
      setInputSymbol("USDC");
      setOutputSymbol("SOL");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- one-shot URL hydrate
  }, [params]);
}
