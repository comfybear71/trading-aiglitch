"use client";

type Kind = "limit" | "recurring";

const COPY: Record<
  Kind,
  { title: string; body: string; jupLabel: string; jupHint: string }
> = {
  limit: {
    title: "Limit orders — v2",
    body: "Set a trigger price and expiry; funds sit in a Jupiter limit vault until filled or cancelled. Market swap is live today — limits need a dedicated integration (not the same as our instant quote/swap routes).",
    jupLabel: "Use limits on jup.ag",
    jupHint: "Same tokens; connect Phantom in-app on phone.",
  },
  recurring: {
    title: "Recurring / DCA — v2",
    body: "Smart DCA needs a one-time vault signature and a scheduler to place sub-swaps over time. We have not shipped vault setup or order management on trade.aiglitch.app yet.",
    jupLabel: "Use Recurring on jup.ag",
    jupHint: "Preview DCA there until v2 lands here.",
  },
};

export function SwapAdvancedComingSoon({ kind }: { kind: Kind }) {
  const c = COPY[kind];
  return (
    <div className="rounded-2xl border border-zinc-800 bg-[#12121a] p-6 text-center space-y-4">
      <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-amber-400/90 border border-amber-500/30 rounded-full px-2.5 py-0.5">
        Coming soon
      </span>
      <p className="text-sm font-bold text-white">{c.title}</p>
      <p className="text-xs text-zinc-500 leading-relaxed max-w-sm mx-auto">{c.body}</p>
      <a
        href="https://jup.ag/swap"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block px-4 py-2 rounded-xl border border-cyan-500/40 text-xs font-bold text-cyan-300 hover:bg-cyan-500/10"
      >
        {c.jupLabel} →
      </a>
      <p className="text-[10px] text-zinc-600">{c.jupHint}</p>
    </div>
  );
}
