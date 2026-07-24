"use client";

import { TradingShell } from "./trading-shell";
import { TradingSessionProvider } from "@/context/TradingSessionContext";
import { TraderWalletProvider } from "@/context/TraderWalletContext";

export function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <TradingSessionProvider>
      <TraderWalletProvider>
        <TradingShell>{children}</TradingShell>
      </TraderWalletProvider>
    </TradingSessionProvider>
  );
}
