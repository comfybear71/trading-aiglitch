"use client";

import type { RouteStepDisplay } from "@/lib/swap-quote";

export function SwapRoutingModal({
  open,
  onClose,
  sellSymbol,
  buySymbol,
  sellAmount,
  buyAmount,
  steps,
}: {
  open: boolean;
  onClose: () => void;
  sellSymbol: string;
  buySymbol: string;
  sellAmount: string;
  buyAmount: string;
  steps: RouteStepDisplay[];
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div
        className="w-full max-w-lg rounded-2xl border border-zinc-700 bg-[#12121a] shadow-2xl"
        role="dialog"
        aria-labelledby="routing-title"
      >
        <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-3">
          <h2 id="routing-title" className="text-sm font-bold text-white">
            Routing
          </h2>
          <button type="button" onClick={onClose} className="text-zinc-500 hover:text-white text-xl">
            ×
          </button>
        </div>

        <div className="px-4 py-3 border-b border-zinc-800/80">
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
            <TokenPill symbol={sellSymbol} amount={sellAmount} />
            <span className="text-zinc-600">→</span>
            <TokenPill symbol={buySymbol} amount={buyAmount} />
          </div>
        </div>

        <div className="p-4 space-y-4">
          {steps.length === 0 ? (
            <p className="text-sm text-zinc-500 text-center">No route details in quote.</p>
          ) : (
            steps.map((step, i) => (
              <div key={`${step.venue}-${i}`} className="relative pl-1">
                {i > 0 && (
                  <div className="absolute left-5 -top-3 h-3 w-px bg-zinc-700" aria-hidden />
                )}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-bold text-zinc-500 w-8">{step.percent}%</span>
                  <span className="text-xs font-semibold text-zinc-300">
                    {step.inputSymbol} → {step.outputSymbol}
                  </span>
                </div>
                <p className="ml-10 mt-1 text-[11px] text-cyan-500/90">{step.venue}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function TokenPill({ symbol, amount }: { symbol: string; amount: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-700 bg-zinc-900/80 px-2.5 py-1">
      <span className="text-[10px] font-bold text-white">{symbol}</span>
      <span className="text-[10px] text-zinc-400 font-mono truncate max-w-[140px]">{amount}</span>
    </span>
  );
}
