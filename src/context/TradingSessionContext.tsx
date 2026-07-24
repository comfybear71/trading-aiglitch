"use client";

import { createContext, useContext } from "react";

const TradingSessionContext = createContext({ authenticated: true });

/** Password login is enforced server-side; client views always run authenticated. */
export function TradingSessionProvider({ children }: { children: React.ReactNode }) {
  return (
    <TradingSessionContext.Provider value={{ authenticated: true }}>
      {children}
    </TradingSessionContext.Provider>
  );
}

export function useTradingSession() {
  return useContext(TradingSessionContext);
}
