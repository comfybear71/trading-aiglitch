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
