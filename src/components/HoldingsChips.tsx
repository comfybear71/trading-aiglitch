"use client";

import { TokenIcon } from "@/components/TokenIcon";
import { TRADE_SEND_TOKENS } from "@/lib/trade-tokens";
import { metaForSymbol, useTradeTokenMeta } from "@/lib/use-trade-token-meta";

const DEFAULT_CHIP_SYMBOLS = TRADE_SEND_TOKENS.map((t) => t.symbol);

export function HoldingsChips({
  activeSymbol,
  onSelect,
  size = "md",
  symbols,
  showAll = false,
}: {
  activeSymbol?: string | null;
  onSelect?: (symbol: string | null) => void;
  size?: "sm" | "md";
  /** Defaults to core send tokens; pass wallet majors + extras for full filter row. */
  symbols?: string[];
  showAll?: boolean;
}) {
  const meta = useTradeTokenMeta();
  const chipSymbols = symbols?.length ? symbols : DEFAULT_CHIP_SYMBOLS;
  const pad = size === "sm" ? "px-2 py-1 text-[10px]" : "px-3 py-1.5 text-xs";
  const iconSize = size === "sm" ? 16 : 18;

  const chipClass = (active: boolean) =>
    `${pad} inline-flex items-center gap-1.5 rounded-full border transition-colors ${
      active
        ? "border-cyan-500/50 bg-cyan-500/10 text-cyan-200"
        : "border-zinc-700 bg-zinc-900/60 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200"
    }`;

  return (
    <div className="flex flex-wrap gap-2">
      {showAll && onSelect && (
        <button
          type="button"
          onClick={() => onSelect(null)}
          className={chipClass(activeSymbol == null)}
        >
          <span className="font-bold">All</span>
        </button>
      )}
      {chipSymbols.map((symbol) => {
        const active = activeSymbol === symbol;
        const m = metaForSymbol(meta, symbol);
        const label =
          symbol === "GLITCH" ? "§GLITCH" : symbol === "BUDJU" ? "$BUDJU" : symbol;
        const inner = (
          <>
            <TokenIcon
              symbol={symbol}
              iconUrl={m?.iconUrl}
              iconEmoji={m?.iconEmoji}
              size={iconSize}
            />
            <span className="font-bold">{label}</span>
          </>
        );

        if (onSelect) {
          return (
            <button key={symbol} type="button" onClick={() => onSelect(symbol)} className={chipClass(active)}>
              {inner}
            </button>
          );
        }
        return (
          <span key={symbol} className={chipClass(active)}>
            {inner}
          </span>
        );
      })}
    </div>
  );
}

export { DEFAULT_CHIP_SYMBOLS as HOLDINGS_CHIP_SYMBOLS };
