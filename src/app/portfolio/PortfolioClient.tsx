"use client";

import Link from "next/link";
import { useState } from "react";
import { useTraderWallet } from "@/context/TraderWalletContext";
import { fmtUsd, usdValue, useTradePrices } from "@/lib/use-trade-prices";
import { HoldingsChips } from "@/components/HoldingsChips";

const HOLDINGS = [
  { key: "usdc", symbol: "USDC", label: "USDC" },
  { key: "sol", symbol: "SOL", label: "SOL" },
  { key: "budju", symbol: "BUDJU", label: "$BUDJU" },
  { key: "glitch", symbol: "GLITCH", label: "§GLITCH" },
] as const;

function fmtAmount(n: number, max = 6) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  return n.toLocaleString(undefined, { maximumFractionDigits: max });
}

export default function PortfolioClient() {
  const trader = useTraderWallet();
  const { prices, loading: pricesLoading } = useTradePrices(!!trader.wallet);
  const [chipFilter, setChipFilter] = useState<string | null>(null);
  const b = trader.eligibility?.balances;

  if (!trader.wallet) {
    return (
      <div className="max-w-2xl mx-auto rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 text-center">
        <p className="text-4xl mb-3">{"\u{1F45B}"}</p>
        <h1 className="text-xl font-black text-white">Portfolio</h1>
        <p className="text-zinc-400 text-sm mt-2">Connect wallet (top right) to see holdings.</p>
      </div>
    );
  }

  let netUsd = 0;
  if (b) {
    for (const h of HOLDINGS) {
      const amt = b[h.key];
      const v = usdValue(amt, h.symbol, prices);
      if (v != null) netUsd += v;
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="rounded-2xl border border-zinc-800 bg-[#12121a] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-green-400 uppercase tracking-wider">
                ● Connected
              </span>
              <span className="text-xs font-mono text-cyan-300">{trader.trunc}</span>
            </div>
            <p className="text-3xl font-black text-white mt-2">
              {pricesLoading ? "…" : fmtUsd(netUsd)}
            </p>
            <p className="text-xs text-zinc-500 mt-1">Estimated net worth (Jupiter USD prices)</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => trader.refresh()}
              className="px-3 py-1.5 rounded-lg border border-zinc-700 text-xs text-zinc-400 hover:text-cyan-300"
            >
              Refresh
            </button>
            <Link
              href="/send"
              className="px-3 py-1.5 rounded-lg border border-zinc-700 text-xs text-zinc-300 hover:border-lime-500/40 hover:text-lime-300"
            >
              Send
            </Link>
            <Link
              href="/swap"
              className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-600/80 to-cyan-600/80 text-xs font-bold text-white"
            >
              Swap
            </Link>
          </div>
        </div>
        <div className="mt-4">
          <HoldingsChips
            activeSymbol={chipFilter}
            onSelect={(s) => setChipFilter((prev) => (prev === s ? null : s))}
            size="sm"
          />
        </div>
        {!trader.eligible && (
          <p className="text-amber-500/90 text-xs mt-3 border-t border-zinc-800 pt-3">
            Swap locked — need {(trader.eligibility?.budju_required ?? 1_000_000).toLocaleString()} $BUDJU
            on-chain.
          </p>
        )}
      </div>

      <div className="flex border-b border-zinc-800 text-sm">
        <span className="px-4 py-2 font-bold text-white border-b-2 border-cyan-400">Positions</span>
        <span className="px-4 py-2 text-zinc-600 cursor-not-allowed" title="Coming later">
          Activity
        </span>
      </div>

      <div className="rounded-2xl border border-zinc-800 overflow-hidden">
        <div className="px-4 py-3 border-b border-zinc-800 flex justify-between text-[10px] uppercase text-zinc-500 font-semibold">
          <span>Holdings</span>
          <span>Value</span>
        </div>
        <ul className="divide-y divide-zinc-800/80">
          {HOLDINGS.filter((h) => !chipFilter || h.symbol === chipFilter).map((h) => {
            const amt = b?.[h.key] ?? 0;
            const val = usdValue(amt, h.symbol, prices);
            return (
              <li key={h.key} className="px-4 py-3 flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-bold text-white">{h.label}</p>
                  <p className="text-xs text-zinc-500 font-mono mt-0.5">
                    {fmtAmount(amt)} {h.symbol}
                  </p>
                </div>
                <p className="text-sm text-zinc-300">{fmtUsd(val)}</p>
              </li>
            );
          })}
        </ul>
      </div>

      {!trader.eligibility?.helius_enabled && (
        <p className="text-[10px] text-amber-600 text-center">
          Balance reader may be on RPC fallback — refresh if numbers look wrong.
        </p>
      )}

      <p className="text-[10px] text-zinc-600 text-center">
        Persona treasury &amp; bot ops →{" "}
        <Link href="/ops" className="text-purple-400 hover:underline">
          Ops
        </Link>{" "}
        (admin wallet or password)
      </p>
    </div>
  );
}
