"use client";

import Link from "next/link";
import { TokenIcon } from "@/components/TokenIcon";
import { GLITCH_EXCHANGE_PATH } from "@/lib/trade-tokens";
import { metaForSymbol } from "@/lib/use-trade-token-meta";
import type { TradeTokenMetaRow } from "@/lib/trade-token-meta";
import { fmtUsd } from "@/lib/use-trade-prices";

export function fmtTokenAmount(n: number, max = 6, compact?: boolean) {
  if (compact && n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  return n.toLocaleString(undefined, { maximumFractionDigits: max });
}

export function WalletHoldingRow({
  symbol,
  label,
  amount,
  decimals = 6,
  compact,
  usd,
  meta,
  tradeHref,
}: {
  symbol: string;
  label?: string;
  amount: number;
  decimals?: number;
  compact?: boolean;
  usd?: number | null;
  meta: Record<string, TradeTokenMetaRow>;
  tradeHref?: string;
}) {
  const m = metaForSymbol(meta, symbol);
  const displayLabel = label ?? (symbol === "GLITCH" ? "§GLITCH" : symbol === "BUDJU" ? "$BUDJU" : symbol);
  const href =
    tradeHref ??
    (symbol === "GLITCH" ? GLITCH_EXCHANGE_PATH : `/swap?sell=${encodeURIComponent(symbol)}`);

  return (
    <li className="flex justify-between items-center py-2 border-b border-zinc-800/80 last:border-0 gap-3">
      <div className="flex items-center gap-2.5 min-w-0">
        <TokenIcon
          symbol={symbol}
          iconUrl={m?.iconUrl}
          iconEmoji={m?.iconEmoji}
          size={28}
        />
        <span className="text-zinc-300 font-medium truncate">{displayLabel}</span>
      </div>
      <div className="text-right shrink-0">
        <span className="text-zinc-400 font-mono text-xs block">
          {fmtTokenAmount(amount, decimals, compact)} {symbol}
        </span>
        {usd != null && Number.isFinite(usd) && amount > 0 && (
          <span className="text-[10px] text-zinc-500">{fmtUsd(usd)}</span>
        )}
        {amount > 0 && symbol !== "USDC" ? (
          <Link href={href} className="text-[10px] text-cyan-500/80 hover:text-cyan-400 mt-0.5 inline-block">
            Trade
          </Link>
        ) : null}
      </div>
    </li>
  );
}
