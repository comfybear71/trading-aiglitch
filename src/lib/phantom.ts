/** Minimal Phantom connect — no wallet-adapter bundle. */

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
    throw new Error("Install Phantom wallet to trade on trade.aiglitch.app");
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

/** Phantom / Blowfish often return opaque "Unexpected error" when the user closes a block dialog. */
export function formatPhantomWalletError(e: unknown): string {
  let raw = "";
  if (e instanceof Error) raw = e.message;
  else if (typeof e === "object" && e && "message" in e) raw = String((e as { message: unknown }).message);
  else raw = String(e);

  if (/unexpected error/i.test(raw)) {
    return (
      "Phantom blocked or closed the request. If you saw a red security warning, only continue if you trust trade.aiglitch.app " +
      "(Confirm or Proceed anyway in Phantom). New domains often show a yellow warning — that is normal."
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
