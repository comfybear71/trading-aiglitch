"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  activityKindMeta,
  activityLabel,
  activityMatchesFilter,
  fetchTradeActivity,
  formatActivityWhen,
  solscanTxUrl,
  type ActivityFilter,
  type TradeActivityItem,
} from "@/lib/trade-activity-api";

const FILTERS: { id: ActivityFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "swap", label: "Swaps" },
  { id: "send", label: "Sends" },
  { id: "magic", label: "Magic links" },
];

type Props = {
  wallet: string | null;
  /** Bump to refetch after a new tx */
  refreshKey?: number;
  compact?: boolean;
  emptyText?: string;
  /** Show filter chips + refresh (Portfolio activity tab) */
  showToolbar?: boolean;
};

export function TradeActivityPanel({
  wallet,
  refreshKey = 0,
  compact = false,
  emptyText = "No activity yet.",
  showToolbar = false,
}: Props) {
  const [items, setItems] = useState<TradeActivityItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<ActivityFilter>("all");

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

  const visible = useMemo(
    () => items.filter((a) => activityMatchesFilter(a.kind, filter)),
    [items, filter],
  );

  if (!wallet) {
    return <p className="text-sm text-zinc-600 text-center p-4">Connect wallet to see activity.</p>;
  }

  const toolbar = showToolbar && !compact && (
    <div className="px-4 py-2 border-b border-zinc-800 flex flex-wrap items-center justify-between gap-2">
      <div className="flex flex-wrap gap-1">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilter(f.id)}
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border transition-colors ${
              filter === f.id
                ? "border-cyan-500/50 text-cyan-200 bg-cyan-500/10"
                : "border-zinc-700 text-zinc-500 hover:text-zinc-300"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>
      <button
        type="button"
        onClick={() => void load()}
        disabled={loading}
        className="text-[10px] font-bold text-zinc-500 hover:text-cyan-400 disabled:opacity-50"
      >
        {loading ? "Refreshing…" : "Refresh"}
      </button>
    </div>
  );

  if (loading && items.length === 0) {
    return (
      <>
        {toolbar}
        <p className="text-sm text-zinc-500 text-center p-4">Loading activity…</p>
      </>
    );
  }

  if (error) {
    return (
      <>
        {toolbar}
        <p className="text-sm text-red-400/90 text-center p-4">
          {error}
          <button type="button" onClick={() => void load()} className="block mx-auto mt-2 text-cyan-500 text-xs">
            Retry
          </button>
        </p>
      </>
    );
  }

  if (items.length === 0) {
    return (
      <>
        {toolbar}
        <p className="text-sm text-zinc-600 text-center p-4">{emptyText}</p>
      </>
    );
  }

  if (visible.length === 0) {
    return (
      <>
        {toolbar}
        <p className="text-sm text-zinc-600 text-center p-4">No {filter === "all" ? "" : `${filter} `}events in this wallet yet.</p>
      </>
    );
  }

  return (
    <>
      {toolbar}
      {!compact && showToolbar && (
        <p className="px-4 py-1 text-[10px] text-zinc-600 border-b border-zinc-800/80">
          {visible.length} event{visible.length === 1 ? "" : "s"}
          {filter !== "all" ? ` · ${FILTERS.find((f) => f.id === filter)?.label}` : ""}
        </p>
      )}
      <ul className={`divide-y divide-zinc-800/80 overflow-y-auto ${compact ? "max-h-40" : "max-h-[28rem]"}`}>
        {visible.map((a) => {
          const meta = activityKindMeta(a.kind);
          return (
            <li key={a.id} className="px-4 py-2.5 flex items-start justify-between gap-3 text-sm">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-1.5 mb-0.5">
                  <span
                    className={`text-[9px] font-black uppercase px-1.5 py-0 rounded border ${meta.badgeClass}`}
                  >
                    {meta.label}
                  </span>
                  <span className="text-[10px] text-zinc-600">{formatActivityWhen(a.at)}</span>
                </div>
                <span className="text-zinc-300 block truncate">{activityLabel(a)}</span>
              </div>
              {a.signature ? (
                <a
                  href={solscanTxUrl(a.signature)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] text-cyan-500 hover:underline shrink-0 pt-1"
                >
                  Solscan
                </a>
              ) : null}
            </li>
          );
        })}
      </ul>
    </>
  );
}
