"use client";

import { TokenIcon } from "@/components/TokenIcon";
import { parseSwapDetail } from "@/lib/swap-activity-display";
import { metaForSymbol } from "@/lib/use-trade-token-meta";
import { useTradeTokenMeta } from "@/lib/use-trade-token-meta";

export function SwapActivityLine({ detail, fallback }: { detail: string | null; fallback: string }) {
  const meta = useTradeTokenMeta();
  const parsed = parseSwapDetail(detail);
  if (!parsed) {
    return <span className="text-zinc-300 block truncate">{fallback}</span>;
  }

  const fromM = metaForSymbol(meta, parsed.fromSymbol);
  const toM = metaForSymbol(meta, parsed.toSymbol);

  return (
    <span className="text-zinc-300 flex flex-wrap items-center gap-1 min-w-0">
      <TokenIcon symbol={parsed.fromSymbol} iconUrl={fromM?.iconUrl} iconEmoji={fromM?.iconEmoji} size={18} />
      <span className="font-mono text-xs truncate">
        {parsed.fromAmount} {parsed.fromSymbol}
      </span>
      <span className="text-zinc-600 text-xs" aria-hidden>
        →
      </span>
      <TokenIcon symbol={parsed.toSymbol} iconUrl={toM?.iconUrl} iconEmoji={toM?.iconEmoji} size={18} />
      <span className="font-mono text-xs truncate">
        {parsed.toAmount} {parsed.toSymbol}
      </span>
    </span>
  );
}
