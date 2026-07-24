"use client";

import { useMemo, useState } from "react";
import { VersionedTransaction } from "@solana/web3.js";
import { useTraderWallet } from "@/context/TraderWalletContext";
import { getPhantom } from "@/lib/phantom";
import { TRADE_SWAP_TOKENS } from "@/lib/trade-tokens";

function toAtomic(amount: string, decimals: number): string {
  const n = Number(amount);
  if (!Number.isFinite(n) || n <= 0) return "0";
  return Math.floor(n * 10 ** decimals).toString();
}

function fmtCompact(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString(undefined, { maximumFractionDigits: 4 });
}

export default function SwapClient() {
  const trader = useTraderWallet();
  const [inputSymbol, setInputSymbol] = useState("BUDJU");
  const [outputSymbol, setOutputSymbol] = useState("SOL");
  const [amount, setAmount] = useState("");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [quoteOut, setQuoteOut] = useState<string | null>(null);

  const inputToken = TRADE_SWAP_TOKENS.find((t) => t.symbol === inputSymbol)!;
  const outputToken = TRADE_SWAP_TOKENS.find((t) => t.symbol === outputSymbol)!;

  const outputOptions = useMemo(
    () => TRADE_SWAP_TOKENS.filter((t) => t.symbol !== inputSymbol),
    [inputSymbol],
  );

  const flip = () => {
    setInputSymbol(outputSymbol);
    setOutputSymbol(inputSymbol);
    setQuoteOut(null);
  };

  const runSwap = async () => {
    if (!trader.wallet || !trader.eligible) return;
    setBusy(true);
    setStatus(null);
    setQuoteOut(null);
    try {
      const atomic = toAtomic(amount, inputToken.decimals);
      if (atomic === "0") throw new Error("Enter a valid amount");

      const qRes = await fetch(
        `/api/trade/jupiter/quote?inputMint=${inputToken.mint}&outputMint=${outputToken.mint}&amount=${atomic}&slippageBps=100`,
      );
      const qData = await qRes.json();
      if (!qRes.ok) throw new Error(qData.error || "Quote failed");

      const outHuman =
        Number(qData.quote.outAmount) / 10 ** outputToken.decimals;
      setQuoteOut(`${fmtCompact(outHuman)} ${outputSymbol}`);

      const sRes = await fetch("/api/trade/jupiter/swap", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          quoteResponse: qData.quote,
          userPublicKey: trader.wallet,
        }),
      });
      const sData = await sRes.json();
      if (!sRes.ok) throw new Error(sData.error || "Swap build failed");

      const phantom = getPhantom();
      if (!phantom) throw new Error("Phantom not available");

      const raw = atob(sData.swapTransaction);
      const bytes = new Uint8Array(raw.length);
      for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
      const tx = VersionedTransaction.deserialize(bytes);
      const { signature } = await phantom.signAndSendTransaction(tx);
      setStatus(`Sent · ${signature.slice(0, 8)}…`);
      await trader.refresh();
    } catch (e) {
      setStatus(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  if (!trader.wallet) {
    return (
      <GatePanel title="Swap" message="Connect Phantom in the sidebar to swap on our homegrown lane (BUDJU · GLITCH · SOL · USDC)." />
    );
  }

  if (!trader.eligible) {
    return (
      <GatePanel
        title="Swap locked"
        message={`You have ${fmtCompact(trader.eligibility?.budju_balance ?? 0)} $BUDJU. Need ${(trader.eligibility?.budju_required ?? 10_000_000).toLocaleString()} to unlock swaps.`}
      />
    );
  }

  return (
    <div className="max-w-md mx-auto space-y-4">
      <div className="rounded-2xl border border-cyan-500/25 bg-gradient-to-br from-purple-950/30 to-cyan-950/20 p-5">
        <h1 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
          Swap
        </h1>
        <p className="text-zinc-400 text-xs mt-1">Low-fee priority · allowed tokens only · you sign in Phantom</p>
      </div>

      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4 space-y-3">
        <label className="block text-[10px] text-zinc-500 uppercase">You pay</label>
        <div className="flex gap-2">
          <select
            value={inputSymbol}
            onChange={(e) => {
              setInputSymbol(e.target.value);
              setQuoteOut(null);
            }}
            className="bg-zinc-950 border border-zinc-700 rounded-lg px-2 py-2 text-sm text-white"
          >
            {TRADE_SWAP_TOKENS.map((t) => (
              <option key={t.symbol} value={t.symbol}>
                {t.symbol}
              </option>
            ))}
          </select>
          <input
            type="text"
            inputMode="decimal"
            placeholder="0.0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="flex-1 bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white"
          />
        </div>

        <button type="button" onClick={flip} className="w-full text-center text-zinc-500 hover:text-cyan-400 text-lg">
          ↕
        </button>

        <label className="block text-[10px] text-zinc-500 uppercase">You receive</label>
        <select
          value={outputSymbol}
          onChange={(e) => setOutputSymbol(e.target.value)}
          className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white"
        >
          {outputOptions.map((t) => (
            <option key={t.symbol} value={t.symbol}>
              {t.symbol}
            </option>
          ))}
        </select>
        {quoteOut && <p className="text-xs text-green-400">Est. output: {quoteOut}</p>}

        <button
          type="button"
          disabled={busy || !amount}
          onClick={runSwap}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-bold text-sm disabled:opacity-40"
        >
          {busy ? "Swapping…" : "Review & swap in Phantom"}
        </button>
        {status && <p className="text-xs text-zinc-400 break-all">{status}</p>}
      </div>

      <p className="text-[10px] text-zinc-600 text-center">
        More tokens via Jupiter — later. §GLITCH OTC on{" "}
        <a href="https://aiglitch.app/exchange" className="text-purple-400 hover:underline">
          aiglitch.app/exchange
        </a>
      </p>
    </div>
  );
}

function GatePanel({ title, message }: { title: string; message: string }) {
  return (
    <div className="max-w-md mx-auto rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 text-center">
      <p className="text-4xl mb-3">{"\u{21C4}"}</p>
      <h1 className="text-lg font-black text-white">{title}</h1>
      <p className="text-zinc-400 text-sm mt-2">{message}</p>
    </div>
  );
}
