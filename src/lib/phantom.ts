/** Minimal Phantom connect — no wallet-adapter bundle. */

export interface PhantomPublicKey {
  toBase58(): string;
}

export interface PhantomProvider {
  isPhantom?: boolean;
  publicKey?: PhantomPublicKey | null;
  connect(opts?: { onlyIfTrusted?: boolean }): Promise<{ publicKey: PhantomPublicKey }>;
  disconnect(): Promise<void>;
  signAndSendTransaction(
    transaction: unknown,
    opts?: { skipPreflight?: boolean },
  ): Promise<{ signature: string }>;
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
