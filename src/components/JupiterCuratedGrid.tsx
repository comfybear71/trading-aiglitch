"use client";

import Link from "next/link";
import { TokenIcon } from "@/components/TokenIcon";
import { fmtMarketUsd, swapHref } from "@/lib/market-pairs";
import type { TradeTokenMetaRow } from "@/lib/trade-token-meta";
import type { TradeTokenRow } from "@/lib/trade-tokens";

export interface CuratedMarketToken extends TradeTokenRow {
  priceUsd?: number;
  name?: string;
  iconUrl?: string | null;
  iconEmoji?: string;
}
function ListSkeleton() {
  return (
    <ul className="rounded-xl border border-zinc-800/90 divide-y divide-zinc-800/80 overflow-hidden">
      {Array.from({ length: 6 }, (_, i) => (
        <li key={i} className="px-4 py-3 h-14 bg-zinc-900/40 animate-pulse" />
      ))}
    </ul>
  );
}

export function JupiterCuratedGrid({
  tokens,
  loading,
  solPriceUsd,
  solMeta,
}: {
  tokens: CuratedMarketToken[];
  loading: boolean;
  solPriceUsd?: number;
  solMeta?: TradeTokenMetaRow;
}) {  if (loading && tokens.length === 0) {
    return <ListSkeleton />;
  }

  return (
    <ul className="rounded-xl border border-zinc-800/90 divide-y divide-zinc-800/80 overflow-hidden bg-zinc-950/30">
      <li className="px-4 py-3 flex flex-wrap items-center gap-3 gap-y-2 hover:bg-cyan-950/15 transition-colors">
        <TokenIcon
          symbol="SOL"
          iconUrl={solMeta?.iconUrl ?? "/tokens/sol.svg"}
          iconEmoji={solMeta?.iconEmoji ?? "◎"}
          size={32}
        />
        <div className="min-w-[120px] flex-1">          <p className="text-sm font-black text-white">SOL / USDC</p>
          <p className="text-[10px] text-zinc-500">Jupiter · SPL swap</p>
        </div>
        <p className="text-base font-black text-white tabular-nums sm:w-28 sm:text-right">
          {solPriceUsd != null && solPriceUsd > 0 ? fmtMarketUsd(solPriceUsd) : "—"}
        </p>
        <Link
          href={swapHref("SOL", "USDC")}
          className="ml-auto shrink-0 px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-600/85 to-purple-600/85 text-[11px] font-bold text-white hover:opacity-95"
        >
          Swap SOL ↔ USDC
        </Link>
      </li>

      {tokens.map((t) => {
        const quote = t.defaultQuote ?? "USDC";
        const href = swapHref(quote, t.symbol);
        return (
          <li
            key={t.symbol}
            className="px-4 py-3 flex flex-wrap items-center gap-3 gap-y-2 hover:bg-cyan-950/15 transition-colors"
          >
            <TokenIcon
              symbol={t.symbol}
              iconUrl={t.iconUrl}
              iconEmoji={t.iconEmoji}
              size={32}
            />
            <div className="min-w-[120px] flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-sm font-black text-white">{t.symbol}</p>                {t.yieldLst ? (
                  <span className="text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded border border-amber-500/40 text-amber-300/90">
                    Yield LST
                  </span>
                ) : null}
              </div>
              <p className="text-[10px] text-zinc-500">
                Jupiter · vs {quote}
                {t.yieldLst ? " · swap in/out (Earn UI later)" : " · 1M $BUDJU gate"}
              </p>
            </div>
            <p className="text-base font-black text-white tabular-nums sm:w-28 sm:text-right">
              {t.priceUsd != null && t.priceUsd > 0 ? fmtMarketUsd(t.priceUsd) : "—"}
            </p>
            <Link
              href={href}
              className="ml-auto shrink-0 px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-600/85 to-purple-600/85 text-[11px] font-bold text-white hover:opacity-95"
            >
              Swap → {t.symbol}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
