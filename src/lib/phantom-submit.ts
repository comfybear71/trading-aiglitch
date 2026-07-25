import { Connection, VersionedTransaction } from "@solana/web3.js";

import { formatPhantomWalletError, getPhantom } from "@/lib/phantom";

function mainnetRpcUrl(): string {
  const custom = process.env.NEXT_PUBLIC_SOLANA_RPC_URL?.trim();
  if (custom) return custom;
  return "https://api.mainnet-beta.solana.com";
}

/** Connect if needed, sign in Phantom, broadcast (sign-only path avoids some send-path blocks). */
export async function phantomSignAndSubmit(tx: VersionedTransaction): Promise<string> {
  const phantom = getPhantom();
  if (!phantom) throw new Error("Phantom not available");

  await phantom.connect({ onlyIfTrusted: true }).catch(() => phantom.connect());

  const signTx = phantom.signTransaction;
  if (typeof signTx === "function") {
    try {
      const signed = await signTx.call(phantom, tx);
      const connection = new Connection(mainnetRpcUrl(), "confirmed");
      const signature = await connection.sendRawTransaction(signed.serialize(), {
        skipPreflight: false,
        maxRetries: 3,
      });
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash("confirmed");
      await connection.confirmTransaction(
        { signature, blockhash, lastValidBlockHeight },
        "confirmed",
      );
      return signature;
    } catch (e) {
      const msg = formatPhantomWalletError(e);
      throw new Error(msg);
    }
  }

  try {
    const { signature } = await phantom.signAndSendTransaction(tx);
    return signature;
  } catch (e) {
    throw new Error(formatPhantomWalletError(e));
  }
}
