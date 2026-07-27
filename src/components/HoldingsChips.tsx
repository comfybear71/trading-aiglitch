"use client";

import { TRADE_SEND_TOKENS } from "@/lib/trade-tokens";

const CHIP_SYMBOLS = TRADE_SEND_TOKENS.map((t) => t.symbol);

export function HoldingsChips({
  activeSymbol,
  onSelect,
  size = "md",
}: {
  activeSymbol?: string | null;
  onSelect?: (symbol: string) => void;
  size?: "sm" | "md";
}) {
  const pad = size === "sm" ? "px-2 py-1 text-[10px]" : "px-3 py-1.5 text-xs";

  return (
    <div className="flex flex-wrap gap-2">
      {CHIP_SYMBOLS.map((symbol) => {
        const active = activeSymbol === symbol;
        const inner = (
          <>
            <TokenDot symbol={symbol} />
            <span className="font-bold">{symbol}</span>
          </>
        );
        const className = `${pad} inline-flex items-center gap-1.5 rounded-full border transition-colors ${
          active
            ? "border-cyan-500/50 bg-cyan-500/10 text-cyan-200"
            : "border-zinc-700 bg-zinc-900/60 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200"
        }`;

        if (onSelect) {
          return (
            <button key={symbol} type="button" onClick={() => onSelect(symbol)} className={className}>
              {inner}
            </button>
          );
        }
        return (
          <span key={symbol} className={className}>
            {inner}
          </span>
        );
      })}
    </div>
  );
}

function TokenDot({ symbol }: { symbol: string }) {
  const colors: Record<string, string> = {
    SOL: "bg-gradient-to-br from-purple-500 to-cyan-400",
    USDC: "bg-blue-500",
    BUDJU: "bg-lime-500",
    GLITCH: "bg-purple-600",
  };
  return (
    <span
      className={`w-4 h-4 rounded-full shrink-0 ${colors[symbol] ?? "bg-zinc-600"}`}
      aria-hidden
    />
  );
}

export { CHIP_SYMBOLS as HOLDINGS_CHIP_SYMBOLS };
