"use client";

import { useEffect, useState } from "react";
import { VersionedTransaction } from "@solana/web3.js";
import { useTraderWallet } from "@/context/TraderWalletContext";
import { useTradeToast } from "@/context/TradeToastContext";
import { truncWallet } from "@/lib/phantom";
import { phantomSignAndSubmit } from "@/lib/phantom-submit";
import { TRADE_SWAP_TOKENS } from "@/lib/trade-tokens";
import {
  balanceForSymbol,
  formatSwapAmount,
  maxPayAmount,
} from "@/lib/trade-balance";
import { fmtUsd, usdValue, useTradePrices } from "@/lib/use-trade-prices";
import { appendSendHistory, loadSendHistory, type SendHistoryEntry } from "@/lib/send-history";
import { HoldingsChips } from "@/components/HoldingsChips";
import { MagicLinkSendPanel } from "@/components/MagicLinkSendPanel";

type MainTab = "send" | "receive";
type SendMode = "transfer" | "magic";

function toAtomic(amount: string, decimals: number): string {
  const n = Number(amount);
  if (!Number.isFinite(n) || n <= 0) return "0";
  return Math.floor(n * 10 ** decimals).toString();
}

function looksLikeAddress(s: string): boolean {
  return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(s.trim());
}

export default function SendClient() {
  const trader = useTraderWallet();
  const { pushToast } = useTradeToast();
  const { prices } = useTradePrices(!!trader.wallet);
  const [mainTab, setMainTab] = useState<MainTab>("send");
  const [sendMode, setSendMode] = useState<SendMode>("transfer");
  const [symbol, setSymbol] = useState("USDC");
  const [amount, setAmount] = useState("");
  const [recipient, setRecipient] = useState("");
  const [busy, setBusy] = useState(false);
  const [activity, setActivity] = useState<SendHistoryEntry[]>([]);
  const [chipFilter, setChipFilter] = useState<string | null>(null);

  const token = TRADE_SWAP_TOKENS.find((t) => t.symbol === symbol)!;
  const balance = balanceForSymbol(trader.eligibility, symbol);

  useEffect(() => {
    setActivity(loadSendHistory());
  }, []);

  const setFraction = (f: number) => {
    const raw = f >= 1 ? maxPayAmount(symbol, balance) : balance * f;
    setAmount(formatSwapAmount(raw, token.decimals));
  };

  const runSend = async () => {
    if (!trader.wallet) return;
    const to = recipient.trim();
    if (!looksLikeAddress(to)) {
      pushToast("Enter a valid Solana recipient address", "error");
      return;
    }
    const atomic = toAtomic(amount, token.decimals);
    if (atomic === "0") {
      pushToast("Enter an amount", "error");
      return;
    }

    setBusy(true);
    try {
      const res = await fetch("/api/trade/transfer", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          fromPublicKey: trader.wallet,
          toPublicKey: to,
          symbol,
          amountAtomic: atomic,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Transfer build failed");

      const raw = atob(data.transaction);
      const bytes = new Uint8Array(raw.length);
      for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
      const tx = VersionedTransaction.deserialize(bytes);
      const signature = await phantomSignAndSubmit(tx);

      appendSendHistory({
        signature,
        symbol,
        amount,
        toTrunc: truncWallet(to),
      });
      setActivity(loadSendHistory());
      pushToast(`Sent · ${signature.slice(0, 8)}…`, "success", `https://solscan.io/tx/${signature}`);
      setAmount("");
      setRecipient("");
      await trader.refresh();
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      pushToast(msg, "error");
    } finally {
      setBusy(false);
    }
  };

  const copyAddress = async () => {
    if (!trader.wallet) return;
    await navigator.clipboard.writeText(trader.wallet);
    pushToast("Address copied", "success");
  };

  const shareAddress = async () => {
    if (!trader.wallet) return;
    if (navigator.share) {
      await navigator.share({ title: "AIG!itch Trade deposit", text: trader.wallet });
    } else {
      await copyAddress();
    }
  };

  const qrUrl = trader.wallet
    ? `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(trader.wallet)}`
    : null;

  if (!trader.wallet) {
    return (
      <div className="max-w-lg mx-auto rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 text-center">
        <h1 className="text-xl font-black text-white">Send &amp; Receive</h1>
        <p className="text-zinc-400 text-sm mt-2">Connect wallet (top right) to send or show your deposit address.</p>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto space-y-4">
      <div className="flex border-b border-zinc-800 text-sm">
        {(
          [
            ["send", "Send"],
            ["receive", "Receive"],
          ] as const
        ).map(([tab, label]) => (
          <button
            key={tab}
            type="button"
            onClick={() => setMainTab(tab)}
            className={`flex-1 py-2.5 font-bold transition-colors ${
              mainTab === tab
                ? "text-lime-300 border-b-2 border-lime-400"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <HoldingsChips
        activeSymbol={chipFilter}
        onSelect={(s) => {
          setChipFilter((prev) => (prev === s ? null : s));
          if (mainTab === "send") setSymbol(s);
        }}
        size="sm"
      />

      {mainTab === "receive" ? (
        <div className="rounded-2xl border border-zinc-800 bg-[#12121a] p-6 text-center space-y-4">
          <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Deposit address</p>
          {qrUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={qrUrl} alt="Wallet QR code" className="mx-auto rounded-xl border border-zinc-700 bg-white p-2" width={240} height={240} />
          )}
          <p className="text-xs font-mono text-cyan-300 break-all leading-relaxed">{trader.wallet}</p>
          <p className="text-[11px] text-zinc-500 leading-snug max-w-sm mx-auto">
            Deposit assets using the Solana blockchain only. Assets sent from other blockchains will be lost.
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => void shareAddress()}
              className="flex-1 py-2 rounded-xl border border-zinc-700 text-xs text-zinc-300 hover:border-zinc-500"
            >
              Share
            </button>
            <button
              type="button"
              onClick={() => void copyAddress()}
              className="flex-1 py-2 rounded-xl border border-zinc-700 text-xs text-zinc-300 hover:border-zinc-500"
            >
              Copy
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex gap-2 text-[10px]">
            <button
              type="button"
              onClick={() => setSendMode("transfer")}
              className={`px-2 py-1 rounded-lg font-bold border ${
                sendMode === "transfer"
                  ? "bg-cyan-500/15 text-cyan-300 border-cyan-500/30"
                  : "text-zinc-600 border-zinc-800"
              }`}
            >
              Transfer
            </button>
            <button
              type="button"
              onClick={() => setSendMode("magic")}
              className={`px-2 py-1 rounded-lg font-bold border ${
                sendMode === "magic"
                  ? "bg-purple-500/15 text-purple-300 border-purple-500/30"
                  : "text-zinc-600 border-zinc-800"
              }`}
            >
              Magic Link
            </button>
          </div>

          {sendMode === "magic" ? (
            <MagicLinkSendPanel symbol={symbol} setSymbol={setSymbol} balance={balance} />
          ) : (
            <>
          <div className="rounded-2xl border border-zinc-800 bg-[#12121a] overflow-hidden">
            <p className="px-4 pt-4 text-xs text-zinc-500">Send money to any wallet address.</p>
            <div className="p-4 border-b border-zinc-800/80">
              <div className="flex justify-between text-xs text-zinc-500 mb-2">
                <select
                  value={symbol}
                  onChange={(e) => setSymbol(e.target.value)}
                  className="bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-sm font-bold text-white"
                >
                  {TRADE_SWAP_TOKENS.map((t) => (
                    <option key={t.symbol} value={t.symbol}>
                      {t.symbol}
                    </option>
                  ))}
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
            <div className="p-4">
              <label className="text-[10px] text-zinc-500 uppercase tracking-wide">To</label>
              <input
                type="text"
                placeholder="Enter recipient address"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                className="mt-1 w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2.5 text-sm font-mono text-white placeholder:text-zinc-600 focus:outline-none focus:border-cyan-500/50"
              />
            </div>
            <div className="px-4 pb-4">
              <button
                type="button"
                disabled={busy}
                onClick={() => void runSend()}
                className="w-full py-3.5 rounded-xl bg-lime-500 hover:bg-lime-400 text-black font-bold text-sm disabled:opacity-50"
              >
                {busy ? "Sending…" : "Send"}
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-[#12121a] overflow-hidden">
            <p className="px-4 py-2 text-[10px] uppercase text-zinc-500 font-semibold border-b border-zinc-800">
              Activity (this browser)
            </p>
            {activity.length === 0 ? (
              <p className="p-4 text-sm text-zinc-600 text-center">No sends yet.</p>
            ) : (
              <ul className="divide-y divide-zinc-800/80 max-h-48 overflow-y-auto">
                {activity.map((a) => (
                  <li key={a.signature} className="px-4 py-2.5 flex justify-between text-sm">
                    <span className="text-zinc-300">
                      {a.amount} {a.symbol} → {a.toTrunc}
                    </span>
                    <a
                      href={`https://solscan.io/tx/${a.signature}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] text-cyan-500 hover:underline"
                    >
                      Solscan
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
            </>
          )}
        </>
      )}

      {chipFilter && mainTab === "receive" && (
        <p className="text-[10px] text-zinc-600 text-center">
          Highlighting {chipFilter} — deposit any allowed SPL mint to this same address.
        </p>
      )}
    </div>
  );
}
