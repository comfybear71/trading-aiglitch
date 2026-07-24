"use client";

import type { ReactNode } from "react";
import { fmtUsd, usdValue, type TradePrices } from "@/lib/use-trade-prices";
import { TokenWarningsBadge } from "@/components/TokenWarningsModal";

const FREQUENCIES = ["1 minute", "5 minutes", "1 hour", "1 day"] as const;

export function SwapRecurringPanel({
  inputSymbol,
  outputSymbol,
  amount,
  onAmountChange,
  payBalance,
  receiveBalance,
  onPayFraction,
  onInputSymbolChange,
  onOutputSymbolChange,
  inputOptions,
  outputOptions,
  frequency,
  onFrequencyChange,
  suborders,
  onSubordersChange,
  prices,
  onOpenSettings,
  onOpenWarnings,
}: {
  inputSymbol: string;
  outputSymbol: string;
  amount: string;
  onAmountChange: (v: string) => void;
  payBalance: number;
  receiveBalance: number;
  onPayFraction: (f: number) => void;
  onInputSymbolChange: (s: string) => void;
  onOutputSymbolChange: (s: string) => void;
  inputOptions: string[];
  outputOptions: string[];
  frequency: string;
  onFrequencyChange: (v: string) => void;
  suborders: number;
  onSubordersChange: (n: number) => void;
  prices: TradePrices;
  onOpenSettings: () => void;
  onOpenWarnings: (symbol: string) => void;
}) {
  const totalNum = Number(amount) || 0;
  const perOrder = suborders > 0 ? totalNum / suborders : 0;
  const summary =
    totalNum > 0 && suborders > 0
      ? `Swap ${perOrder.toLocaleString(undefined, { maximumFractionDigits: 6 })} ${inputSymbol} to ${outputSymbol} every ${frequency} over ${suborders} round${suborders === 1 ? "" : "s"} (${totalNum.toLocaleString(undefined, { maximumFractionDigits: 6 })} ${inputSymbol} total).`
      : `Set allocate amount and suborders to preview your DCA schedule.`;

  return (
    <div className="rounded-2xl border border-zinc-800 bg-[#12121a] overflow-hidden">
      <AllocateRow
        label="Allocate"
        symbol={inputSymbol}
        balance={payBalance}
        amount={amount}
        onAmountChange={onAmountChange}
        onSymbolChange={onInputSymbolChange}
        symbolOptions={inputOptions}
        usdHint={fmtUsd(usdValue(totalNum, inputSymbol, prices))}
        onHalf={() => onPayFraction(0.5)}
        onMax={() => onPayFraction(1)}
        warningSlot={
          <TokenWarningsBadge symbol={inputSymbol} onOpen={() => onOpenWarnings(inputSymbol)} />
        }
      />

      <AllocateRow
        label="To buy"
        symbol={outputSymbol}
        balance={receiveBalance}
        amount="—"
        readOnlyAmount
        onSymbolChange={onOutputSymbolChange}
        symbolOptions={outputOptions}
        warningSlot={
          <TokenWarningsBadge symbol={outputSymbol} onOpen={() => onOpenWarnings(outputSymbol)} />
        }
      />

      <div className="px-4 py-3 border-t border-zinc-800/80 grid grid-cols-2 gap-3">
        <label className="block">
          <span className="text-[10px] text-zinc-500 uppercase tracking-wide">Frequency</span>
          <select
            value={frequency}
            onChange={(e) => onFrequencyChange(e.target.value)}
            className="mt-1 w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-sm text-white"
          >
            {FREQUENCIES.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="text-[10px] text-zinc-500 uppercase tracking-wide">Total suborders</span>
          <input
            type="number"
            min={1}
            max={999}
            value={suborders}
            onChange={(e) => onSubordersChange(Math.max(1, Number(e.target.value) || 1))}
            className="mt-1 w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-sm text-white"
          />
        </label>
      </div>

      <div className="px-4 pb-2">
        <p className="text-[10px] text-zinc-500 uppercase tracking-wide mb-1">USD price range (optional)</p>
        <div className="flex items-center gap-2 text-sm text-zinc-600">
          <input
            disabled
            placeholder="$0.00"
            className="flex-1 bg-zinc-950/50 border border-zinc-800 rounded-lg px-2 py-1.5"
          />
          <span>–</span>
          <input
            disabled
            placeholder="$0.00"
            className="flex-1 bg-zinc-950/50 border border-zinc-800 rounded-lg px-2 py-1.5"
          />
        </div>
        <p className="text-[10px] text-zinc-600 mt-1">Smart DCA (V2+) — enabled when vault ships</p>
      </div>

      <div className="mx-4 mb-3 rounded-xl border border-zinc-800 bg-zinc-950/40 px-3 py-2.5 text-[11px] text-zinc-400 leading-snug">
        {summary}
      </div>

      <div className="p-4 pt-0 space-y-3">
        <button
          type="button"
          disabled
          className="w-full py-3.5 rounded-xl bg-lime-500/20 border border-lime-500/40 text-lime-300/80 font-bold text-sm cursor-not-allowed"
        >
          Recurring orders — coming soon
        </button>
        <p className="text-[10px] text-zinc-600 text-center">
          Needs one-time vault signature (like jup.ag). Use{" "}
          <a
            href="https://jup.ag/swap"
            target="_blank"
            rel="noopener noreferrer"
            className="text-cyan-500 hover:underline"
          >
            jup.ag Recurring
          </a>{" "}
          for live DCA until we ship Smart DCA.
        </p>
      </div>

      <details className="border-t border-zinc-800/80">
        <summary className="px-4 py-2 text-[11px] text-zinc-500 cursor-pointer hover:text-zinc-300">
          Recurring summary
        </summary>
        <div className="px-4 pb-3 text-[11px] space-y-1 text-zinc-400">
          <SummaryLine label="Sell total" value={totalNum > 0 ? `${amount} ${inputSymbol}` : "—"} />
          <SummaryLine
            label="Sell per suborder"
            value={
              perOrder > 0
                ? `${perOrder.toLocaleString(undefined, { maximumFractionDigits: 6 })} ${inputSymbol}`
                : "—"
            }
          />
          <SummaryLine label="To buy" value={outputSymbol} />
          <SummaryLine label="Suborder interval" value={frequency} />
          <SummaryLine label="Platform fee" value="0.2% (est., when live)" />
        </div>
      </details>

      <div className="px-4 pb-3 flex justify-end">
        <button
          type="button"
          onClick={onOpenSettings}
          className="text-[10px] text-zinc-500 hover:text-lime-400 flex items-center gap-1"
        >
          <span aria-hidden>⚙</span> DCA V2+ info
        </button>
      </div>
    </div>
  );
}

function SummaryLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-2">
      <span>{label}</span>
      <span className="text-zinc-200">{value}</span>
    </div>
  );
}

function AllocateRow({
  label,
  symbol,
  balance,
  amount,
  onAmountChange,
  onSymbolChange,
  symbolOptions,
  usdHint,
  onHalf,
  onMax,
  readOnlyAmount,
  warningSlot,
}: {
  label: string;
  symbol: string;
  balance: number;
  amount: string;
  onAmountChange?: (v: string) => void;
  onSymbolChange: (s: string) => void;
  symbolOptions: string[];
  usdHint?: string | null;
  onHalf?: () => void;
  onMax?: () => void;
  readOnlyAmount?: boolean;
  warningSlot?: ReactNode;
}) {
  return (
    <div className="p-4 border-b border-zinc-800/80">
      <div className="flex justify-between text-xs text-zinc-500 mb-2">
        <span>{label}</span>
        <span className="font-mono text-[10px]">{balance.toLocaleString(undefined, { maximumFractionDigits: 4 })} {symbol}</span>
      </div>
      <div className="flex items-start gap-3">
        <div>
          <select
            value={symbol}
            onChange={(e) => onSymbolChange(e.target.value)}
            className="bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-sm font-bold text-white"
          >
            {symbolOptions.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          {warningSlot && <div className="mt-1">{warningSlot}</div>}
        </div>
        <div className="flex-1 text-right">
          {!readOnlyAmount && onHalf && onMax && (
            <div className="flex justify-end gap-1 mb-1">
              <button type="button" onClick={onHalf} className="text-[10px] font-bold text-zinc-500 hover:text-cyan-300">
                HALF
              </button>
              <button type="button" onClick={onMax} className="text-[10px] font-bold text-zinc-500 hover:text-cyan-300">
                MAX
              </button>
            </div>
          )}
          <input
            type="text"
            readOnly={readOnlyAmount}
            value={amount}
            onChange={onAmountChange ? (e) => onAmountChange(e.target.value) : undefined}
            placeholder="0"
            className="w-full bg-transparent text-right text-2xl font-semibold text-white focus:outline-none"
          />
          {usdHint && <p className="text-[10px] text-zinc-500">{usdHint}</p>}
        </div>
      </div>
    </div>
  );
}
