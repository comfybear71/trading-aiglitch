import type { VersionedTransaction } from "@solana/web3.js";

import { formatPhantomWalletError, getPhantom } from "@/lib/phantom";
import { needsPhantomMobileBrowser, openInPhantomBrowser } from "@/lib/phantom-mobile";

function u8ToBase64(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]!);
  return btoa(binary);
}

async function submitViaApi(signed: Uint8Array): Promise<string> {
  const res = await fetch("/api/trade/submit", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ signedTransaction: u8ToBase64(signed) }),
  });
  const data = (await res.json()) as { signature?: string; error?: string };
  if (!res.ok) throw new Error(data.error || `Broadcast failed (${res.status})`);
  if (!data.signature) throw new Error("No signature returned");
  return data.signature;
}

/** Connect if needed, sign in Phantom, broadcast via api.aiglitch.app (Helius RPC). */
export async function phantomSignAndSubmit(tx: VersionedTransaction): Promise<string> {
  if (needsPhantomMobileBrowser()) {
    openInPhantomBrowser();
    throw new Error("Open in Phantom to sign this transaction, then try again.");
  }
  const phantom = getPhantom();
  if (!phantom) throw new Error("Connect Phantom to sign.");

  await phantom.connect({ onlyIfTrusted: true }).catch(() => phantom.connect());

  // Prefer Phantom's send path first — Blowfish often blocks sign-only + external broadcast on new domains.
  try {
    const { signature } = await phantom.signAndSendTransaction(tx, { skipPreflight: false });
    if (signature) return signature;
  } catch (sendErr) {
    const signTx = phantom.signTransaction;
    if (typeof signTx !== "function") {
      throw new Error(formatPhantomWalletError(sendErr));
    }
    try {
      const signed = await signTx.call(phantom, tx);
      return await submitViaApi(signed.serialize());
    } catch (signErr) {
      throw new Error(formatPhantomWalletError(signErr ?? sendErr));
    }
  }

  throw new Error("Phantom did not return a signature.");
}
