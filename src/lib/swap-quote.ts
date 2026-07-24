/** Defaults — keep aligned with aiglitch-api TRADE_* constants */
export const DEFAULT_SLIPPAGE_BPS = 100;
export const DEFAULT_MAX_PRIORITY_FEE_SOL = 0.0001;
/** Typical Solana signature fee (not priority). */
export const TYPICAL_BASE_TX_FEE_SOL = 0.000005;

const MINT_SYMBOL: Record<string, string> = {
  So11111111111111111111111111111111111111112: "SOL",
  EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v: "USDC",
  "2ajYe8eh8btUZRpaZ1v7ewWDkcYJmVGvPuDTU5xrpump": "BUDJU",
  "5hfHCmaL6e9bvruy35RQyghMXseTE2mXJ7ukqKAcS8fT": "GLITCH",
};

function mintToSymbol(mint: string | undefined): string {
  if (!mint) return "?";
  return MINT_SYMBOL[mint] ?? `${mint.slice(0, 4)}…`;
}

export interface TradeQuoteFeesMeta {
  slippageBps: number;
  maxPriorityFeeLamports: number;
  maxPriorityFeeSol: number;
  priorityLevel: string;
  router: string;
}

export interface ParsedSwapQuote {
  outHuman: number;
  minOutHuman: number;
  priceImpactPct: number | null;
  slippageBps: number;
  platformFeeBps: number | null;
  /** e.g. "1 USDC ≈ 0.01319 SOL" */
  exchangeRate: string | null;
  /** e.g. "GoonFi V2 + Raydium" — venue names only */
  routeSummary: string | null;
  /** Jupiter-style: "2 Routes + 2 Markets" */
  routeLine: string | null;
  routeCount: number;
  marketCount: number;
  routeSteps: RouteStepDisplay[];
}

export interface RouteStepDisplay {
  percent: number;
  venue: string;
  inputSymbol: string;
  outputSymbol: string;
}

function num(v: unknown): number | null {
  if (v == null) return null;
  const n = typeof v === "string" ? Number(v) : Number(v);
  return Number.isFinite(n) ? n : null;
}

function plural(n: number, word: string): string {
  return `${n} ${word}${n === 1 ? "" : "s"}`;
}

function parseRoutePlan(quote: Record<string, unknown>): {
  summary: string | null;
  routeLine: string | null;
  routeCount: number;
  marketCount: number;
  steps: RouteStepDisplay[];
} {
  const plan = quote.routePlan;
  if (!Array.isArray(plan) || plan.length === 0) {
    return { summary: null, routeLine: null, routeCount: 0, marketCount: 0, steps: [] };
  }

  const steps: RouteStepDisplay[] = [];
  const labels: string[] = [];

  for (const step of plan) {
    if (!step || typeof step !== "object") continue;
    const row = step as {
      percent?: number;
      swapInfo?: {
        label?: string;
        inputMint?: string;
        outputMint?: string;
      };
    };
    const swapInfo = row.swapInfo;
    const venue = swapInfo?.label?.trim() || "Market";
    const percent = typeof row.percent === "number" ? row.percent : 100;
    steps.push({
      percent,
      venue,
      inputSymbol: mintToSymbol(swapInfo?.inputMint),
      outputSymbol: mintToSymbol(swapInfo?.outputMint),
    });
    if (venue && !labels.includes(venue)) labels.push(venue);
  }

  const hopCount = steps.length;
  const marketCount = labels.length > 0 ? labels.length : hopCount;
  /** Match jup.ag row: each hop is a route leg; markets = unique venues. */
  const routeCount = hopCount;

  const routeLine = `${plural(routeCount, "Route")} + ${plural(marketCount, "Market")}`;

  let summary: string | null = null;
  if (labels.length === 0) {
    summary = hopCount === 1 ? "1 market" : `${hopCount} hops`;
  } else {
    const head = labels.slice(0, 2).join(" + ");
    const extra = labels.length > 2 ? ` +${labels.length - 2}` : "";
    summary = head + extra;
  }

  return { summary, routeLine, routeCount, marketCount, steps };
}

/** Pull human-readable lines from Jupiter quote + API fee meta. */
export function parseJupiterQuote(
  quote: Record<string, unknown>,
  inputDecimals: number,
  outputDecimals: number,
  inputSymbol: string,
  outputSymbol: string,
  feesMeta?: TradeQuoteFeesMeta | null,
): ParsedSwapQuote {
  const inRaw = num(quote.inAmount) ?? 0;
  const outRaw = num(quote.outAmount) ?? 0;
  const minRaw = num(quote.otherAmountThreshold) ?? outRaw;
  const inHuman = inRaw / 10 ** inputDecimals;
  const outHuman = outRaw / 10 ** outputDecimals;
  const minOutHuman = minRaw / 10 ** outputDecimals;

  const priceImpactPct = num(quote.priceImpactPct);

  let platformFeeBps: number | null = null;
  const pf = quote.platformFee;
  if (pf && typeof pf === "object" && pf !== null && "feeBps" in pf) {
    platformFeeBps = num((pf as { feeBps?: unknown }).feeBps);
  }

  const slippageBps =
    num(quote.slippageBps) ?? feesMeta?.slippageBps ?? DEFAULT_SLIPPAGE_BPS;

  let exchangeRate: string | null = null;
  if (inHuman > 0 && outHuman > 0) {
    const outPerOneIn = outHuman / inHuman;
    exchangeRate = `1 ${inputSymbol} ≈ ${outPerOneIn.toLocaleString(undefined, {
      maximumFractionDigits: 6,
    })} ${outputSymbol}`;
  }

  const { summary: routeSummary, routeLine, routeCount, marketCount, steps: routeSteps } =
    parseRoutePlan(quote);

  return {
    outHuman,
    minOutHuman,
    priceImpactPct,
    slippageBps,
    platformFeeBps,
    exchangeRate,
    routeSummary,
    routeLine,
    routeCount,
    marketCount,
    routeSteps,
  };
}

/** Basis points → display % (100 bps = 1%). */
export function formatPct(bps: number): string {
  return `${(bps / 100).toFixed(2).replace(/\.?0+$/, "")}%`;
}

/** Jupiter-style platform line: feeBps 2 → 0.02% if they use bps/100 = percent... 
 * Jupiter API feeBps: 20 often means 0.2% — image shows 0.02% which is 2 bps in standard finance.
 */
export function formatPlatformFee(bps: number | null): string {
  if (bps == null || bps <= 0) return "None";
  return formatPct(bps);
}

export function estimateNetworkFeeSol(maxPrioritySol: number): {
  sol: number;
  label: string;
} {
  const sol = maxPrioritySol + TYPICAL_BASE_TX_FEE_SOL;
  return {
    sol,
    label: `~${sol.toFixed(6)} SOL (base + priority cap)`,
  };
}

/** Rough USD hint when selling/buying USDC (1:1). */
export function usdcApprox(amount: number, symbol: string): string | null {
  if (symbol !== "USDC") return null;
  return `$${amount.toFixed(2)}`;
}
