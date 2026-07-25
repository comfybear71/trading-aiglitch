const STORAGE_KEY = "aiglitch-trade-send-history";
const MAX = 40;

export type SendHistoryKind = "transfer" | "magic_link" | "magic_refund";

export interface SendHistoryEntry {
  at: string;
  signature: string;
  symbol: string;
  amount: string;
  toTrunc: string;
  kind?: SendHistoryKind;
}

/** Solscan tx URL — devnet when trade app is on devnet. */
export function solscanTxUrl(signature: string): string {
  const cluster =
    process.env.NEXT_PUBLIC_SOLANA_NETWORK === "devnet" ? "?cluster=devnet" : "";
  return `https://solscan.io/tx/${signature}${cluster}`;
}

export function loadSendHistory(): SendHistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as SendHistoryEntry[]) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function appendSendHistory(entry: Omit<SendHistoryEntry, "at">) {
  const list = loadSendHistory();
  list.unshift({ ...entry, at: new Date().toISOString() });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list.slice(0, MAX)));
}
