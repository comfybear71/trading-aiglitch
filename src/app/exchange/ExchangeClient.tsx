"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { GlitchExchangeStory } from "@/components/GlitchExchangeStory";
import { GlitchInvestPromo } from "@/components/GlitchInvestPromo";
import { OpenInPhantomButton, MobilePhantomHint } from "@/components/OpenInPhantomButton";
import { useTraderWallet } from "@/context/TraderWalletContext";
import { useTradeToast } from "@/context/TradeToastContext";
import { GLITCH_DAILY_SOL_LIMIT, otcTreasuryWalletSol } from "@/lib/glitch-otc";
import { executeOtcGlitchPurchase } from "@/lib/otc-buy";
import { useOtcConfig } from "@/lib/use-otc-config";

export default function ExchangeClient() {
  const trader = useTraderWallet();
  const { pushToast } = useTradeToast();
  const { otc, loading, refresh } = useOtcConfig();
  const [solAmount, setSolAmount] = useState("");
  const [busy, setBusy] = useState(false);
  const [lastTx, setLastTx] = useState<string | null>(null);

  const solBal = trader.eligibility?.balances.sol ?? 0;
  const glitchBal = trader.eligibility?.balances.glitch ?? 0;

  const glitchOut = useMemo(() => {
    if (!otc || !solAmount) return 0;
    const sol = parseFloat(solAmount);
    if (!Number.isFinite(sol) || sol <= 0) return 0;
    return Math.floor(sol / otc.price_sol);
  }, [otc, solAmount]);

  const buy = async () => {
    if (!trader.wallet || !otc) return;
    const sol = parseFloat(solAmount);
    if (!sol || sol <= 0) {
      pushToast("Enter a SOL amount", "error");
      return;
    }
    if (glitchOut < otc.min_purchase) {
      pushToast(`Minimum ${otc.min_purchase.toLocaleString()} §GLITCH per purchase`, "error");
      return;
    }
    if (glitchOut > otc.max_purchase) {
      pushToast(`Maximum ${otc.max_purchase.toLocaleString()} §GLITCH per purchase`, "error");
      return;
    }
    if (sol > solBal - 0.005) {
      pushToast("Not enough SOL (keep ~0.005 for fees)", "error");
      return;
    }

    setBusy(true);
    try {
      const { txSignature } = await executeOtcGlitchPurchase(trader.wallet, glitchOut);
      setLastTx(txSignature);
      setSolAmount("");
      pushToast(`Bought ${glitchOut.toLocaleString()} §GLITCH`, "success", `https://solscan.io/tx/${txSignature}`);
      await refresh();
      await trader.refresh();
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      pushToast(msg.includes("User rejected") ? "Transaction cancelled" : msg, "error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-5 pb-8">
      <div className="text-center sm:text-left">
        <p className="text-[10px] uppercase tracking-[0.25em] text-green-400/90 font-bold">OTC · SOL → §GLITCH</p>
        <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">Buy §GLITCH</h1>
        <p className="text-sm text-zinc-400 mt-1">
          Official platform exchange on{" "}
          <span className="text-zinc-300">trade.aiglitch.app</span> — fixed bonding-curve price, no bots, no Jupiter.
        </p>
      </div>

      <GlitchInvestPromo otc={otc} loading={loading} variant="hero" />

      <div className="rounded-2xl border border-green-500/30 bg-gradient-to-br from-green-950/30 to-zinc-900/80 p-4 space-y-4">
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-bold text-white">Swap SOL for §GLITCH</span>
          <span className="text-[9px] px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 font-bold">NO BOTS</span>
        </div>

        {!trader.wallet ? (
          <div className="text-center py-6 space-y-3">
            <p className="text-zinc-400 text-sm">Connect Phantom to purchase on-chain.</p>
            <MobilePhantomHint context="connect" />
            <button
              type="button"
              onClick={() => void trader.connect()}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 text-white font-bold text-sm"
            >
              Connect wallet
            </button>
            <OpenInPhantomButton />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="rounded-lg bg-black/40 border border-zinc-800 p-2">
                <p className="text-zinc-500">Your SOL</p>
                <p className="font-mono text-white">{solBal.toFixed(4)}</p>
              </div>
              <div className="rounded-lg bg-black/40 border border-zinc-800 p-2">
                <p className="text-zinc-500">Your §GLITCH</p>
                <p className="font-mono text-green-400">{glitchBal.toLocaleString()}</p>
              </div>
            </div>

            <label className="block space-y-1.5">
              <span className="text-[10px] font-bold text-zinc-500 uppercase">You pay (SOL)</span>
              <input
                type="number"
                min={0}
                step="0.01"
                value={solAmount}
                onChange={(e) => setSolAmount(e.target.value)}
                placeholder="0.00"
                className="w-full px-3 py-3 rounded-xl bg-black/50 border border-zinc-700 text-white font-mono text-lg text-right focus:border-green-500 focus:outline-none"
              />
            </label>

            <div className="flex gap-1.5 justify-end">
              {[25, 50, 100].map((pct) => (
                <button
                  key={pct}
                  type="button"
                  onClick={() => {
                    if (solBal <= 0.01) return;
                    setSolAmount((Math.max(0, solBal - 0.01) * (pct / 100)).toFixed(4));
                  }}
                  className="text-[10px] px-2 py-0.5 bg-zinc-800 text-green-400 rounded-lg hover:bg-zinc-700 font-bold"
                >
                  {pct}%
                </button>
              ))}
            </div>

            <div className="rounded-xl bg-black/30 border border-zinc-800 p-3 flex justify-between items-center">
              <span className="text-[10px] text-zinc-500 uppercase font-bold">You receive</span>
              <span className="text-xl font-mono text-green-400">
                {glitchOut > 0 ? glitchOut.toLocaleString() : "0"} §GLITCH
              </span>
            </div>

            {otc && glitchOut > 0 && (
              <p className="text-[10px] text-zinc-500 text-center">
                0% slippage · max {GLITCH_DAILY_SOL_LIMIT} SOL / wallet / 24h · {otc.min_purchase.toLocaleString()}–
                {otc.max_purchase.toLocaleString()} §GLITCH per tx
              </p>
            )}

            <button
              type="button"
              disabled={busy || !otc?.enabled || glitchOut < (otc?.min_purchase ?? 100)}
              onClick={() => void buy()}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-green-600 to-emerald-500 text-white font-black text-sm disabled:opacity-45"
            >
              {busy ? "Signing…" : glitchOut > 0 ? `Buy ${glitchOut.toLocaleString()} §GLITCH` : "Enter SOL amount"}
            </button>

            {lastTx && (
              <a
                href={`https://solscan.io/tx/${lastTx}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-center text-[11px] text-green-400 hover:underline"
              >
                View last purchase on Solscan
              </a>
            )}
          </>
        )}
      </div>

      <GlitchExchangeStory treasurySol={otc ? otcTreasuryWalletSol(otc) : 0} />

      <p className="text-[10px] text-zinc-600 text-center">
        Jupiter swaps (SOL / USDC / BUDJU) live on{" "}
        <Link href="/swap" className="text-cyan-500 hover:underline">
          Swap
        </Link>
        . Selling §GLITCH is not open yet.
      </p>
    </div>
  );
}
