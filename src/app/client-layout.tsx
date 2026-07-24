"use client";

import { TradingShell } from "./trading-shell";

export function ClientLayout({ children }: { children: React.ReactNode }) {
  return <TradingShell>{children}</TradingShell>;
}
