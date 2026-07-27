"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { BudjuTraderStatus } from "@/components/BudjuGateCallout";
import { PersonaHostStrip } from "@/components/PersonaHostStrip";
import { WalletConnectModal } from "@/components/WalletConnectModal";
import { useTraderWallet } from "@/context/TraderWalletContext";
import { BUDJU_GATE_REQUIRED_DEFAULT } from "@/lib/budju-brand";
import {
  JUPITER_PERPS_DOCS_URL,
  JUPITER_PERPS_URL,
  readPerpsRiskAck,
  writePerpsRiskAck,
} from "@/lib/jupiter-perps";

export default function PerpsClient() {
  const trader = useTraderWallet();
  const [connectOpen, setConnectOpen] = useState(false);
  const [riskAck, setRiskAck] = useState(false);
  const [ackChecked, setAckChecked] = useState(false);
  const [showEmbed, setShowEmbed] = useState(false);

  const budjuRequired = trader.eligibility?.budju_required ?? BUDJU_GATE_REQUIRED_DEFAULT;
  const budjuBalance = trader.eligibility?.budju_balance ?? 0;
  const walletConnected = !!trader.wallet;
  const gateOpen = walletConnected && trader.eligible && riskAck;

  useEffect(() => {
    setRiskAck(readPerpsRiskAck());
  }, []);

  const confirmRisk = useCallback(() => {
    if (!ackChecked) return;
    writePerpsRiskAck();
    setRiskAck(true);
  }, [ackChecked]);

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-10">
      <header className="space-y-2">
        <p className="text-[10px] uppercase tracking-[0.25em] text-red-400/90 font-bold">Phase 7 · High risk</p>
        <h1 className="text-2xl sm:text-3xl font-black text-white">Jupiter Perps</h1>
        <p className="text-sm text-zinc-400 leading-relaxed max-w-2xl">
          Leveraged positions on Solana via{" "}
          <a href={JUPITER_PERPS_URL} target="_blank" rel="noopener noreferrer" className="text-cyan-400/90 hover:underline">
            Jupiter Perps
          </a>
          . Same <strong className="text-zinc-300 font-semibold">1M $BUDJU</strong> gate as full swaps. We do not run
          a native perps engine on trade.aiglitch.app in v1 — you trade on Jupiter after acknowledging risk.
        </p>
      </header>

      <section className="rounded-2xl border border-red-500/30 bg-red-950/15 p-4 space-y-2">
        <h2 className="text-xs font-black uppercase tracking-wide text-red-200/90">Not financial advice</h2>
        <p className="text-sm text-zinc-400 leading-relaxed">
          Leverage amplifies gains and losses. Positions can be <strong className="text-zinc-300">liquidated</strong>.
          Meme tokens and perps are entertainment + DeFi — not a path to guaranteed profit. Only use funds you can
          afford to lose.
        </p>
      </section>

      <PersonaHostStrip />

      {walletConnected ? (
        <BudjuTraderStatus
          eligible={trader.eligible}
          budjuBalance={budjuBalance}
          budjuRequired={budjuRequired}
          onRefresh={() => void trader.refresh()}
          refreshing={trader.loading}
        />
      ) : null}

      {!walletConnected ? (
        <section className="rounded-2xl border border-zinc-800 bg-zinc-950/50 p-5 space-y-3 text-center">
          <p className="text-sm text-zinc-400">Connect Phantom to check your $BUDJU gate and unlock the risk acknowledgement.</p>
          <button
            type="button"
            onClick={() => setConnectOpen(true)}
            className="px-4 py-2.5 rounded-lg bg-gradient-to-r from-purple-600/85 to-cyan-600/85 text-sm font-bold text-white hover:opacity-95"
          >
            Connect wallet
          </button>
          <WalletConnectModal open={connectOpen} onClose={() => setConnectOpen(false)} purpose="Perps gate check" />
        </section>
      ) : null}

      {walletConnected && !trader.eligible ? (
        <p className="text-[11px] text-zinc-500 text-center">
          Need {budjuRequired.toLocaleString()} $BUDJU in this wallet for perps access (same as Jupiter swap unlock).{" "}
          <Link href="/swap" className="text-fuchsia-300/90 hover:underline">
            Swap / gate info
          </Link>
        </p>
      ) : null}

      {walletConnected && trader.eligible && !riskAck ? (
        <section className="rounded-2xl border border-amber-500/25 bg-amber-950/10 p-5 space-y-4">
          <h2 className="text-sm font-black text-amber-100 uppercase tracking-wide">Risk acknowledgement</h2>
          <ul className="text-xs text-zinc-500 space-y-2 list-disc pl-4">
            <li>I understand leveraged trading can liquidate my collateral.</li>
            <li>I am not relying on AIG!itch for investment advice or guaranteed returns.</li>
            <li>I will use Jupiter Perps on jup.ag; trade.aiglitch.app only links/embeds their UI.</li>
          </ul>
          <label className="flex items-start gap-2 text-sm text-zinc-300 cursor-pointer">
            <input
              type="checkbox"
              checked={ackChecked}
              onChange={(e) => setAckChecked(e.target.checked)}
              className="mt-1 rounded border-zinc-600"
            />
            <span>I accept these risks and want to continue.</span>
          </label>
          <button
            type="button"
            disabled={!ackChecked}
            onClick={confirmRisk}
            className="w-full sm:w-auto px-4 py-2.5 rounded-lg bg-amber-600/90 text-sm font-bold text-black disabled:opacity-40 hover:bg-amber-500/90"
          >
            Continue to Jupiter Perps
          </button>
        </section>
      ) : null}

      {gateOpen ? (
        <section className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <a
              href={JUPITER_PERPS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 rounded-lg bg-gradient-to-r from-red-600/85 to-orange-600/85 text-sm font-bold text-white hover:opacity-95"
            >
              Open Jupiter Perps ↗
            </a>
            <button
              type="button"
              onClick={() => setShowEmbed((v) => !v)}
              className="px-4 py-2.5 rounded-lg border border-zinc-700 text-sm font-bold text-zinc-300 hover:border-cyan-500/40"
            >
              {showEmbed ? "Hide embed" : "Try embed"}
            </button>
            <a
              href={JUPITER_PERPS_DOCS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 rounded-lg border border-zinc-700 text-sm font-bold text-zinc-400 hover:text-cyan-300"
            >
              Jupiter docs ↗
            </a>
          </div>
          {showEmbed ? (
            <div className="rounded-xl border border-zinc-800 overflow-hidden bg-black">
              <p className="text-[10px] text-zinc-600 px-3 py-2 border-b border-zinc-800/80">
                If this frame is blank, Jupiter blocked embedding — use Open Jupiter Perps instead.
              </p>
              <iframe
                title="Jupiter Perps"
                src={JUPITER_PERPS_URL}
                className="w-full min-h-[70vh] bg-zinc-950"
                sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-popups-to-escape-sandbox"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          ) : null}
          <p className="text-[11px] text-zinc-600">
            Native perps inside our wallet UI is a later phase if Jupiter integration earns its keep.
          </p>
        </section>
      ) : null}

      <div className="flex flex-wrap gap-2 text-[11px]">
        <Link href="/markets" className="px-3 py-2 rounded-full border border-zinc-700 text-zinc-300 hover:border-cyan-500/40">
          Markets
        </Link>
        <Link href="/earn" className="px-3 py-2 rounded-full border border-zinc-700 text-zinc-300 hover:border-amber-500/40">
          Earn
        </Link>
        <Link href="/roadmap" className="px-3 py-2 rounded-full border border-zinc-700 text-zinc-300 hover:border-purple-500/40">
          Roadmap
        </Link>
      </div>
    </div>
  );
}
