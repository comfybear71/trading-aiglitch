"use client";

import { useEffect, useState } from "react";
import { VersionedTransaction } from "@solana/web3.js";
import Link from "next/link";
import { useTraderWallet } from "@/context/TraderWalletContext";
import { useTradeToast } from "@/context/TradeToastContext";
import { phantomSignAndSubmit } from "@/lib/phantom-submit";

type ClaimInfo = {
  claimId: string;
  symbol: string;
  amountHuman: number;
  expiresAt: string;
  status: string;
  senderTrunc: string;
};

export function ClaimClient({ claimId }: { claimId: string }) {
  const trader = useTraderWallet();
  const { pushToast } = useTradeToast();
  const [info, setInfo] = useState<ClaimInfo | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/trade/magic-link/${claimId}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Not found");
        setInfo(data);
      } catch (e) {
        setLoadError(e instanceof Error ? e.message : String(e));
      }
    })();
  }, [claimId]);

  const runClaim = async () => {
    if (!trader.wallet || !info) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/trade/magic-link/${claimId}/claim`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ recipientPublicKey: trader.wallet }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Claim build failed");

      const raw = atob(data.transaction);
      const bytes = new Uint8Array(raw.length);
      for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
      const tx = VersionedTransaction.deserialize(bytes);
      const sig = await phantomSignAndSubmit(tx);

      await fetch(`/api/trade/magic-link/${claimId}/claim`, {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ claimSignature: sig }),
      });

      pushToast(`Claimed · ${sig.slice(0, 8)}…`, "success", `https://solscan.io/tx/${sig}`);
      setInfo({ ...info, status: "claimed" });
    } catch (e) {
      pushToast(e instanceof Error ? e.message : String(e), "error");
    } finally {
      setBusy(false);
    }
  };

  if (loadError) {
    return (
      <div className="max-w-md mx-auto rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 text-center">
        <p className="text-red-400 text-sm">{loadError}</p>
        <Link href="/send" className="text-cyan-500 text-xs mt-4 inline-block">
          Back to Send
        </Link>
      </div>
    );
  }

  if (!info) {
    return <p className="text-center text-zinc-500 text-sm">Loading claim…</p>;
  }

  const canClaim = info.status === "pending";
  const expired = info.status === "expired";
  const awaitingDeposit = info.status === "awaiting_deposit";

  return (
    <div className="max-w-md mx-auto rounded-2xl border border-zinc-800 bg-[#12121a] p-6 space-y-4">
      <h1 className="text-xl font-black text-white">Claim gift</h1>
      <p className="text-3xl font-bold text-cyan-300">
        {info.amountHuman} {info.symbol}
      </p>
      <p className="text-xs text-zinc-500">
        From {info.senderTrunc} · expires {new Date(info.expiresAt).toLocaleString()}
      </p>
      <p className="text-sm text-zinc-400">
        Status: <span className="text-white font-medium">{info.status}</span>
        {expired && " — sender may refund if still on-chain"}
      </p>

      {awaitingDeposit ? (
        <p className="text-sm text-amber-400/90">Sender has not finished funding this link yet.</p>
      ) : !trader.wallet ? (
        <p className="text-sm text-zinc-400">Connect wallet (top right) to claim.</p>
      ) : canClaim && !expired ? (
        <button
          type="button"
          disabled={busy}
          onClick={() => void runClaim()}
          className="w-full py-3 rounded-xl bg-lime-500 text-black font-bold disabled:opacity-50"
        >
          {busy ? "Claiming…" : "Claim to my wallet"}
        </button>
      ) : (
        <p className="text-sm text-zinc-500">This link is no longer claimable.</p>
      )}

      <Link href="/markets" className="block text-center text-xs text-cyan-500 hover:underline">
        Go to trade
      </Link>
    </div>
  );
}
