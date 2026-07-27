export type TradeTokenMetaRow = {
  symbol: string;
  mint: string;
  name: string;
  iconUrl: string;
  iconEmoji: string;
  source: "aiglitch" | "jupiter";
};

let metaCache: Record<string, TradeTokenMetaRow> | null = null;
let metaPromise: Promise<Record<string, TradeTokenMetaRow>> | null = null;

export async function fetchTradeTokenMeta(
  symbols?: string[],
): Promise<Record<string, TradeTokenMetaRow>> {
  if (!symbols && metaCache) return metaCache;
  const q = symbols?.length
    ? `?symbols=${encodeURIComponent(symbols.join(","))}`
    : "";
  const res = await fetch(`/api/trade/tokens/meta${q}`, { cache: "no-store" });
  const data = await res.json();
  const tokens = (data.tokens ?? {}) as Record<string, TradeTokenMetaRow>;
  if (!symbols) metaCache = tokens;
  return tokens;
}

export function getTradeTokenMetaCached(): Record<string, TradeTokenMetaRow> {
  return metaCache ?? {};
}

export function loadTradeTokenMetaOnce(): Promise<Record<string, TradeTokenMetaRow>> {
  if (metaCache) return Promise.resolve(metaCache);
  if (!metaPromise) {
    metaPromise = fetchTradeTokenMeta().finally(() => {
      metaPromise = null;
    });
  }
  return metaPromise;
}
