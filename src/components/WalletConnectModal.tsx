"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useTraderWallet } from "@/context/TraderWalletContext";
import { TradeActivityPanel } from "@/components/TradeActivityPanel";
import { HoldingsChips } from "@/components/HoldingsChips";
import { getPhantom } from "@/lib/phantom";
import { isMobileWeb, needsPhantomMobileBrowser, openInPhantomBrowser } from "@/lib/phantom-mobile";
import { MobilePhantomHint } from "@/components/OpenInPhantomButton";
import { balanceForSymbol } from "@/lib/trade-balance";
import { fmtUsd, usdValue, useTradePrices } from "@/lib/use-trade-prices";
import { CopyWalletAddress } from "@/components/CopyWalletAddress";
import { BUDJU_SITE } from "@/lib/budju-brand";
import { BudjuLinkPills } from "@/components/BudjuGateCallout";

type Step = "choose" | "qr";

export function WalletConnectModal({
  open,
  onClose,
  purpose = "Connect to trade",
}: {
  open: boolean;
  onClose: () => void;
  purpose?: string;
}) {
  const trader = useTraderWallet();
  const [step, setStep] = useState<Step>("choose");
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [qrStatus, setQrStatus] = useState<"idle" | "waiting" | "done" | "expired">("idle");
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopPoll = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!open) {
      setStep("choose");
      setQrUrl(null);
      setQrStatus("idle");
      stopPoll();
    }
  }, [open, stopPoll]);

  useEffect(() => () => stopPoll(), [stopPoll]);

  const startQr = async () => {
    setStep("qr");
    setQrStatus("waiting");
    try {
      const res = await fetch("/api/auth/wallet-qr");
      const data = await res.json();
      if (!data.challengeId) throw new Error("Could not start QR session");
      const connectUrl = `${window.location.origin}/auth/connect?c=${data.challengeId}`;
      setQrUrl(
        `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(connectUrl)}&bgcolor=0a0a0f&color=22d3ee`,
      );
      stopPoll();
      pollRef.current = setInterval(async () => {
        try {
          const pollRes = await fetch(`/api/auth/wallet-qr?c=${data.challengeId}`);
          const pollData = await pollRes.json();
          if (pollData.status === "approved" && pollData.wallet) {
            stopPoll();
            setQrStatus("done");
            await trader.linkWallet(pollData.wallet);
            onClose();
          } else if (pollData.status === "expired") {
            stopPoll();
            setQrStatus("expired");
          }
        } catch {
          /* retry poll */
        }
      }, 2500);
    } catch {
      setQrStatus("expired");
    }
  };

  const phantomDetected = typeof window !== "undefined" && !!getPhantom();
  const mobileNeedsPhantom = typeof window !== "undefined" && needsPhantomMobileBrowser();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50" role="presentation">
      <button
        type="button"
        aria-label="Close connect panel"
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className="absolute inset-y-0 right-0 w-full max-w-md border-l border-zinc-800 bg-[#0d0d14] shadow-2xl flex flex-col"
        role="dialog"
        aria-labelledby="wallet-modal-title"
      >
        <div className="flex items-center gap-2 border-b border-zinc-800 px-4 py-4">
          {step === "qr" && (
            <button
              type="button"
              onClick={() => {
                stopPoll();
                setStep("choose");
                setQrUrl(null);
                setQrStatus("idle");
              }}
              className="text-zinc-500 hover:text-white text-lg leading-none"
              aria-label="Back"
            >
              ←
            </button>
          )}
          <h2 id="wallet-modal-title" className="text-base font-bold text-white flex-1">
            Connect
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-zinc-500 hover:text-white text-xl leading-none px-1"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {step === "choose" && (
          <div className="p-4 space-y-4 flex-1 overflow-y-auto">
            <p className="text-xs text-zinc-500">{purpose}</p>
            {mobileNeedsPhantom && (
              <MobilePhantomHint context="connect" />
            )}
            {phantomDetected && (
              <p className="text-[10px] uppercase tracking-wider text-zinc-600 font-semibold">Installed</p>
            )}
            {mobileNeedsPhantom ? (
              <button
                type="button"
                onClick={() => openInPhantomBrowser()}
                className="w-full flex items-center gap-3 rounded-xl border border-[#ab9ff2]/50 bg-[#ab9ff2]/10 px-4 py-3 hover:border-[#ab9ff2] transition-colors text-left"
              >
                <span className="w-10 h-10 rounded-lg bg-[#ab9ff2]/20 flex items-center justify-center text-xl">👻</span>
                <span className="flex-1">
                  <span className="block text-sm font-bold text-white">Open in Phantom app</span>
                  <span className="block text-[10px] text-zinc-500">Required on iPhone / Telegram browser</span>
                </span>
              </button>
            ) : (
            <button
              type="button"
              disabled={trader.loading}
              onClick={async () => {
                const ok = await trader.connect();
                if (ok) onClose();
              }}
              className="w-full flex items-center gap-3 rounded-xl border border-zinc-700 bg-zinc-900/80 px-4 py-3 hover:border-purple-500/50 transition-colors text-left disabled:opacity-50"
            >
              <span className="w-10 h-10 rounded-lg bg-[#ab9ff2]/20 flex items-center justify-center text-xl">👻</span>
              <span className="flex-1">
                <span className="block text-sm font-bold text-white">Phantom</span>
                <span className="block text-[10px] text-zinc-500">Most popular</span>
              </span>
              {phantomDetected && (
                <span className="text-[10px] font-bold text-green-400 bg-green-500/10 px-2 py-0.5 rounded">Detected</span>
              )}
            </button>
            )}
            {!isMobileWeb() && (
            <button
              type="button"
              onClick={startQr}
              className="w-full flex items-center gap-3 rounded-xl border border-zinc-700 bg-zinc-900/80 px-4 py-3 hover:border-cyan-500/50 transition-colors text-left"
            >
              <span className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center text-xl">▦</span>
              <span className="flex-1">
                <span className="block text-sm font-bold text-white">QR code login</span>
                <span className="block text-[10px] text-zinc-500">Scan with phone to sign in on this device</span>
              </span>
            </button>
            )}
            {trader.error && (
              <p className={`text-[11px] text-center ${trader.error.includes("Opening Phantom") ? "text-cyan-400" : "text-red-400"}`}>
                {trader.error}
              </p>
            )}
          </div>
        )}

        {step === "qr" && (
          <div className="p-4 space-y-3 text-center">
            {qrUrl && qrStatus === "waiting" && (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={qrUrl} alt="Scan to connect Phantom" className="mx-auto rounded-lg border border-zinc-800" />
                <p className="text-xs text-zinc-400">Scan with your phone · sign in Phantom</p>
                <p className="text-[10px] text-zinc-600 animate-pulse">Waiting for signature…</p>
              </>
            )}
            {qrStatus === "expired" && (
              <p className="text-sm text-amber-400">Session expired — try again.</p>
            )}
            {qrStatus === "done" && <p className="text-sm text-green-400">Connected!</p>}
          </div>
        )}
      </div>
    </div>
  );
}

export function WalletConnectMenu({
  open,
  onClose,
  onDisconnect,
}: {
  open: boolean;
  onClose: () => void;
  onDisconnect: () => void;
}) {
  const trader = useTraderWallet();
  const [chipFilter, setChipFilter] = useState<string | null>(null);
  const [drawerTab, setDrawerTab] = useState<"wallet" | "activity">("wallet");
  const [activityRefresh, setActivityRefresh] = useState(0);
  const { prices } = useTradePrices(open && !!trader.wallet);

  useEffect(() => {
    if (open && drawerTab === "activity") setActivityRefresh((k) => k + 1);
  }, [open, drawerTab]);
  if (!open || !trader.wallet) return null;

  const b = trader.eligibility?.balances;
  const required = trader.eligibility?.budju_required ?? 1_000_000;
  const budju = balanceForSymbol(trader.eligibility, "BUDJU");

  return (
    <div className="fixed inset-0 z-50" role="presentation">
      <button
        type="button"
        aria-label="Close wallet panel"
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="absolute inset-y-0 right-0 w-full max-w-md border-l border-zinc-800 bg-[#0d0d14] shadow-2xl flex flex-col">
        <div className="px-4 py-4 border-b border-zinc-800 flex items-center justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-xs font-mono text-cyan-300">{trader.trunc}</p>
              <CopyWalletAddress address={trader.wallet} />
              <a
                href={`https://solscan.io/account/${trader.wallet}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] text-zinc-500 hover:text-cyan-400"
              >
                Solscan
              </a>
            </div>
            {b && (
              <p className="text-2xl font-black text-white mt-1">
                {b.sol.toFixed(4)} SOL
                <span className="text-sm font-normal text-zinc-500 ml-2">on-chain</span>
              </p>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => trader.refresh()}
              className="text-zinc-500 hover:text-cyan-400 text-sm"
              aria-label="Refresh balances"
            >
              ↻
            </button>
            <button type="button" onClick={onClose} className="text-zinc-500 hover:text-white text-xl leading-none">
              ×
            </button>
          </div>
        </div>
        <div className="flex border-b border-zinc-800 text-xs">
          <button
            type="button"
            onClick={() => setDrawerTab("wallet")}
            className={`flex-1 py-2.5 text-center font-bold ${
              drawerTab === "wallet" ? "text-white border-b-2 border-cyan-400" : "text-zinc-500"
            }`}
          >
            Wallet
          </button>
          <button
            type="button"
            onClick={() => setDrawerTab("activity")}
            className={`flex-1 py-2.5 text-center font-bold ${
              drawerTab === "activity" ? "text-white border-b-2 border-cyan-400" : "text-zinc-500"
            }`}
          >
            Activity
          </button>
        </div>
        <div className="p-4 space-y-3 flex-1 overflow-y-auto">
          {drawerTab === "activity" ? (
            <TradeActivityPanel
              wallet={trader.wallet}
              compact
              refreshKey={activityRefresh}
              emptyText="Swaps, sends, and magic links appear here."
            />
          ) : (
          <>
          <div className={`rounded-lg border p-3 ${trader.eligible ? "bg-zinc-900/80 border-zinc-800" : "bg-fuchsia-950/25 border-fuchsia-500/35"}`}>
            <div className="flex justify-between text-[10px] uppercase mb-1">
              <span className={trader.eligible ? "text-zinc-500" : "text-fuchsia-300/80"}>Trader access · $BUDJU</span>
              <span className={trader.eligible ? "text-green-400" : "text-fuchsia-300"}>
                {trader.eligible ? "Unlocked" : "Locked"}
              </span>
            </div>
            <p className="text-lg font-bold text-white">{budju.toLocaleString(undefined, { maximumFractionDigits: 3 })} BUDJU</p>
            <p className="text-[10px] text-zinc-500 mt-1">
              {trader.eligible ? (
                <>
                  Swap & Portfolio unlocked ·{" "}
                  <a
                    href={BUDJU_SITE.howToBuy}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-fuchsia-300 hover:text-white underline"
                  >
                    budju.xyz
                  </a>
                </>
              ) : (
                <>Need {required.toLocaleString()} on this wallet</>
              )}
            </p>
            {!trader.eligible && (
              <div className="mt-2">
                <BudjuLinkPills />
              </div>
            )}
            {trader.eligible && (
              <div className="mt-2">
                <BudjuLinkPills showBuyOnSwap={false} />
              </div>
            )}
          </div>
          <p className="text-[10px] uppercase tracking-wider text-zinc-600 font-semibold">Holdings</p>
          <HoldingsChips
            size="sm"
            activeSymbol={chipFilter}
            onSelect={(s) => setChipFilter((prev) => (prev === s ? null : s))}
          />
          {b && (
            <ul className="space-y-2 text-sm">
              {(!chipFilter || chipFilter === "USDC") && (
                <HoldingRow symbol="USDC" amount={b.usdc} decimals={3} usd={usdValue(b.usdc, "USDC", prices)} />
              )}
              {(!chipFilter || chipFilter === "SOL") && (
                <HoldingRow symbol="SOL" amount={b.sol} decimals={4} usd={usdValue(b.sol, "SOL", prices)} />
              )}
              {(!chipFilter || chipFilter === "BUDJU") && (
                <HoldingRow symbol="BUDJU" amount={b.budju} decimals={2} compact usd={usdValue(b.budju, "BUDJU", prices)} />
              )}
              {(!chipFilter || chipFilter === "GLITCH") && (
                <HoldingRow symbol="GLITCH" amount={b.glitch} decimals={0} usd={usdValue(b.glitch, "GLITCH", prices)} />
              )}
            </ul>
          )}
          <div className="grid grid-cols-2 gap-1 pt-2">
            <Link href="/send" onClick={onClose} className="text-center py-2 rounded-lg bg-zinc-800/80 text-[10px] text-zinc-300 hover:bg-lime-500/15">
              Send
            </Link>
            <Link href="/swap" onClick={onClose} className="text-center py-2 rounded-lg bg-zinc-800/80 text-[10px] text-zinc-300 hover:bg-purple-500/20">
              Swap
            </Link>
            <Link href="/portfolio" onClick={onClose} className="text-center py-2 rounded-lg bg-zinc-800/80 text-[10px] text-zinc-300 hover:bg-purple-500/20">
              Portfolio
            </Link>
            <Link href="/nft" onClick={onClose} className="text-center py-2 rounded-lg bg-zinc-800/80 text-[10px] text-zinc-300 hover:bg-purple-500/20">
              NFT
            </Link>
          </div>
          </>
          )}
        </div>
        <button
          type="button"
          onClick={() => {
            onDisconnect();
            onClose();
          }}
          className="py-3 border-t border-zinc-800 text-xs text-zinc-500 hover:text-red-400"
        >
          Disconnect
        </button>
      </div>
    </div>
  );
}

function HoldingRow({
  symbol,
  amount,
  decimals,
  compact,
  usd,
}: {
  symbol: string;
  amount: number;
  decimals: number;
  compact?: boolean;
  usd?: number | null;
}) {
  const display = compact && amount >= 1_000_000
    ? `${(amount / 1_000_000).toFixed(2)}M`
    : amount.toLocaleString(undefined, { maximumFractionDigits: decimals });
  return (
    <li className="flex justify-between items-center py-2 border-b border-zinc-800/80 last:border-0 gap-3">
      <span className="text-zinc-300 font-medium">{symbol}</span>
      <div className="text-right">
        <span className="text-zinc-400 font-mono text-xs block">
          {display} {symbol}
        </span>
        {usd != null && Number.isFinite(usd) && (
          <span className="text-[10px] text-zinc-500">{fmtUsd(usd)}</span>
        )}
      </div>
    </li>
  );
}

export function WalletConnectButton() {
  const trader = useTraderWallet();
  const [modalOpen, setModalOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  if (trader.wallet) {
    return (
      <>
        <div className="inline-flex items-center rounded-xl border border-zinc-700 bg-zinc-900/80 overflow-hidden">
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium hover:bg-zinc-800/80 transition-colors"
          >
            <span className="w-2 h-2 rounded-full bg-green-400" />
            <span className="font-mono text-cyan-200 text-xs">{trader.trunc}</span>
          </button>
          <CopyWalletAddress address={trader.wallet} className="border-0 rounded-none mr-2" />
        </div>
        <WalletConnectMenu
          open={menuOpen}
          onClose={() => setMenuOpen(false)}
          onDisconnect={() => trader.disconnect()}
        />
      </>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setModalOpen(true)}
        disabled={trader.loading}
        className="inline-flex items-center gap-2 rounded-xl border border-cyan-500/30 bg-gradient-to-r from-purple-600/25 to-cyan-600/25 px-4 py-2 text-sm font-semibold text-cyan-100 hover:border-cyan-400/50 disabled:opacity-50"
      >
        <span aria-hidden>👛</span> Connect
      </button>
      <WalletConnectModal open={modalOpen} onClose={() => setModalOpen(false)} purpose="Connect to swap & portfolio" />
    </>
  );
}
