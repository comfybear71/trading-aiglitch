"use client";

import {
  getTokenWarnings,
  warningsLabel,
  warningsModalTitle,
  type TokenWarning,
} from "@/lib/trade-token-warnings";
import { GLITCH_MINT, BUDJU_MINT } from "@/lib/trade-tokens";

export function TokenWarningsBadge({
  symbol,
  onOpen,
}: {
  symbol: string;
  onOpen: () => void;
}) {
  const warnings = getTokenWarnings(symbol);
  if (warnings.length === 0) return null;

  const badgeClass =
    symbol === "GLITCH"
      ? "text-red-400 hover:text-red-300"
      : symbol === "BUDJU"
        ? "text-amber-400 hover:text-amber-300"
        : "text-red-400 hover:text-red-300";

  return (
    <button
      type="button"
      onClick={onOpen}
      className={`text-[11px] font-semibold underline decoration-dotted underline-offset-2 ${badgeClass}`}
    >
      ⚠ {warningsLabel(warnings.length)}
    </button>
  );
}

export function TokenWarningsModal({
  symbol,
  open,
  onClose,
}: {
  symbol: string;
  open: boolean;
  onClose: () => void;
}) {
  const warnings = getTokenWarnings(symbol);
  if (!open || warnings.length === 0) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div
        className="w-full max-w-md max-h-[85vh] overflow-y-auto rounded-2xl border border-zinc-700 bg-[#12121a] shadow-2xl"
        role="dialog"
        aria-labelledby="warnings-title"
      >
        <div className="sticky top-0 flex items-center justify-between border-b border-zinc-800 bg-[#12121a] px-4 py-3">
          <h2 id="warnings-title" className="text-sm font-bold text-white">
            {warningsModalTitle(symbol, warnings.length)}
          </h2>
          <button type="button" onClick={onClose} className="text-zinc-500 hover:text-white text-xl">
            ×
          </button>
        </div>
        <ul className="p-3 space-y-2">
          {warnings.map((w) => (
            <WarningCard key={w.id} warning={w} />
          ))}
        </ul>
        {(symbol === "GLITCH" || symbol === "BUDJU") && (
          <p className="px-4 pb-1 text-[10px] text-zinc-500 font-mono break-all">
            Mint: {symbol === "GLITCH" ? GLITCH_MINT : BUDJU_MINT}
          </p>
        )}
        <p className="px-4 pb-4 text-[10px] text-zinc-600">
          {symbol === "GLITCH"
            ? "Jupiter shows the same JupShield set for this mint on jup.ag. Large §GLITCH moves may still be easier via aiglitch.app/exchange OTC."
            : symbol === "BUDJU"
              ? "Jupiter shows the same three JupShield warnings for $BUDJU on jup.ag."
              : "Review before swapping. Swap at your own risk."}
        </p>
      </div>
    </div>
  );
}

function WarningCard({ warning }: { warning: TokenWarning }) {
  return (
    <li
      className={`rounded-xl border px-3 py-2.5 ${
        warning.critical
          ? "border-red-500/40 bg-red-950/40"
          : "border-zinc-800 bg-zinc-900/50"
      }`}
    >
      <p className={`text-xs font-bold ${warning.critical ? "text-red-300" : "text-zinc-200"}`}>
        {warning.title}
      </p>
      {warning.subtitle && (
        <p className="text-[10px] text-zinc-500 mt-0.5">{warning.subtitle}</p>
      )}
      <p className="text-[11px] text-zinc-400 mt-1 leading-snug">{warning.body}</p>
    </li>
  );
}
