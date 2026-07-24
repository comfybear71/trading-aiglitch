"use client";

import { TradingShell } from "./trading-shell";
import { TradingSessionProvider } from "@/context/TradingSessionContext";

export function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <TradingSessionProvider>
      <TradingShell>{children}</TradingShell>
    </TradingSessionProvider>
  );
}
