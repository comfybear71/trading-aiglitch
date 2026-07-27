import {
  activityInvolvesGlitch,
  activityKindMeta,
  activityLabel,
  fetchTradeActivity,
  type TradeActivityItem,
} from "@/lib/trade-activity-api";

export type OtcGlitchSwapRow = {
  id: string;
  glitch_amount: number;
  sol_cost: number;
  price_per_glitch?: number;
  tx_signature: string | null;
  status: string;
  created_at: string;
  completed_at: string | null;
};

export type GlitchHistoryEntry = {
  id: string;
  at: string;
  badge: string;
  badgeClass: string;
  /** Swap-style detail for icon row, or null for plain label */
  swapDetail: string | null;
  fallbackLabel: string;
  signature: string | null;
};

export async function fetchOtcGlitchHistory(wallet: string): Promise<OtcGlitchSwapRow[]> {
  const res = await fetch(
    `/api/otc-swap?action=history&wallet=${encodeURIComponent(wallet)}`,
    { cache: "no-store" },
  );
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "OTC history failed");
  return (data.swaps ?? []) as OtcGlitchSwapRow[];
}

function otcToEntry(row: OtcGlitchSwapRow): GlitchHistoryEntry {
  const sol = Number(row.sol_cost);
  const glitch = Number(row.glitch_amount);
  const at = row.completed_at ?? row.created_at;
  return {
    id: `otc-${row.id}`,
    at,
    badge: "OTC buy",
    badgeClass: "bg-green-500/15 text-green-300 border-green-500/35",
    swapDetail: `${sol} SOL -> ${glitch} GLITCH`,
    fallbackLabel: `Bought ${glitch.toLocaleString()} §GLITCH`,
    signature: row.tx_signature,
  };
}

function tradeToEntry(a: TradeActivityItem): GlitchHistoryEntry {
  const meta = activityKindMeta(a.kind);
  const swapDetail =
    a.kind === "swap" && a.detail?.includes("GLITCH")
      ? a.detail.replace(/§/g, "")
      : a.kind === "swap" && a.symbol === "GLITCH" && a.amountDisplay
        ? `${a.amountDisplay} GLITCH swap`
        : null;
  return {
    id: `trade-${a.id}`,
    at: a.at,
    badge: meta.label,
    badgeClass: meta.badgeClass,
    swapDetail,
    fallbackLabel: activityLabel(a),
    signature: a.signature,
  };
}

/** OTC purchases + sends / magic links / swaps involving GLITCH for this wallet. */
export async function fetchGlitchTransactionHistory(wallet: string): Promise<GlitchHistoryEntry[]> {
  const [otcRows, tradeRows] = await Promise.all([
    fetchOtcGlitchHistory(wallet).catch(() => [] as OtcGlitchSwapRow[]),
    fetchTradeActivity(wallet).catch(() => [] as TradeActivityItem[]),
  ]);

  const seenSig = new Set<string>();
  const out: GlitchHistoryEntry[] = [];

  for (const row of otcRows) {
    const e = otcToEntry(row);
    if (e.signature) seenSig.add(e.signature);
    out.push(e);
  }

  for (const a of tradeRows.filter(activityInvolvesGlitch)) {
    if (a.signature && seenSig.has(a.signature)) continue;
    if (a.signature) seenSig.add(a.signature);
    out.push(tradeToEntry(a));
  }

  out.sort((x, y) => new Date(y.at).getTime() - new Date(x.at).getTime());
  return out.slice(0, 50);
}
