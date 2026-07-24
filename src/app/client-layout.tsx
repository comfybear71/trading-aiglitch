"use client";

import { TradingShell } from "./trading-shell";
import { TradingSessionProvider } from "@/context/TradingSessionContext";
import { TraderWalletProvider } from "@/context/TraderWalletContext";
import { TradeToastProvider } from "@/context/TradeToastContext";

export function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <TradingSessionProvider>
      <TraderWalletProvider>
        <TradeToastProvider>
          <TradingShell>{children}</TradingShell>
        </TradeToastProvider>
      </TraderWalletProvider>
    </TradingSessionProvider>
  );
}
