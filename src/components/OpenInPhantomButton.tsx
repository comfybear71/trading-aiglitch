"use client";

import { useEffect, useState } from "react";
import { needsPhantomMobileBrowser, openInPhantomBrowser } from "@/lib/phantom-mobile";

type Props = {
  /** Page to open inside Phantom (defaults to current URL). */
  href?: string;
  label?: string;
  className?: string;
};

export function OpenInPhantomButton({
  href,
  label = "Open in Phantom app",
  className = "w-full py-3 rounded-xl bg-[#ab9ff2] text-black font-bold text-sm hover:opacity-90",
}: Props) {
  const [show, setShow] = useState(false);
  useEffect(() => setShow(needsPhantomMobileBrowser()), []);

  if (!show) return null;

  return (
    <button
      type="button"
      onClick={() => openInPhantomBrowser(href)}
      className={className}
    >
      👻 {label}
    </button>
  );
}

export function MobilePhantomHint({ context = "connect" }: { context?: "connect" | "claim" }) {
  const [show, setShow] = useState(false);
  useEffect(() => setShow(needsPhantomMobileBrowser()), []);

  if (!show) return null;

  const text =
    context === "claim"
      ? "Safari and in-app browsers (Telegram, X) cannot use Phantom. Open this page inside the Phantom app, then connect and claim."
      : "On iPhone, tap Open in Phantom — the site loads in Phantom’s browser where your wallet works.";

  return <p className="text-[11px] text-zinc-400 leading-relaxed">{text}</p>;
}
