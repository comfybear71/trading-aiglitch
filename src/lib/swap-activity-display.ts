/** Parse stored swap detail like `0.1 SOL -> 11.994326 RAY`. */
export function parseSwapDetail(detail: string | null | undefined): {
  fromAmount: string;
  fromSymbol: string;
  toAmount: string;
  toSymbol: string;
} | null {
  if (!detail) return null;
  const m = detail.trim().match(/^([\d.,]+)\s+(\S+)\s*(?:->|→)\s*([\d.,]+)\s+(\S+)/);
  if (!m) return null;
  return {
    fromAmount: m[1],
    fromSymbol: m[2],
    toAmount: m[3],
    toSymbol: m[4],
  };
}
