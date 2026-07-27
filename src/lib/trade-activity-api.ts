export type TradeActivityItem = {
  id: string;
  kind: string;
  signature: string | null;
  symbol: string | null;
  amountDisplay: string | null;
  detail: string | null;
  claimId: string | null;
  at: string;
};

export type ActivityFilter = "all" | "swap" | "send" | "magic";

export function activityMatchesFilter(kind: string, filter: ActivityFilter): boolean {
  if (filter === "all") return true;
  if (filter === "swap") return kind === "swap";
  if (filter === "send") return kind === "transfer";
  if (filter === "magic") return kind.startsWith("magic_");
  return true;
}

export function activityKindMeta(kind: string): { label: string; badgeClass: string } {
  switch (kind) {
    case "swap":
      return { label: "Swap", badgeClass: "bg-cyan-500/15 text-cyan-300 border-cyan-500/30" };
    case "transfer":
      return { label: "Send", badgeClass: "bg-lime-500/15 text-lime-300 border-lime-500/30" };
    case "magic_deposit":
      return { label: "Magic", badgeClass: "bg-purple-500/15 text-purple-300 border-purple-500/30" };
    case "magic_refund":
      return { label: "Refund", badgeClass: "bg-amber-500/15 text-amber-300 border-amber-500/30" };
    case "magic_claim":
      return { label: "Claim", badgeClass: "bg-fuchsia-500/15 text-fuchsia-300 border-fuchsia-500/30" };
    default:
      return { label: kind, badgeClass: "bg-zinc-800 text-zinc-400 border-zinc-700" };
  }
}

export function formatActivityWhen(iso: string): string {
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return "";
  const sec = Math.floor((Date.now() - t) / 1000);
  if (sec < 60) return "Just now";
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 48) return `${hr}h ago`;
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function solscanTxUrl(signature: string): string {
  const cluster =
    process.env.NEXT_PUBLIC_SOLANA_NETWORK === "devnet" ? "?cluster=devnet" : "";
  return `https://solscan.io/tx/${signature}${cluster}`;
}

export async function fetchTradeActivity(wallet: string): Promise<TradeActivityItem[]> {
  const res = await fetch(`/api/trade/activity?wallet=${encodeURIComponent(wallet)}&limit=50`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Activity load failed");
  return (data.activities ?? []) as TradeActivityItem[];
}

export async function recordTradeActivity(payload: {
  wallet: string;
  kind: "transfer" | "swap";
  signature: string;
  symbol?: string;
  amountDisplay?: string;
  detail?: string;
}): Promise<void> {
  await fetch("/api/trade/activity", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export function activityLabel(a: TradeActivityItem): string {
  const amt = a.amountDisplay && a.symbol ? `${a.amountDisplay} ${a.symbol}` : a.symbol ?? "";
  switch (a.kind) {
    case "magic_deposit":
      return amt ? `${amt} · ${a.detail ?? "Magic link"}` : (a.detail ?? "Magic link");
    case "magic_refund":
      return amt ? `Refund ${amt} · ${a.detail ?? ""}` : (a.detail ?? "Refund");
    case "magic_claim":
      return amt ? `Claimed ${amt} · ${a.detail ?? ""}` : (a.detail ?? "Claim");
    case "swap":
      return a.detail ?? (amt ? `Swap ${amt}` : "Swap");
    case "transfer":
    default:
      return amt && a.detail ? `${amt} → ${a.detail}` : amt || a.detail || "Transfer";
  }
}

export type SentMagicClaim = {
  claimId: string;
  claimUrl: string;
  symbol: string;
  amountHuman: number;
  status: string;
  expiresAt: string;
  expired: boolean;
  canAbandon: boolean;
  canRefund: boolean;
};

export async function fetchSentMagicLinks(wallet: string): Promise<SentMagicClaim[]> {
  const res = await fetch(`/api/trade/magic-link/sent?wallet=${encodeURIComponent(wallet)}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Load failed");
  return (data.claims ?? []) as SentMagicClaim[];
}
