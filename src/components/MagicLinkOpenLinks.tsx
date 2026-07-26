"use client";

import { useCallback, useEffect, useState } from "react";
import { VersionedTransaction } from "@solana/web3.js";
import { useTraderWallet } from "@/context/TraderWalletContext";
import { useTradeToast } from "@/context/TradeToastContext";
import { phantomSignAndSubmit } from "@/lib/phantom-submit";
import { fetchSentMagicLinks, type SentMagicClaim } from "@/lib/trade-activity-api";

type Props = {
  onChanged?: () => void;
};

export function MagicLinkOpenLinks({ onChanged }: Props) {
  const trader = useTraderWallet();
  const { pushToast } = useTradeToast();
  const [claims, setClaims] = useState<SentMagicClaim[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!trader.wallet) {
      setClaims([]);
      return;
    }
    try {
      const all = await fetchSentMagicLinks(trader.wallet);
      setClaims(all.filter((c) => c.canAbandon || c.canRefund));
    } catch {
      setClaims([]);
    }
  }, [trader.wallet]);

  useEffect(() => {
    void load();
  }, [load]);

  const abandon = async (claimId: string) => {
    if (!trader.wallet) return;
    setBusyId(claimId);
    try {
      const res = await fetch(`/api/trade/magic-link/${claimId}/abandon`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ senderPublicKey: trader.wallet }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Abandon failed");
      pushToast("Unfunded link removed", "success");
      await load();
      onChanged?.();
    } catch (e) {
      pushToast(e instanceof Error ? e.message : String(e), "error");
    } finally {
      setBusyId(null);
    }
  };

  const refund = async (claim: SentMagicClaim) => {
    if (!trader.wallet) return;
    setBusyId(claim.claimId);
    try {
      const res = await fetch(`/api/trade/magic-link/${claim.claimId}/refund`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ senderPublicKey: trader.wallet }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Refund build failed");

      const raw = atob(data.transaction);
      const bytes = new Uint8Array(raw.length);
      for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
      const tx = VersionedTransaction.deserialize(bytes);
      const sig = await phantomSignAndSubmit(tx);

      await fetch(`/api/trade/magic-link/${claim.claimId}/refund`, {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ refundSignature: sig, senderPublicKey: trader.wallet }),
      });

      pushToast("Link cancelled — funds refunded", "success");
      await load();
      onChanged?.();
      await trader.refresh();
    } catch (e) {
      pushToast(e instanceof Error ? e.message : String(e), "error");
    } finally {
      setBusyId(null);
    }
  };

  if (!trader.wallet || claims.length === 0) return null;

  return (
    <div className="rounded-2xl border border-zinc-800 bg-[#12121a] overflow-hidden">
      <p className="px-4 py-2 text-[10px] uppercase text-zinc-500 font-semibold border-b border-zinc-800">
        Your magic links
      </p>
      <ul className="divide-y divide-zinc-800/80 max-h-48 overflow-y-auto">
        {claims.map((c) => (
          <li key={c.claimId} className="px-4 py-2.5 space-y-1.5">
            <div className="flex justify-between text-sm">
              <span className="text-zinc-200">
                {c.amountHuman} {c.symbol}
              </span>
              <span className="text-[10px] text-zinc-500 uppercase">{c.status.replace("_", " ")}</span>
            </div>
            <p className="text-[10px] font-mono text-zinc-500 truncate">{c.claimUrl}</p>
            <div className="flex gap-2">
              {c.canAbandon && (
                <button
                  type="button"
                  disabled={busyId === c.claimId}
                  onClick={() => void abandon(c.claimId)}
                  className="flex-1 py-1.5 text-[10px] rounded-lg border border-zinc-600 text-zinc-300"
                >
                  Dismiss unfunded
                </button>
              )}
              {c.canRefund && (
                <button
                  type="button"
                  disabled={busyId === c.claimId}
                  onClick={() => void refund(c)}
                  className="flex-1 py-1.5 text-[10px] rounded-lg border border-red-500/40 text-red-300"
                >
                  Cancel & refund
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
