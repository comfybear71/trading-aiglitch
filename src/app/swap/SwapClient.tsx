"use client";

export default function SwapClient() {
  return (
    <div className="max-w-lg mx-auto space-y-4">
      <div className="rounded-2xl border border-cyan-500/25 bg-gray-900/50 p-6 text-center">
        <p className="text-4xl mb-3">{"\u{21C4}"}</p>
        <h1 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
          Swap
        </h1>
        <p className="text-gray-400 text-sm mt-2">
          BUDJU &amp; GLITCH pairs on our venue first. Connect Phantom and pass the BUDJU balance gate to trade (Phase 2).
        </p>
        <button
          type="button"
          disabled
          className="mt-6 w-full py-3 rounded-xl bg-gradient-to-r from-purple-600/40 to-cyan-600/40 text-gray-400 font-bold text-sm cursor-not-allowed"
        >
          Connect wallet — coming soon
        </button>
      </div>
    </div>
  );
}
