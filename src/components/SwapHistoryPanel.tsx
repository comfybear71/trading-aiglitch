"use client";

import { useCallback, useEffect, useState } from "react";
import { useTraderWallet } from "@/context/TraderWalletContext";
import {
  fetchTradeActivity,
  solscanTxUrl,
  type TradeActivityItem,
} from "@/lib/trade-activity-api";

function relTime(iso: string) {
  const d = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(d / 60_000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 48) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export function SwapHistoryPanelKeyed({ refreshKey }: { refreshKey: number }) {
  const trader = useTraderWallet();
  const [rows, setRows] = useState<TradeActivityItem[]>([]);

  const load = useCallback(async () => {
    if (!trader.wallet) {
      setRows([]);
      return;
    }
    try {
      const all = await fetchTradeActivity(trader.wallet);
      setRows(all.filter((a) => a.kind === "swap"));
    } catch {
      setRows([]);
    }
  }, [trader.wallet]);

  useEffect(() => {
    void load();
  }, [load, refreshKey]);

  return (
    <div className="rounded-2xl border border-zinc-800 bg-[#12121a] overflow-hidden">
      <div className="px-4 py-2 border-b border-zinc-800 text-xs text-zinc-500 font-semibold uppercase tracking-wider">
        Swap history
      </div>
      {rows.length === 0 ? (
        <p className="p-6 text-center text-sm text-zinc-600">No swaps recorded yet.</p>
      ) : (
        <ul className="divide-y divide-zinc-800/80 max-h-[360px] overflow-y-auto">
          {rows.map((r) => (
            <li key={r.id} className="px-4 py-3 flex items-center justify-between gap-2 text-sm">
              <div>
                <p className="text-zinc-200 font-medium">{r.detail ?? "Swap"}</p>
                <p className="text-[10px] text-zinc-600 mt-0.5">{relTime(r.at)}</p>
              </div>
              {r.signature && (
                <a
                  href={solscanTxUrl(r.signature)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] text-cyan-500 hover:underline shrink-0"
                >
                  Solscan
                </a>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
