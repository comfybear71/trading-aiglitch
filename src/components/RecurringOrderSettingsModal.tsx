"use client";

import { useState } from "react";

type DcaVersion = "v2" | "v1";

export function RecurringOrderSettingsModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [version, setVersion] = useState<DcaVersion>("v2");
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div
        className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl border border-zinc-700 bg-[#12121a] shadow-2xl"
        role="dialog"
        aria-labelledby="recurring-settings-title"
      >
        <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-3">
          <h2 id="recurring-settings-title" className="text-sm font-bold text-white">
            Recurring Order Settings
          </h2>
          <button type="button" onClick={onClose} className="text-zinc-500 hover:text-white text-xl">
            ×
          </button>
        </div>

        <div className="p-4">
          <div className="flex rounded-xl border border-zinc-800 p-1 bg-zinc-950/50">
            <button
              type="button"
              onClick={() => setVersion("v2")}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-colors ${
                version === "v2"
                  ? "bg-zinc-800 text-white"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              V2+
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-lime-500/20 text-lime-400 border border-lime-500/30">
                New
              </span>
            </button>
            <button
              type="button"
              onClick={() => setVersion("v1")}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-colors ${
                version === "v1"
                  ? "bg-zinc-800 text-white"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              V1
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-red-500/15 text-red-400 border border-red-500/25">
                Deprecated
              </span>
            </button>
          </div>

          {version === "v2" ? (
            <div className="mt-5">
              <h3 className="text-base font-bold text-white">Smart DCA</h3>
              <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
                DCA with USD price limits, automatic retries, and full order history
              </p>
              <ul className="mt-4 space-y-4">
                <Feature
                  title="Set price limits in USD"
                  body="Only buy when the price is within your range. Set limits in USD — no need to calculate pool rates."
                />
                <Feature
                  title="Token-2022 support"
                  body="Trade Token-2022 assets — not just standard SPL tokens."
                />
                <Feature
                  title="Automatic execution & retries"
                  body="Orders execute reliably in the background. If a fill fails, it retries automatically — no missed buys."
                />
                <Feature
                  title="Full order history"
                  body="See every fill, status update, and transaction as it happens."
                />
                <Feature
                  warn
                  title="One-time wallet signature required"
                  body="Sign once to authorize your DCA vault before placing or viewing orders."
                />
              </ul>
            </div>
          ) : (
            <div className="mt-5 rounded-xl border border-amber-500/30 bg-amber-950/20 p-4">
              <p className="text-sm text-amber-200/90 font-semibold">V1 is deprecated on Jupiter</p>
              <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                When we ship recurring orders on trade.aiglitch.app, we will target Smart DCA (V2+) only — same
                as jup.ag.
              </p>
            </div>
          )}
        </div>

        <div className="border-t border-zinc-800 px-4 py-3">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-zinc-800 text-sm font-bold text-white hover:bg-zinc-700"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

function Feature({
  title,
  body,
  warn,
}: {
  title: string;
  body: string;
  warn?: boolean;
}) {
  return (
    <li className="flex gap-3">
      <span
        className={`shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] mt-0.5 ${
          warn ? "bg-amber-500/20 text-amber-400" : "bg-lime-500/15 text-lime-400"
        }`}
        aria-hidden
      >
        {warn ? "!" : "✓"}
      </span>
      <div>
        <p className="text-xs font-bold text-zinc-200">{title}</p>
        <p className="text-[11px] text-zinc-500 mt-0.5 leading-snug">{body}</p>
      </div>
    </li>
  );
}
