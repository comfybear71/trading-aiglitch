/** Jupiter-style token risk copy for our trade lane (not from Jupiter API). */

export interface TokenWarning {
  id: string;
  title: string;
  body: string;
  /** e.g. RugCheck on Jupiter's "High Single Ownership" card */
  subtitle?: string;
  /** First / critical warning gets red styling like Jupiter JupShield */
  critical?: boolean;
}

/** Same six categories Jupiter JupShield shows for §GLITCH on jup.ag (mint 5hfH…S8fT). */
const GLITCH_WARNINGS: TokenWarning[] = [
  {
    id: "not-sellable",
    title: "Not Sellable",
    body: "This token may not be sellable",
    critical: true,
  },
  {
    id: "not-verified",
    title: "Not Verified",
    body: "This token is not verified, make sure the mint address is correct before trading",
  },
  {
    id: "low-liquidity",
    title: "Low Liquidity",
    body: "This token has low liquidity",
  },
  {
    id: "low-organic",
    title: "Low Organic Activity",
    body: "This token has low organic activity",
  },
  {
    id: "supply",
    title: "High Supply Concentration",
    body: "The top 10 holders own more than 80% of the total supply",
  },
  {
    id: "single-ownership",
    title: "High Single Ownership",
    subtitle: "RugCheck",
    body: "A large majority of the token's supply is owned by a single wallet",
  },
];

const BUDJU_WARNINGS: TokenWarning[] = [
  {
    id: "not-verified",
    title: "Not Verified",
    body: "This token is not verified, make sure the mint address is correct before trading",
  },
  {
    id: "low-liquidity",
    title: "Low Liquidity",
    body: "This token has low liquidity",
  },
  {
    id: "low-organic",
    title: "Low Organic Activity",
    body: "This token has low organic activity",
  },
];

export function getTokenWarnings(symbol: string): TokenWarning[] {
  if (symbol === "GLITCH") return GLITCH_WARNINGS;
  if (symbol === "BUDJU") return BUDJU_WARNINGS;
  return [];
}

export function warningsLabel(count: number): string {
  return count === 1 ? "1 Warning" : `${count} Warnings`;
}

export function warningsModalTitle(symbol: string, count: number): string {
  if (symbol === "GLITCH" || symbol === "BUDJU") {
    return count === 1 ? "1 JupShield Warning" : `${count} JupShield Warnings`;
  }
  return count === 1 ? `1 warning · ${symbol}` : `${count} warnings · ${symbol}`;
}
