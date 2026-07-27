"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { BudjuTraderStatusSlim } from "@/components/BudjuGateCallout";
import { WalletConnectModal } from "@/components/WalletConnectModal";
import { useTraderWallet } from "@/context/TraderWalletContext";
import { BUDJU_GATE_REQUIRED_DEFAULT, BUDJU_SITE } from "@/lib/budju-brand";
import { JUPITER_API_DOCS_URL, readPerpsRiskAck, writePerpsRiskAck } from "@/lib/jupiter-perps";

export default function PerpsClient() {
  const trader = useTraderWallet();
  const [connectOpen, setConnectOpen] = useState(false);
  const [riskAck, setRiskAck] = useState(false);
  const [ackChecked, setAckChecked] = useState(false);

  const budjuRequired = trader.eligibility?.budju_required ?? BUDJU_GATE_REQUIRED_DEFAULT;
  const budjuBalance = trader.eligibility?.budju_balance ?? 0;
  const walletConnected = !!trader.wallet;
  const registered = walletConnected && trader.eligible && riskAck;

  useEffect(() => {
    setRiskAck(readPerpsRiskAck());
  }, []);

  const confirmRisk = useCallback(() => {
    if (!ackChecked) return;
    writePerpsRiskAck();
    setRiskAck(true);
  }, [ackChecked]);

  return (
    <div className="max-w-5xl mx-auto space-y-5 pb-10">
      <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-4 lg:gap-5 items-start">
        <header className="space-y-2 min-w-0">
          <p className="text-[10px] uppercase tracking-[0.25em] text-red-400/90 font-bold">Phase 7 · High risk</p>
          <h1 className="text-2xl sm:text-3xl font-black text-white">AIG!itch Perps</h1>
          <p className="text-sm text-zinc-400 leading-relaxed">
            Native leverage trading on <strong className="text-zinc-300 font-semibold">trade.aiglitch.app</strong> — same
            Phantom wallet and real on-chain fills as Swap, built in-house like the{" "}
            <a
              href={BUDJU_SITE.dcaBot}
              target="_blank"
              rel="noopener noreferrer"
              className="text-fuchsia-300/90 hover:underline"
            >
              budju.xyz
            </a>{" "}
            bot UX, not a redirect farm to third-party sites.
          </p>
          <p className="text-xs text-zinc-500 leading-relaxed">
            Same <strong className="text-zinc-400 font-semibold">1M $BUDJU</strong> gate as full Jupiter swaps. Perps UI
            ships here when routing + risk controls are ready — this page registers gate-cleared wallets for early access.
          </p>
          <p className="text-[10px] text-zinc-600 leading-relaxed">
            Transparency: live prices, quotes, and swap routes on trade today come from{" "}
            <a
              href={JUPITER_API_DOCS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-500/80 hover:underline"
            >
              Jupiter&apos;s API
            </a>{" "}
            (same as Swap and Markets). Native perps here will use Jupiter infrastructure for routing and market data
            where applicable — you stay on AIG!itch Trade for the UI and wallet flow.
          </p>
        </header>

        <BudjuTraderStatusSlim
          eligible={trader.eligible}
          budjuBalance={budjuBalance}
          budjuRequired={budjuRequired}
          onRefresh={walletConnected ? () => void trader.refresh() : undefined}
          refreshing={trader.loading}
          walletConnected={walletConnected}
          className="lg:sticky lg:top-4"
        />
      </div>

      {!walletConnected ? (
        <section className="rounded-xl border border-zinc-800/90 bg-zinc-950/40 px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-zinc-500">Connect Phantom to check $BUDJU and sign the perps risk acknowledgement.</p>
          <button
            type="button"
            onClick={() => setConnectOpen(true)}
            className="text-[11px] font-bold px-3 py-1.5 rounded-lg border border-cyan-500/40 text-cyan-200 hover:bg-cyan-500/10"
          >
            Connect wallet
          </button>
          <WalletConnectModal open={connectOpen} onClose={() => setConnectOpen(false)} purpose="Perps gate check" />
        </section>
      ) : null}

      {walletConnected && !trader.eligible ? (
        <p className="text-[11px] text-zinc-500">
          Need {budjuRequired.toLocaleString()} $BUDJU in this wallet for perps early access (same as swap unlock).{" "}
          <Link href="/swap?sell=SOL&buy=BUDJU" className="text-fuchsia-300/90 hover:underline">
            Swap for $BUDJU
          </Link>
        </p>
      ) : null}

      {walletConnected && trader.eligible && !riskAck ? (
        <section className="rounded-xl border border-amber-500/25 bg-amber-950/10 p-4 space-y-3 max-w-2xl">
          <h2 className="text-xs font-black text-amber-100 uppercase tracking-wide">Risk acknowledgement</h2>
          <ul className="text-[11px] text-zinc-500 space-y-1.5 list-disc pl-4">
            <li>Leveraged trading can liquidate my collateral — I can lose everything I post as margin.</li>
            <li>This is not investment advice; AIG!itch promotes platform use + entertainment, not guaranteed returns.</li>
            <li>I want early access to AIG!itch-native perps on this domain when they launch.</li>
          </ul>
          <label className="flex items-start gap-2 text-xs text-zinc-300 cursor-pointer">
            <input
              type="checkbox"
              checked={ackChecked}
              onChange={(e) => setAckChecked(e.target.checked)}
              className="mt-0.5 rounded border-zinc-600"
            />
            <span>I accept these risks.</span>
          </label>
          <button
            type="button"
            disabled={!ackChecked}
            onClick={confirmRisk}
            className="text-[11px] font-bold px-3 py-1.5 rounded-lg bg-amber-600/90 text-black disabled:opacity-40 hover:bg-amber-500/90"
          >
            Register for perps early access
          </button>
        </section>
      ) : null}

      {registered ? (
        <section className="rounded-xl border border-emerald-500/25 bg-emerald-950/10 p-4 space-y-2 max-w-2xl">
          <p className="text-sm font-bold text-emerald-100">Registered — native perps UI coming on this site</p>
          <p className="text-xs text-zinc-500 leading-relaxed">
            You cleared the $BUDJU gate and risk ack. We are building the trading surface here (charts, size, leverage
            controls) with real mainnet execution — Jupiter supplies quotes and routing behind the scenes, like Swap
            today.
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            <Link
              href="/swap"
              className="text-[10px] font-bold px-2.5 py-1 rounded-full border border-zinc-700 text-zinc-300 hover:border-cyan-500/40"
            >
              Swap while you wait
            </Link>
            <Link
              href="/markets"
              className="text-[10px] font-bold px-2.5 py-1 rounded-full border border-zinc-700 text-zinc-300 hover:border-cyan-500/40"
            >
              Markets
            </Link>
          </div>
        </section>
      ) : null}

      <div className="flex flex-wrap items-center gap-x-2 gap-y-2 text-[11px] pt-2 border-t border-zinc-800/80">
        <Link href="/markets" className="px-2.5 py-1 rounded-full border border-zinc-700 text-zinc-300 hover:border-cyan-500/40">
          Markets
        </Link>
        <Link href="/earn" className="px-2.5 py-1 rounded-full border border-zinc-700 text-zinc-300 hover:border-amber-500/40">
          Earn
        </Link>
        <Link href="/roadmap" className="px-2.5 py-1 rounded-full border border-zinc-700 text-zinc-300 hover:border-purple-500/40">
          Roadmap
        </Link>
        <p className="text-[9px] leading-snug text-zinc-600 max-w-md lg:ml-2">
          Not financial advice. Leverage can liquidate margin. Entertainment + DeFi — only risk what you can lose.
        </p>
      </div>
    </div>
  );
}
