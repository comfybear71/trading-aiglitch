/** Minimal Phantom connect — no wallet-adapter bundle. */

import { isMobileWeb, openInPhantomBrowser } from "@/lib/phantom-mobile";

export interface PhantomPublicKey {
  toBase58(): string;
}

export interface PhantomProvider {
  isPhantom?: boolean;
  publicKey?: PhantomPublicKey | null;
  connect(opts?: { onlyIfTrusted?: boolean }): Promise<{ publicKey: PhantomPublicKey }>;
  disconnect(): Promise<void>;
  signTransaction?(transaction: unknown): Promise<VersionedTransactionLike>;
  signAndSendTransaction(
    transaction: unknown,
    opts?: { skipPreflight?: boolean },
  ): Promise<{ signature: string }>;
}

/** Minimal shape returned by Phantom signTransaction. */
export interface VersionedTransactionLike {
  serialize(): Uint8Array;
}

declare global {
  interface Window {
    solana?: PhantomProvider;
  }
}

export function getPhantom(): PhantomProvider | null {
  if (typeof window === "undefined") return null;
  const p = window.solana;
  if (p?.isPhantom) return p;
  return null;
}

export async function connectPhantom(): Promise<string> {
  const phantom = getPhantom();
  if (!phantom) {
    if (isMobileWeb()) {
      openInPhantomBrowser();
      throw new Error(
        "Opening Phantom… When the page loads inside the Phantom app, tap Connect again.",
      );
    }
    throw new Error(
      "Install the Phantom browser extension on desktop, or open this site in the Phantom app on your phone.",
    );
  }
  const { publicKey } = await phantom.connect();
  return publicKey.toBase58();
}

export async function disconnectPhantom(): Promise<void> {
  const phantom = getPhantom();
  if (phantom?.publicKey) await phantom.disconnect();
}

export function truncWallet(addr: string) {
  if (addr.length < 12) return addr;
  return `${addr.slice(0, 4)}…${addr.slice(-4)}`;
}

/** Sign a legacy Transaction via Phantom (marketplace NFT mint flow). */
export async function signPhantomTransaction(transaction: unknown): Promise<VersionedTransactionLike> {
  const phantom = getPhantom();
  if (!phantom?.publicKey) {
    throw new Error("Connect Phantom first.");
  }
  if (!phantom.signTransaction) {
    throw new Error("Phantom signTransaction is not available in this browser.");
  }
  return phantom.signTransaction(transaction);
}

/** Phantom / Blowfish often return opaque "Unexpected error" when the user closes a block dialog. */
export function formatPhantomWalletError(e: unknown): string {
  let raw = "";
  if (e instanceof Error) raw = e.message;
  else if (typeof e === "object" && e && "message" in e) raw = String((e as { message: unknown }).message);
  else raw = String(e);

  if (/403|access forbidden|forbidden/i.test(raw)) {
    return "Network blocked the transaction broadcast. Refresh and try again — if it persists, the trade app may need an API update.";
  }
  if (/unexpected error/i.test(raw)) {
    return (
      "Phantom closed or blocked signing (no on-chain tx). If you saw red/yellow warnings: Proceed anyway → " +
      "Confirm (unsafe) → check “I understand…” → tap “Yes, confirm (unsafe)” at the bottom. " +
      "Do not tap Close on the “Are you sure?” screen. New sites often need Phantom’s domain review."
    );
  }
  if (/request blocked|could be malicious|blocked this request/i.test(raw)) {
    return "Phantom flagged trade.aiglitch.app — use Proceed anyway in the popup if you trust this site, or swap from a wallet Phantom already trusts.";
  }
  if (/not been authorized|user rejected|user denied|user cancelled/i.test(raw)) {
    return "Transaction cancelled in Phantom — approve to finish.";
  }
  return raw || "Wallet error";
}
