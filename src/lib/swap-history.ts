const STORAGE_KEY = "aiglitch-trade-swap-history";
const MAX_ENTRIES = 50;

export interface SwapHistoryEntry {
  at: string;
  signature: string;
  sellSymbol: string;
  buySymbol: string;
  sellAmount: string;
  buyAmount: string;
}

export function loadSwapHistory(): SwapHistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as SwapHistoryEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function appendSwapHistory(entry: Omit<SwapHistoryEntry, "at">) {
  const list = loadSwapHistory();
  list.unshift({ ...entry, at: new Date().toISOString() });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list.slice(0, MAX_ENTRIES)));
}
