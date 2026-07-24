import { isTradeAdminWallet } from "@/lib/trade-admin";

/** Adds X-Wallet-Address for API admin wallet auth (no password cookie). */
export function withAdminWalletHeaders(
  wallet: string | null | undefined,
  init: RequestInit = {},
): RequestInit {
  if (!wallet || !isTradeAdminWallet(wallet)) {
    return { ...init, credentials: init.credentials ?? "include" };
  }
  const headers = new Headers(init.headers);
  headers.set("X-Wallet-Address", wallet);
  return { ...init, headers, credentials: init.credentials ?? "include" };
}

export function adminApiFetch(
  wallet: string | null | undefined,
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> {
  return fetch(input, withAdminWalletHeaders(wallet, init));
}
