/** Mobile Phantom — universal browse link (no extension in Safari / Telegram / X webviews). */

import { getPhantom } from "@/lib/phantom";

export function isMobileWeb(): boolean {
  if (typeof navigator === "undefined") return false;
  return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
}

export function hasPhantomProvider(): boolean {
  return !!getPhantom();
}

/** True when user needs Phantom app browser (phone/tablet, no injected provider). */
export function needsPhantomMobileBrowser(): boolean {
  return isMobileWeb() && !hasPhantomProvider();
}

/** Phantom docs: opens URL inside Phantom in-app browser with window.solana. */
export function phantomBrowseUrl(pageUrl?: string): string {
  const href =
    pageUrl ?? (typeof window !== "undefined" ? window.location.href : "https://trade.aiglitch.app");
  const encoded = encodeURIComponent(href);
  return `https://phantom.app/ul/browse/${encoded}?ref=trade.aiglitch.app`;
}

export function openInPhantomBrowser(pageUrl?: string): void {
  if (typeof window === "undefined") return;
  window.location.href = phantomBrowseUrl(pageUrl);
}
