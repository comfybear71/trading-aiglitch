"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  JUPITER_SWAP_TOKENS,
  isJupiterSwapSymbol,
  normalizeTradeSymbol,
} from "@/lib/trade-tokens";

function normJupiter(raw: string | null): string | null {
  if (!raw) return null;
  const norm = normalizeTradeSymbol(raw);
  return isJupiterSwapSymbol(norm) ? norm : null;
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
    const rawSell = params.get("sell") ?? params.get("from");
    const rawBuy = params.get("buy") ?? params.get("to");
    const sellUpper = rawSell?.trim().toUpperCase() ?? null;
    const buyUpper = rawBuy?.trim().toUpperCase() ?? null;

    let hint: GlitchUrlHint = null;
    if (sellUpper === "GLITCH") hint = "sell";
    else if (buyUpper === "GLITCH") hint = "buy";
    setGlitchHint?.(hint);

    const sell = normJupiter(rawSell) ?? normJupiter(params.get("from"));
    const buy = normJupiter(rawBuy) ?? normJupiter(params.get("to"));

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
