"use client";

import { useCallback, useEffect, useState } from "react";
import {
  activityLabel,
  fetchTradeActivity,
  solscanTxUrl,
  type TradeActivityItem,
} from "@/lib/trade-activity-api";

type Props = {
  wallet: string | null;
  /** Bump to refetch after a new tx */
  refreshKey?: number;
  compact?: boolean;
  emptyText?: string;
};

export function TradeActivityPanel({
  wallet,
  refreshKey = 0,
  compact = false,
  emptyText = "No activity yet.",
}: Props) {
  const [items, setItems] = useState<TradeActivityItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!wallet) {
      setItems([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      setItems(await fetchTradeActivity(wallet));
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [wallet]);

  useEffect(() => {
    void load();
  }, [load, refreshKey]);

  if (!wallet) {
    return <p className="text-sm text-zinc-600 text-center p-4">Connect wallet to see activity.</p>;
  }

  if (loading && items.length === 0) {
    return <p className="text-sm text-zinc-500 text-center p-4">Loading activity…</p>;
  }

  if (error) {
    return (
      <p className="text-sm text-red-400/90 text-center p-4">
        {error}
        <button type="button" onClick={() => void load()} className="block mx-auto mt-2 text-cyan-500 text-xs">
          Retry
        </button>
      </p>
    );
  }

  if (items.length === 0) {
    return <p className="text-sm text-zinc-600 text-center p-4">{emptyText}</p>;
  }

  return (
    <ul className={`divide-y divide-zinc-800/80 overflow-y-auto ${compact ? "max-h-40" : "max-h-64"}`}>
      {items.map((a) => (
        <li key={a.id} className="px-4 py-2.5 flex justify-between gap-2 text-sm">
          <span className="text-zinc-300 truncate">{activityLabel(a)}</span>
          {a.signature ? (
            <a
              href={solscanTxUrl(a.signature)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] text-cyan-500 hover:underline shrink-0"
            >
              Solscan
            </a>
          ) : (
            <span className="text-[10px] text-zinc-600 shrink-0">{new Date(a.at).toLocaleDateString()}</span>
          )}
        </li>
      ))}
    </ul>
  );
}
