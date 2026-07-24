/** Architect / ops wallet — must match ADMIN_WALLET_PUBKEY on aiglitch-api Vercel. */
export const TRADE_ADMIN_WALLET =
  process.env.NEXT_PUBLIC_ADMIN_WALLET_PUBKEY ??
  "AEWvE2xXaHSGdGCaCArb2PWdKS7K9RwoCRV7CT2CJTWq";

export function isTradeAdminWallet(address: string | null | undefined): boolean {
  if (!address) return false;
  return address === TRADE_ADMIN_WALLET;
}
