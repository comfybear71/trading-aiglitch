"use client";

import { useCallback, useState } from "react";

export function CopyWalletAddress({
  address,
  label = "Copy",
  className = "",
}: {
  address: string;
  label?: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard blocked */
    }
  }, [address]);

  return (
    <button
      type="button"
      onClick={() => void copy()}
      className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-md border border-zinc-700 text-zinc-400 hover:text-cyan-300 hover:border-cyan-500/40 transition-colors ${className}`}
      title="Copy full wallet address"
    >
      {copied ? "Copied" : label}
    </button>
  );
}
