import { Transaction } from "@solana/web3.js";
import { getPhantom } from "@/lib/phantom";

function serializeSignedTxBase64(signed: Transaction): string {
  const bytes = signed.serialize();
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

export async function executeOtcGlitchPurchase(
  buyerWallet: string,
  glitchAmount: number,
): Promise<{ txSignature: string }> {
  const createRes = await fetch("/api/otc-swap", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "create_swap",
      buyer_wallet: buyerWallet,
      glitch_amount: glitchAmount,
    }),
  });
  const createData = await createRes.json();
  if (!createRes.ok || !createData.success) {
    throw new Error(createData.error || "Could not create swap");
  }

  const phantom = getPhantom();
  if (!phantom?.signTransaction) {
    throw new Error("Connect Phantom to sign this purchase.");
  }
  await phantom.connect({ onlyIfTrusted: true }).catch(() => phantom.connect());

  const txBuf = Uint8Array.from(atob(createData.transaction), (c) => c.charCodeAt(0));
  const transaction = Transaction.from(txBuf);
  const signed = (await phantom.signTransaction(transaction)) as Transaction;

  const submitRes = await fetch("/api/otc-swap", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "submit_swap",
      swap_id: createData.swap_id,
      signed_transaction: serializeSignedTxBase64(signed),
    }),
  });
  const submitData = await submitRes.json();
  if (!submitRes.ok || !submitData.success) {
    throw new Error(submitData.error || "Transaction submission failed");
  }

  return { txSignature: submitData.tx_signature as string };
}
