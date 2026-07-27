"use client";

import { useState } from "react";
import { VersionedTransaction } from "@solana/web3.js";
import { useTraderWallet } from "@/context/TraderWalletContext";
import { useTradeToast } from "@/context/TradeToastContext";
import { phantomSignAndSubmit } from "@/lib/phantom-submit";
import { TRADE_SEND_TOKENS, getTradeToken } from "@/lib/trade-tokens";
import { balanceForSymbol, formatSwapAmount, maxPayAmount } from "@/lib/trade-balance";
import { fmtUsd, usdValue, useTradePrices } from "@/lib/use-trade-prices";

function toAtomic(amount: string, decimals: number): string {
  const n = Number(amount);
  if (!Number.isFinite(n) || n <= 0) return "0";
  return Math.floor(n * 10 ** decimals).toString();
}

type Props = {
  symbol: string;
  setSymbol: (s: string) => void;
  balance: number;
  onActivityChange?: () => void;
};

export function MagicLinkSendPanel({ symbol, setSymbol, balance, onActivityChange }: Props) {
  const trader = useTraderWallet();
  const { pushToast } = useTradeToast();
  const { prices } = useTradePrices(!!trader.wallet);
  const [amount, setAmount] = useState("");
  const [busy, setBusy] = useState(false);
  const [claimUrl, setClaimUrl] = useState<string | null>(null);
  const [claimId, setClaimId] = useState<string | null>(null);
  /** Amount locked in active link (for refund activity row). */
  const [activeLinkAmount, setActiveLinkAmount] = useState<string | null>(null);

  const token = getTradeToken(symbol);

  const setFraction = (f: number) => {
    const raw = f >= 1 ? maxPayAmount(symbol, balance) : balance * f;
    setAmount(formatSwapAmount(raw, token.decimals));
  };

  const createLink = async () => {
    if (!trader.wallet) return;
    const atomic = toAtomic(amount, token.decimals);
    if (atomic === "0") {
      pushToast("Enter an amount", "error");
      return;
    }
    setBusy(true);
    setClaimUrl(null);
    try {
      const res = await fetch("/api/trade/magic-link/create", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          senderPublicKey: trader.wallet,
          symbol,
          amountAtomic: atomic,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Create failed");

      const raw = atob(data.transaction);
      const bytes = new Uint8Array(raw.length);
      for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
      const tx = VersionedTransaction.deserialize(bytes);
      const depositSig = await phantomSignAndSubmit(tx);

      await fetch(`/api/trade/magic-link/${data.claimId}/confirm`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          depositSignature: depositSig,
          senderPublicKey: trader.wallet,
        }),
      });

      onActivityChange?.();

      setClaimUrl(data.claimUrl);
      setClaimId(data.claimId);
      setActiveLinkAmount(amount);
      pushToast("Magic link ready — share the URL", "success");
      setAmount("");
      await trader.refresh();
    } catch (e) {
      pushToast(e instanceof Error ? e.message : String(e), "error");
    } finally {
      setBusy(false);
    }
  };

  const cancelLink = async () => {
    if (!trader.wallet || !claimId) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/trade/magic-link/${claimId}/refund`, {
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

      await fetch(`/api/trade/magic-link/${claimId}/refund`, {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ refundSignature: sig, senderPublicKey: trader.wallet }),
      });

      onActivityChange?.();

      pushToast("Link cancelled — funds refunded", "success");
      setClaimUrl(null);
      setClaimId(null);
      setActiveLinkAmount(null);
      await trader.refresh();
    } catch (e) {
      pushToast(e instanceof Error ? e.message : String(e), "error");
    } finally {
      setBusy(false);
    }
  };

  const copyLink = async () => {
    if (!claimUrl) return;
    await navigator.clipboard.writeText(claimUrl);
    pushToast("Link copied", "success");
  };

  return (
    <div className="space-y-3">
      <p className="text-xs text-zinc-500 leading-snug px-1">
        Lock funds in escrow and share a link. Recipient claims with any wallet. You can cancel anytime before
        they claim. 7-day expiry · $500 max · USDC (when enabled on this network).
      </p>
      <div className="rounded-2xl border border-zinc-800 bg-[#12121a] overflow-hidden">
        <div className="p-4 border-b border-zinc-800/80">
          <div className="flex justify-between text-xs text-zinc-500 mb-2">
            <select
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              className="bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-sm font-bold text-white"
            >
              <option value="USDC">USDC</option>
            </select>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => setFraction(0.5)} className="text-[10px] font-bold text-zinc-500 hover:text-cyan-300">
                HALF
              </button>
              <button type="button" onClick={() => setFraction(1)} className="text-[10px] font-bold text-zinc-500 hover:text-cyan-300">
                MAX
              </button>
              <span className="text-[10px] font-mono text-zinc-500">
                {balance.toLocaleString(undefined, { maximumFractionDigits: 4 })} {symbol}
              </span>
            </div>
          </div>
          <input
            type="text"
            inputMode="decimal"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full bg-transparent text-right text-3xl font-semibold text-white focus:outline-none"
          />
          <p className="text-[10px] text-zinc-500 text-right mt-1">
            {fmtUsd(usdValue(Number(amount) || 0, symbol, prices))}
          </p>
        </div>
        <div className="px-4 pb-4 space-y-2">
          <button
            type="button"
            disabled={busy}
            onClick={() => void createLink()}
            className="w-full py-3.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm disabled:opacity-50"
          >
            {busy ? "Working…" : "Create magic link"}
          </button>
          {claimUrl && (
            <div className="rounded-xl border border-purple-500/30 bg-purple-500/10 p-3 space-y-2">
              <p className="text-[10px] uppercase text-purple-300 font-semibold">Share this link</p>
              <p className="text-xs font-mono text-zinc-300 break-all">{claimUrl}</p>
              <div className="flex gap-2">
                <button type="button" onClick={() => void copyLink()} className="flex-1 py-2 text-xs rounded-lg border border-zinc-600 text-zinc-200">
                  Copy link
                </button>
                <button type="button" onClick={() => void cancelLink()} disabled={busy} className="flex-1 py-2 text-xs rounded-lg border border-red-500/40 text-red-300">
                  Cancel & refund
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
