const STORAGE_KEY = "aiglitch-trade-send-history";
const MAX = 40;

export interface SendHistoryEntry {
  at: string;
  signature: string;
  symbol: string;
  amount: string;
  toTrunc: string;
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
