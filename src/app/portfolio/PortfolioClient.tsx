"use client";

import { useTraderWallet } from "@/context/TraderWalletContext";

function fmt(n: number, max = 4) {
  return n.toLocaleString(undefined, { maximumFractionDigits: max });
}

export default function PortfolioClient() {
  const trader = useTraderWallet();
  const b = trader.eligibility?.balances;

  if (!trader.wallet) {
    return (
      <div className="max-w-lg mx-auto rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 text-center">
        <p className="text-4xl mb-3">{"\u{1F45B}"}</p>
        <h1 className="text-xl font-black text-white">Portfolio</h1>
        <p className="text-zinc-400 text-sm mt-2">Connect Phantom to see on-chain balances.</p>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto space-y-4">
      <div className="rounded-2xl border border-purple-500/25 bg-purple-950/20 p-5">
        <h1 className="text-xl font-black text-white">Portfolio</h1>
        <p className="text-zinc-400 text-xs mt-1 font-mono truncate">{trader.wallet}</p>
        {!trader.eligible && (
          <p className="text-amber-500/90 text-xs mt-2">
            Visitor tier — swap locked until you hold enough $BUDJU.
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <BalanceCard label="SOL" value={b?.sol ?? 0} accent="cyan" />
        <BalanceCard label="$BUDJU" value={b?.budju ?? 0} accent="fuchsia" />
        <BalanceCard label="§GLITCH" value={b?.glitch ?? 0} accent="purple" />
        <BalanceCard label="USDC" value={b?.usdc ?? 0} accent="zinc" />
      </div>

      {!trader.eligibility?.helius_enabled && (
        <p className="text-[10px] text-amber-600 text-center">
          Balance reader offline — zeros may mean API cannot reach Helius right now.
        </p>
      )}

      <p className="text-[10px] text-zinc-600 text-center">
        Persona bots &amp; treasury ops stay in{" "}
        <a href="/ops" className="text-purple-400 hover:underline">
          Ops
        </a>{" "}
        (admin only).
      </p>
    </div>
  );
}

function BalanceCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent: "cyan" | "fuchsia" | "purple" | "zinc";
}) {
  const border =
    accent === "cyan"
      ? "border-cyan-500/30"
      : accent === "fuchsia"
        ? "border-fuchsia-500/30"
        : accent === "purple"
          ? "border-purple-500/30"
          : "border-zinc-700";
  return (
    <div className={`rounded-xl border ${border} bg-zinc-900/50 p-3`}>
      <p className="text-[10px] text-zinc-500 uppercase">{label}</p>
      <p className="text-lg font-black text-white mt-1">{fmt(value)}</p>
    </div>
  );
}
