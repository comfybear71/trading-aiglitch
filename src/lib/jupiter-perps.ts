/** Jupiter Perps — trading happens on Jupiter; Phase 7 v1 is gate + risk ack + link/embed. */
export const JUPITER_PERPS_URL = "https://jup.ag/perps";
export const JUPITER_PERPS_DOCS_URL = "https://station.jup.ag/docs";

export const PERPS_RISK_ACK_STORAGE_KEY = "aiglitch-trade-perps-risk-v1";

export function readPerpsRiskAck(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(PERPS_RISK_ACK_STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

export function writePerpsRiskAck(): void {
  try {
    localStorage.setItem(PERPS_RISK_ACK_STORAGE_KEY, "1");
  } catch {
    /* private mode */
  }
}

export function clearPerpsRiskAck(): void {
  try {
    localStorage.removeItem(PERPS_RISK_ACK_STORAGE_KEY);
  } catch {
    /* private mode */
  }
}
