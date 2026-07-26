"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { VersionedTransaction } from "@solana/web3.js";
import { useTraderWallet } from "@/context/TraderWalletContext";
import { phantomSignAndSubmit } from "@/lib/phantom-submit";
import { TRADE_SWAP_TOKENS } from "@/lib/trade-tokens";
import {
  balanceForSymbol,
  formatSwapAmount,
  maxPayAmount,
} from "@/lib/trade-balance";
import { useTradeToast } from "@/context/TradeToastContext";
import { fmtUsd, usdValue, useTradePrices } from "@/lib/use-trade-prices";
import {
  DEFAULT_MAX_PRIORITY_FEE_SOL,
  DEFAULT_SLIPPAGE_BPS,
  estimateNetworkFeeSol,
  formatPct,
  formatPlatformFee,
  parseJupiterQuote,
  type TradeQuoteFeesMeta,
} from "@/lib/swap-quote";
import { recordTradeActivity } from "@/lib/trade-activity-api";
import { TokenWarningsBadge, TokenWarningsModal } from "@/components/TokenWarningsModal";
import { SwapChartPanel } from "@/components/SwapChartPanel";
import { SwapHistoryPanelKeyed } from "@/components/SwapHistoryPanel";
import { SwapRoutingModal } from "@/components/SwapRoutingModal";
import { RecurringOrderSettingsModal } from "@/components/RecurringOrderSettingsModal";
import { SwapRecurringPanel } from "@/components/SwapRecurringPanel";

type SwapMode = "market" | "limit" | "recurring";

function toAtomic(amount: string, decimals: number): string {
  const n = Number(amount);
  if (!Number.isFinite(n) || n <= 0) return "0";
  return Math.floor(n * 10 ** decimals).toString();
}

function fmtCompact(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString(undefined, { maximumFractionDigits: 6 });
}

function fmtBalance(n: number, symbol: string) {
  if (n >= 1_000_000) return `${fmtCompact(n)} ${symbol}`;
  return `${n.toLocaleString(undefined, { maximumFractionDigits: 6 })} ${symbol}`;
}

async function fetchQuote(
  inputMint: string,
  outputMint: string,
  atomic: string,
  slippageBps: number,
) {
  const qRes = await fetch(
    `/api/trade/jupiter/quote?inputMint=${inputMint}&outputMint=${outputMint}&amount=${atomic}&slippageBps=${slippageBps}`,
  );
  const qData = await qRes.json();
  if (!qRes.ok) throw new Error(qData.error || "Quote failed");
  return qData as { quote: Record<string, unknown>; fees?: TradeQuoteFeesMeta };
}

export default function SwapClient() {
  const trader = useTraderWallet();
  const { pushToast } = useTradeToast();
  const { prices } = useTradePrices(!!trader.wallet);
  const [inputSymbol, setInputSymbol] = useState("BUDJU");
  const [outputSymbol, setOutputSymbol] = useState("SOL");
  const [amount, setAmount] = useState("");
  const [slippageBps, setSlippageBps] = useState(DEFAULT_SLIPPAGE_BPS);
  const [busy, setBusy] = useState(false);
  const [quoteBusy, setQuoteBusy] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [quoteError, setQuoteError] = useState<string | null>(null);
  const [feesMeta, setFeesMeta] = useState<TradeQuoteFeesMeta | null>(null);
  const [parsedQuote, setParsedQuote] = useState<ReturnType<typeof parseJupiterQuote> | null>(
    null,
  );
  const [storedQuote, setStoredQuote] = useState<Record<string, unknown> | null>(null);
  const [showChart, setShowChart] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [warningModalSymbol, setWarningModalSymbol] = useState<string | null>(null);
  const [historyRefreshKey, setHistoryRefreshKey] = useState(0);
  const [routingOpen, setRoutingOpen] = useState(false);
  const [swapMode, setSwapMode] = useState<SwapMode>("market");
  const [recurringSettingsOpen, setRecurringSettingsOpen] = useState(false);
  const [dcaFrequency, setDcaFrequency] = useState("1 minute");
  const [dcaSuborders, setDcaSuborders] = useState(2);
  const quoteGen = useRef(0);

  const inputToken = TRADE_SWAP_TOKENS.find((t) => t.symbol === inputSymbol)!;
  const outputToken = TRADE_SWAP_TOKENS.find((t) => t.symbol === outputSymbol)!;
  const payBalance = balanceForSymbol(trader.eligibility, inputSymbol);
  const receiveBalance = balanceForSymbol(trader.eligibility, outputSymbol);
  const maxPrioritySol = feesMeta?.maxPriorityFeeSol ?? DEFAULT_MAX_PRIORITY_FEE_SOL;

  const setPayFraction = (fraction: number) => {
    const raw = fraction >= 1 ? maxPayAmount(inputSymbol, payBalance) : payBalance * fraction;
    setAmount(formatSwapAmount(raw, inputToken.decimals));
    setParsedQuote(null);
    setStoredQuote(null);
  };

  const outputOptions = useMemo(
    () => TRADE_SWAP_TOKENS.filter((t) => t.symbol !== inputSymbol),
    [inputSymbol],
  );

  const flip = () => {
    setInputSymbol(outputSymbol);
    setOutputSymbol(inputSymbol);
    setAmount("");
    setParsedQuote(null);
    setStoredQuote(null);
  };

  useEffect(() => {
    if (swapMode !== "market") return;
    if (!trader.wallet || !trader.eligible) return;
    const atomic = toAtomic(amount, inputToken.decimals);
    if (atomic === "0") {
      setParsedQuote(null);
      setStoredQuote(null);
      setQuoteError(null);
      setFeesMeta(null);
      return;
    }

    const gen = ++quoteGen.current;
    setQuoteBusy(true);
    setQuoteError(null);
    const t = window.setTimeout(async () => {
      try {
        const qData = await fetchQuote(
          inputToken.mint,
          outputToken.mint,
          atomic,
          slippageBps,
        );
        if (gen !== quoteGen.current) return;
        setFeesMeta(qData.fees ?? null);
        setStoredQuote(qData.quote);
        setParsedQuote(
          parseJupiterQuote(
            qData.quote,
            inputToken.decimals,
            outputToken.decimals,
            inputSymbol,
            outputSymbol,
            qData.fees,
          ),
        );
      } catch (e) {
        if (gen !== quoteGen.current) return;
        setQuoteError(e instanceof Error ? e.message : String(e));
        setParsedQuote(null);
        setStoredQuote(null);
      } finally {
        if (gen === quoteGen.current) setQuoteBusy(false);
      }
    }, 450);

    return () => window.clearTimeout(t);
  }, [
    amount,
    inputToken.mint,
    inputToken.decimals,
    outputToken.mint,
    outputToken.decimals,
    slippageBps,
    inputSymbol,
    outputSymbol,
    trader.wallet,
    trader.eligible,
    swapMode,
  ]);

  const runSwap = async () => {
    if (!trader.wallet || !trader.eligible) return;
    setBusy(true);
    setStatus(null);
    try {
      const atomic = toAtomic(amount, inputToken.decimals);
      if (atomic === "0") throw new Error("Enter a valid amount");

      const qData = await fetchQuote(
        inputToken.mint,
        outputToken.mint,
        atomic,
        slippageBps,
      );
      const quote = qData.quote;
      const qDataFees = qData.fees ?? null;
      setFeesMeta(qDataFees);
      setStoredQuote(quote);
      const parsedForHistory = parseJupiterQuote(
        quote,
        inputToken.decimals,
        outputToken.decimals,
        inputSymbol,
        outputSymbol,
        qDataFees,
      );
      setParsedQuote(parsedForHistory);

      const sRes = await fetch("/api/trade/jupiter/swap", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          quoteResponse: quote,
          userPublicKey: trader.wallet,
        }),
      });
      const sData = await sRes.json();
      if (!sRes.ok) throw new Error(sData.error || "Swap build failed");

      const raw = atob(sData.swapTransaction);
      const bytes = new Uint8Array(raw.length);
      for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
      const tx = VersionedTransaction.deserialize(bytes);
      const signature = await phantomSignAndSubmit(tx);
      const outHuman = parsedForHistory.outHuman;
      void recordTradeActivity({
        wallet: trader.wallet,
        kind: "swap",
        signature,
        detail: `${amount} ${inputSymbol} → ${formatSwapAmount(outHuman, outputToken.decimals)} ${outputSymbol}`,
      });
      setHistoryRefreshKey((k) => k + 1);
      setStatus(`Sent · ${signature.slice(0, 8)}…`);
      pushToast(
        `Swap submitted · ${signature.slice(0, 8)}…`,
        "success",
        `https://solscan.io/tx/${signature}`,
      );
      setAmount("");
      setParsedQuote(null);
      setStoredQuote(null);
      await trader.refresh();
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setStatus(msg);
      pushToast(msg, "error");
    } finally {
      setBusy(false);
    }
  };

  const hasAmount = amount.trim() !== "" && toAtomic(amount, inputToken.decimals) !== "0";
  const ctaLabel = !hasAmount
    ? "Enter an amount"
    : quoteBusy
      ? "Fetching quote…"
      : busy
        ? "Swapping…"
        : parsedQuote
          ? `Swap ${inputSymbol} for ${outputSymbol}`
          : "Enter an amount";

  if (!trader.wallet) {
    return (
      <GatePanel title="Swap" message="Use Connect (top right) — Phantom or QR — to swap BUDJU · GLITCH · SOL · USDC." />
    );
  }

  if (!trader.eligible) {
    return (
      <GatePanel
        title="Swap locked"
        message={`You have ${fmtCompact(trader.eligibility?.budju_balance ?? 0)} $BUDJU. Need ${(trader.eligibility?.budju_required ?? 1_000_000).toLocaleString()} to unlock swaps.`}
      />
    );
  }

  const swapColumn = (
    <>
      <div className="flex items-center gap-1 text-xs border-b border-zinc-800 pb-2 flex-wrap">
        {(
          [
            ["market", "Market"],
            ["limit", "Limit"],
            ["recurring", "Recurring"],
          ] as const
        ).map(([mode, label]) => (
          <button
            key={mode}
            type="button"
            onClick={() => setSwapMode(mode)}
            className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
              swapMode === mode
                ? mode === "recurring"
                  ? "bg-lime-500/15 text-lime-300 border border-lime-500/30"
                  : "bg-zinc-800 text-white"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            {label}
          </button>
        ))}
        {swapMode === "recurring" ? (
          <button
            type="button"
            onClick={() => setRecurringSettingsOpen(true)}
            className="ml-auto flex items-center gap-1 px-2 py-1 rounded-lg border border-zinc-700 text-[10px] text-zinc-400 hover:border-lime-500/40 hover:text-lime-300"
          >
            DCA V2+ <span className="text-zinc-600">⚙</span>
          </button>
        ) : swapMode === "market" ? (
          <span className="ml-auto flex items-center gap-1 text-[10px] text-zinc-500">
            Slippage
            {[50, 100, 200].map((bps) => (
              <button
                key={bps}
                type="button"
                onClick={() => {
                  setSlippageBps(bps);
                  setParsedQuote(null);
                  setStoredQuote(null);
                }}
                className={`px-2 py-0.5 rounded ${
                  slippageBps === bps
                    ? "bg-cyan-500/20 text-cyan-300 font-bold"
                    : "text-zinc-600 hover:text-zinc-400"
                }`}
              >
                {bps / 100}%
              </button>
            ))}
          </span>
        ) : (
          <button
            type="button"
            disabled
            className="ml-auto text-[10px] text-zinc-600 px-2 py-1 border border-zinc-800 rounded-lg"
            title="Coming with limit orders"
          >
            Limit V2+
          </button>
        )}
      </div>

      {swapMode === "recurring" ? (
        <SwapRecurringPanel
          inputSymbol={inputSymbol}
          outputSymbol={outputSymbol}
          amount={amount}
          onAmountChange={setAmount}
          payBalance={payBalance}
          receiveBalance={receiveBalance}
          onPayFraction={setPayFraction}
          onInputSymbolChange={(s) => {
            setInputSymbol(s);
            setAmount("");
          }}
          onOutputSymbolChange={(s) => setOutputSymbol(s)}
          inputOptions={TRADE_SWAP_TOKENS.map((t) => t.symbol)}
          outputOptions={outputOptions.map((t) => t.symbol)}
          frequency={dcaFrequency}
          onFrequencyChange={setDcaFrequency}
          suborders={dcaSuborders}
          onSubordersChange={setDcaSuborders}
          prices={prices}
          onOpenSettings={() => setRecurringSettingsOpen(true)}
          onOpenWarnings={setWarningModalSymbol}
        />
      ) : swapMode === "limit" ? (
        <div className="rounded-2xl border border-zinc-800 bg-[#12121a] p-6 text-center space-y-3">
          <p className="text-sm font-bold text-white">Limit orders</p>
          <p className="text-xs text-zinc-500 leading-relaxed max-w-sm mx-auto">
            Buy or sell when price crosses your trigger — same flow as jup.ag Limit (vault + expiry). Not wired on
            trade.aiglitch.app yet.
          </p>
          <a
            href="https://jup.ag/swap"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block text-xs text-cyan-500 hover:underline"
          >
            Place limits on jup.ag →
          </a>
        </div>
      ) : (
      <div className="rounded-2xl border border-zinc-800 bg-[#12121a] overflow-hidden">
        <SwapSide
          label="Sell"
          symbol={inputSymbol}
          balance={payBalance}
          onSymbolChange={(s) => {
            setInputSymbol(s);
            setAmount("");
            setParsedQuote(null);
            setStoredQuote(null);
          }}
          symbolOptions={TRADE_SWAP_TOKENS.map((t) => t.symbol)}
          amount={amount}
          onAmountChange={setAmount}
          usdHint={fmtUsd(usdValue(Number(amount) || 0, inputSymbol, prices))}
          editable
          pills={
            <>
              <Pill label="HALF" disabled={payBalance <= 0} onClick={() => setPayFraction(0.5)} />
              <Pill label="MAX" disabled={payBalance <= 0} onClick={() => setPayFraction(1)} />
            </>
          }
          warningSlot={
            <TokenWarningsBadge symbol={inputSymbol} onOpen={() => setWarningModalSymbol(inputSymbol)} />
          }
        />

        <div className="relative h-0">
          <button
            type="button"
            onClick={flip}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-9 h-9 rounded-full border border-zinc-700 bg-zinc-900 text-zinc-300 hover:border-cyan-500/50 hover:text-cyan-300 z-10"
            aria-label="Flip tokens"
          >
            ↕
          </button>
        </div>

        <SwapSide
          label="Buy"
          symbol={outputSymbol}
          balance={receiveBalance}
          onSymbolChange={(s) => {
            setOutputSymbol(s);
            setParsedQuote(null);
            setStoredQuote(null);
          }}
          symbolOptions={outputOptions.map((t) => t.symbol)}
          amount={
            quoteBusy
              ? "…"
              : parsedQuote
                ? formatSwapAmount(parsedQuote.outHuman, outputToken.decimals) || "0"
                : "0"
          }
          usdHint={
            parsedQuote
              ? fmtUsd(usdValue(parsedQuote.outHuman, outputSymbol, prices))
              : null
          }
          subHint={
            parsedQuote?.priceImpactPct != null
              ? `${parsedQuote.priceImpactPct >= 0 ? "" : ""}${parsedQuote.priceImpactPct.toFixed(2)}% impact`
              : null
          }
          editable={false}
          warningSlot={
            <TokenWarningsBadge symbol={outputSymbol} onOpen={() => setWarningModalSymbol(outputSymbol)} />
          }
        />

        <div className="p-4 pt-2 space-y-3">
          {parsedQuote && !quoteBusy ? (
            <PreSwapReview
              parsed={parsedQuote}
              maxPrioritySol={maxPrioritySol}
              outputSymbol={outputSymbol}
              networkFeeUsd={
                prices.SOL != null
                  ? fmtUsd((estimateNetworkFeeSol(maxPrioritySol).sol * prices.SOL) as number)
                  : null
              }
              onRouteClick={() => setRoutingOpen(true)}
            />
          ) : (
            <IdleSwapFeePanel
              maxPrioritySol={maxPrioritySol}
              slippageBps={slippageBps}
              networkFeeUsd={
                prices.SOL != null
                  ? fmtUsd((estimateNetworkFeeSol(maxPrioritySol).sol * prices.SOL) as number)
                  : null
              }
            />
          )}

          {quoteError && <p className="text-xs text-red-400/90 text-center">{quoteError}</p>}

          <button
            type="button"
            disabled={busy || quoteBusy || !parsedQuote || !hasAmount}
            onClick={runSwap}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 text-white font-bold text-sm disabled:opacity-45 disabled:cursor-not-allowed"
          >
            {ctaLabel}
          </button>
          {status && <p className="text-xs text-zinc-400 break-all text-center">{status}</p>}
        </div>
      </div>
      )}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setShowChart((v) => !v)}
          className={`flex-1 py-2 rounded-xl border text-xs font-medium transition-colors ${
            showChart
              ? "border-cyan-500/40 bg-cyan-500/10 text-cyan-300"
              : "border-zinc-800 text-zinc-400 hover:border-zinc-600"
          }`}
        >
          {showChart ? "Hide chart" : "Show chart"}
        </button>
        <button
          type="button"
          onClick={() => setShowHistory((v) => !v)}
          className={`flex-1 py-2 rounded-xl border text-xs font-medium transition-colors ${
            showHistory
              ? "border-cyan-500/40 bg-cyan-500/10 text-cyan-300"
              : "border-zinc-800 text-zinc-400 hover:border-zinc-600"
          }`}
        >
          {showHistory ? "Hide history" : "Show history"}
        </button>
      </div>

      {showHistory && <SwapHistoryPanelKeyed refreshKey={historyRefreshKey} />}

      <div className="grid grid-cols-2 gap-2">
        <TokenHintCard symbol={inputSymbol} />
        <TokenHintCard symbol={outputSymbol} />
      </div>

      <p className="text-[10px] text-zinc-600 text-center">
        Routed via Jupiter · base Solana fee ~0.000005 SOL · §GLITCH OTC on{" "}
        <a href="https://aiglitch.app/exchange" className="text-purple-400 hover:underline">
          aiglitch.app/exchange
        </a>
      </p>
    </>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-3 px-1">
      <TokenWarningsModal
        symbol={warningModalSymbol ?? ""}
        open={warningModalSymbol != null}
        onClose={() => setWarningModalSymbol(null)}
      />
      <SwapRoutingModal
        open={routingOpen}
        onClose={() => setRoutingOpen(false)}
        sellSymbol={inputSymbol}
        buySymbol={outputSymbol}
        sellAmount={amount || "0"}
        buyAmount={
          parsedQuote
            ? formatSwapAmount(parsedQuote.outHuman, outputToken.decimals)
            : "0"
        }
        steps={parsedQuote?.routeSteps ?? []}
      />
      <RecurringOrderSettingsModal
        open={recurringSettingsOpen}
        onClose={() => setRecurringSettingsOpen(false)}
      />
      {showChart ? (
        <div className="grid gap-4 lg:grid-cols-[1fr_min(420px,100%)] lg:items-start">
          <SwapChartPanel sellSymbol={inputSymbol} buySymbol={outputSymbol} />
          <div className="space-y-3">{swapColumn}</div>
        </div>
      ) : (
        <div className="max-w-lg mx-auto space-y-3">{swapColumn}</div>
      )}
    </div>
  );
}

function SwapSide({
  label,
  symbol,
  balance,
  onSymbolChange,
  symbolOptions,
  amount,
  onAmountChange,
  editable,
  pills,
  usdHint,
  subHint,
  warningSlot,
}: {
  label: string;
  symbol: string;
  balance: number;
  onSymbolChange: (s: string) => void;
  symbolOptions: string[];
  amount: string;
  onAmountChange?: (v: string) => void;
  editable: boolean;
  pills?: ReactNode;
  usdHint?: string | null;
  subHint?: string | null;
  warningSlot?: ReactNode;
}) {
  return (
    <div className="p-4 bg-zinc-900/50 border-b border-zinc-800/80 last:border-b-0">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-zinc-500">{label}</span>
        <div className="flex items-center gap-2">
          {pills}
          <span className="text-[10px] text-zinc-500 font-mono">{fmtBalance(balance, symbol)}</span>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <select
          value={symbol}
          onChange={(e) => onSymbolChange(e.target.value)}
          className="shrink-0 bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2.5 text-sm font-bold text-white"
        >
          {symbolOptions.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <div className="flex-1 min-w-0">
          {warningSlot && <div className="mb-1">{warningSlot}</div>}
          <div className="text-right">
          <input
            type="text"
            inputMode="decimal"
            readOnly={!editable}
            placeholder="0.00"
            value={amount}
            onChange={editable && onAmountChange ? (e) => onAmountChange(e.target.value) : undefined}
            className={`w-full bg-transparent text-right text-2xl font-semibold text-white placeholder:text-zinc-700 focus:outline-none ${
              !editable ? "text-zinc-300" : ""
            }`}
          />
          {(usdHint || subHint) && (
            <p className="text-[10px] text-zinc-500 mt-0.5">
              {[usdHint, subHint].filter(Boolean).join(" · ")}
            </p>
          )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Pill({
  label,
  onClick,
  disabled,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="px-2 py-0.5 rounded text-[10px] font-bold text-zinc-500 hover:text-cyan-300 disabled:opacity-30"
    >
      {label}
    </button>
  );
}

function TokenHintCard({ symbol }: { symbol: string }) {
  const token = TRADE_SWAP_TOKENS.find((t) => t.symbol === symbol);
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-3">
      <p className="text-sm font-bold text-white">{symbol}</p>
      <p className="text-[10px] text-zinc-600 mt-1 font-mono truncate">{token?.mint.slice(0, 8)}…</p>
      <p className="text-[10px] text-zinc-500 mt-2">AIG!itch trade lane · price chart later</p>
    </div>
  );
}

function IdleSwapFeePanel({
  maxPrioritySol,
  slippageBps,
  networkFeeUsd,
}: {
  maxPrioritySol: number;
  slippageBps: number;
  networkFeeUsd: string | null;
}) {
  const net = estimateNetworkFeeSol(maxPrioritySol);
  const networkLabel = networkFeeUsd ? `${networkFeeUsd} (${net.label})` : net.label;
  return (
    <div className="rounded-xl border border-zinc-800/90 bg-zinc-950/30 divide-y divide-zinc-800/80 text-[11px]">
      <ReviewRow label="Network fee (est.)" value={networkLabel} mono />
      <ReviewRow label="Platform fee" value={formatPlatformFee(null)} />
      <ReviewRow label="Max slippage" value={formatPct(slippageBps)} />
      <p className="px-3 py-2 text-[10px] text-zinc-600 text-center">
        Enter an amount for rate, route, and min received
      </p>
    </div>
  );
}

function PreSwapReview({
  parsed,
  maxPrioritySol,
  outputSymbol,
  networkFeeUsd,
  onRouteClick,
}: {
  parsed: ReturnType<typeof parseJupiterQuote>;
  maxPrioritySol: number;
  outputSymbol: string;
  networkFeeUsd?: string | null;
  onRouteClick?: () => void;
}) {
  const net = estimateNetworkFeeSol(maxPrioritySol);
  const networkLabel = networkFeeUsd
    ? `${networkFeeUsd} (${net.label})`
    : net.label;
  const routeValue =
    parsed.routeLine ??
    (parsed.routeSummary ? parsed.routeSummary : "Jupiter");
  return (
    <div className="rounded-xl border border-zinc-800/90 bg-zinc-950/30 divide-y divide-zinc-800/80 text-[11px]">
      {parsed.exchangeRate && (
        <ReviewRow label="Rate" value={parsed.exchangeRate} />
      )}
      <ReviewRow label="Network fee (est.)" value={networkLabel} mono />
      <ReviewRow
        label="Platform fee"
        value={formatPlatformFee(parsed.platformFeeBps)}
      />
      <ReviewRow
        label="Max slippage"
        value={formatPct(parsed.slippageBps)}
      />
      {parsed.priceImpactPct != null && (
        <ReviewRow
          label="Price impact"
          value={`${parsed.priceImpactPct.toFixed(2)}%`}
          warn={parsed.priceImpactPct > 1}
        />
      )}
      <ReviewRow
        label="Min received"
        value={`${parsed.minOutHuman.toLocaleString(undefined, { maximumFractionDigits: 6 })} ${outputSymbol}`}
        mono
      />
      <ReviewRow
        label="Route"
        value={routeValue}
        onClick={parsed.routeSteps.length > 0 ? onRouteClick : undefined}
        actionHint={parsed.routeSteps.length > 0 ? "View" : undefined}
      />
    </div>
  );
}

function ReviewRow({
  label,
  value,
  mono,
  warn,
  onClick,
  actionHint,
}: {
  label: string;
  value: string;
  mono?: boolean;
  warn?: boolean;
  onClick?: () => void;
  actionHint?: string;
}) {
  const valueEl = (
    <span
      className={`text-right ${mono ? "font-mono text-zinc-200" : warn ? "text-amber-400" : "text-zinc-200"} ${
        onClick ? "underline decoration-dotted underline-offset-2 cursor-pointer hover:text-cyan-300" : ""
      }`}
    >
      {value}
      {actionHint ? ` · ${actionHint}` : ""}
    </span>
  );
  return (
    <div className="flex justify-between gap-3 px-3 py-2 text-zinc-400">
      <span>{label}</span>
      {onClick ? (
        <button type="button" onClick={onClick} className="text-inherit">
          {valueEl}
        </button>
      ) : (
        valueEl
      )}
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
