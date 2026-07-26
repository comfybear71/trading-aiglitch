"use client";

import Link from "next/link";
import { BUDJU_MINT, GLITCH_EXCHANGE_PATH, GLITCH_MINT } from "@/lib/trade-tokens";

const DEXSCREENER: Partial<Record<string, string>> = {
  BUDJU: `https://dexscreener.com/solana/${BUDJU_MINT}`,
  GLITCH: `https://dexscreener.com/solana/${GLITCH_MINT}`,
  SOL: "https://dexscreener.com/solana/so11111111111111111111111111111111111111112",
};

export function SwapChartPanel({
  sellSymbol,
  buySymbol,
}: {
  sellSymbol: string;
  buySymbol: string;
}) {
  const focus = [sellSymbol, buySymbol].includes("BUDJU")
    ? "BUDJU"
    : [sellSymbol, buySymbol].includes("GLITCH")
      ? "GLITCH"
      : sellSymbol;

  const url = DEXSCREENER[focus];

  return (
    <div className="rounded-2xl border border-zinc-800 bg-[#0a0a0f] overflow-hidden min-h-[280px]">
      <div className="px-4 py-2 border-b border-zinc-800 flex justify-between items-center text-xs text-zinc-500">
        <span>
          Chart · {sellSymbol} / {buySymbol}
        </span>
        {url && (
          <a href={url} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">
            Open DexScreener
          </a>
        )}
      </div>
      {focus === "GLITCH" ? (
        <div className="p-8 text-center text-sm text-zinc-500">
          <p className="text-zinc-400 mb-2">§GLITCH may have no active DEX chart.</p>
          <p>
            Use{" "}
            <Link href={GLITCH_EXCHANGE_PATH} className="text-purple-400 underline">
              trade.aiglitch.app/glitch
            </Link>{" "}
            for OTC §GLITCH, or swap via Jupiter routes when available.
          </p>
          {url && (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-4 text-xs text-cyan-400 underline"
            >
              Try DexScreener anyway →
            </a>
          )}
        </div>
      ) : url ? (
        <iframe
          title="DexScreener chart"
          src={`${url}?embed=1&theme=dark`}
          className="w-full h-[320px] border-0"
          sandbox="allow-scripts allow-same-origin"
        />
      ) : (
        <p className="p-8 text-center text-zinc-600 text-sm">No chart for this pair yet.</p>
      )}
    </div>
  );
}
