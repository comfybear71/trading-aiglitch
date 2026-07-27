"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { SwapActivityLine } from "@/components/SwapActivityLine";
import { TokenIcon } from "@/components/TokenIcon";
import {
  fetchGlitchTransactionHistory,
  type GlitchHistoryEntry,
} from "@/lib/glitch-transaction-history";
import { formatActivityWhen, solscanTxUrl } from "@/lib/trade-activity-api";
import { metaForSymbol, useTradeTokenMeta } from "@/lib/use-trade-token-meta";

export function GlitchTransactionHistory({
  wallet,
  refreshKey = 0,
}: {
  wallet: string | null;
  refreshKey?: number;
}) {
  const meta = useTradeTokenMeta();
  const glitchMeta = metaForSymbol(meta, "GLITCH");
  const [rows, setRows] = useState<GlitchHistoryEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!wallet) {
      setRows([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      setRows(await fetchGlitchTransactionHistory(wallet));
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [wallet]);

  useEffect(() => {
    void load();
  }, [load, refreshKey]);

  if (!wallet) {
    return (
      <p className="text-sm text-zinc-600 text-center py-4">
        Connect wallet to see your §GLITCH activity.
      </p>
    );
  }

  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-950/40 overflow-hidden">
      <div className="px-4 py-3 border-b border-zinc-800 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <TokenIcon
            symbol="GLITCH"
            iconUrl={glitchMeta?.iconUrl}
            iconEmoji={glitchMeta?.iconEmoji}
            size={24}
          />
          <h2 className="text-xs font-black uppercase tracking-wide text-zinc-200">
            Your §GLITCH activity
          </h2>
        </div>
        <button
          type="button"
          onClick={() => void load()}
          disabled={loading}
          className="text-[10px] font-bold text-zinc-500 hover:text-green-400 disabled:opacity-50"
        >
          {loading ? "…" : "Refresh"}
        </button>
      </div>

      {loading && rows.length === 0 ? (
        <p className="text-sm text-zinc-500 text-center py-6">Loading…</p>
      ) : error ? (
        <p className="text-sm text-red-400/90 text-center py-6 px-4">{error}</p>
      ) : rows.length === 0 ? (
        <p className="text-sm text-zinc-600 text-center py-6 px-4 leading-relaxed">
          No §GLITCH transactions yet. OTC buys, sends, and magic links show here.
        </p>
      ) : (
        <ul className="divide-y divide-zinc-800/80 max-h-[min(70vh,24rem)] overflow-y-auto">
          {rows.map((r) => (
            <li key={r.id} className="px-4 py-3 flex items-start justify-between gap-3 text-sm">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-1.5 mb-1">
                  <span
                    className={`text-[9px] font-black uppercase px-1.5 py-0 rounded border ${r.badgeClass}`}
                  >
                    {r.badge}
                  </span>
                  <span className="text-[10px] text-zinc-600">{formatActivityWhen(r.at)}</span>
                </div>
                {r.swapDetail ? (
                  <SwapActivityLine detail={r.swapDetail} fallback={r.fallbackLabel} />
                ) : (
                  <span className="text-zinc-300 block truncate">{r.fallbackLabel}</span>
                )}
              </div>
              {r.signature ? (
                <a
                  href={solscanTxUrl(r.signature)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] text-green-500/90 hover:underline shrink-0 pt-1"
                >
                  Solscan
                </a>
              ) : null}
            </li>
          ))}
        </ul>
      )}

      <p className="px-4 py-2 text-[10px] text-zinc-600 border-t border-zinc-800/80">
        OTC purchases from this page · GLITCH sends &amp; magic links from{" "}
        <Link href="/send" className="text-cyan-500/80 hover:underline">
          Send
        </Link>
        . Full wallet history on{" "}
        <Link href="/portfolio" className="text-cyan-500/80 hover:underline">
          Portfolio
        </Link>
        .
      </p>
    </section>
  );
}
