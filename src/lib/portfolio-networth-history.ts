const KEY_PREFIX = "trade_portfolio_nw_v1:";
const MAX_POINTS = 48;

export type NetWorthPoint = { t: number; usd: number };

export function loadNetWorthHistory(wallet: string): NetWorthPoint[] {
  if (typeof window === "undefined" || !wallet) return [];
  try {
    const raw = localStorage.getItem(KEY_PREFIX + wallet);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as NetWorthPoint[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/** Append snapshot if value changed or last point older than 5 min. */
export function appendNetWorthSnapshot(wallet: string, usd: number): NetWorthPoint[] {
  if (typeof window === "undefined" || !wallet || !Number.isFinite(usd) || usd < 0) return [];
  const prev = loadNetWorthHistory(wallet);
  const now = Date.now();
  const last = prev[prev.length - 1];
  const shouldAppend =
    !last ||
    Math.abs(last.usd - usd) > 0.01 ||
    now - last.t > 5 * 60 * 1000;
  if (!shouldAppend) return prev;

  const next = [...prev, { t: now, usd }].slice(-MAX_POINTS);
  try {
    localStorage.setItem(KEY_PREFIX + wallet, JSON.stringify(next));
  } catch {
    /* quota */
  }
  return next;
}

export function mergeNetWorthHistories(...lists: NetWorthPoint[][]): NetWorthPoint[] {
  const byMinute = new Map<number, NetWorthPoint>();
  for (const list of lists) {
    for (const p of list) {
      if (!Number.isFinite(p.usd) || p.usd < 0) continue;
      const bucket = Math.floor(p.t / 60_000);
      const existing = byMinute.get(bucket);
      if (!existing || p.t >= existing.t) byMinute.set(bucket, p);
    }
  }
  return [...byMinute.values()].sort((a, b) => a.t - b.t).slice(-MAX_POINTS);
}

export async function fetchServerNetWorthHistory(wallet: string): Promise<NetWorthPoint[]> {
  const res = await fetch(`/api/trade/networth?wallet=${encodeURIComponent(wallet)}&limit=48`);
  const data = await res.json();
  if (!res.ok) return [];
  const points = (data.points ?? []) as { at: string; usd: number }[];
  return points
    .map((p) => ({ t: new Date(p.at).getTime(), usd: Number(p.usd) }))
    .filter((p) => Number.isFinite(p.t) && Number.isFinite(p.usd));
}

export async function postServerNetWorthSnapshot(wallet: string, usd: number): Promise<void> {
  await fetch("/api/trade/networth", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ wallet, usdNetWorth: usd }),
  });
}

export function netWorthDelta(points: NetWorthPoint[]): { pct: number | null; usd: number | null } {
  if (points.length < 2) return { pct: null, usd: null };
  const first = points[0].usd;
  const last = points[points.length - 1].usd;
  if (first <= 0) return { pct: null, usd: last - first };
  return { pct: ((last - first) / first) * 100, usd: last - first };
}
