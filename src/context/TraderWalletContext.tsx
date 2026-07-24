"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  TRADER_WALLET_STORAGE_KEY,
  type TradeEligibility,
} from "@/lib/trade-tokens";
import {
  connectPhantom,
  disconnectPhantom,
  truncWallet,
} from "@/lib/phantom";

interface TraderWalletContextValue {
  wallet: string | null;
  trunc: string | null;
  eligibility: TradeEligibility | null;
  eligible: boolean;
  loading: boolean;
  error: string | null;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  refresh: () => Promise<void>;
}

const TraderWalletContext = createContext<TraderWalletContextValue | null>(null);

async function fetchEligibility(wallet: string): Promise<TradeEligibility> {
  const res = await fetch(`/api/trade/eligibility?wallet=${encodeURIComponent(wallet)}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Eligibility check failed");
  return data as TradeEligibility;
}

export function TraderWalletProvider({ children }: { children: React.ReactNode }) {
  const [wallet, setWallet] = useState<string | null>(null);
  const [eligibility, setEligibility] = useState<TradeEligibility | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async (addr: string | null) => {
    if (!addr) {
      setEligibility(null);
      return;
    }
    setError(null);
    try {
      const e = await fetchEligibility(addr);
      setEligibility(e);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setEligibility(null);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const stored = localStorage.getItem(TRADER_WALLET_STORAGE_KEY);
      if (stored) {
        setWallet(stored);
        await refresh(stored);
      }
      if (!cancelled) setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [refresh]);

  const connect = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const addr = await connectPhantom();
      setWallet(addr);
      localStorage.setItem(TRADER_WALLET_STORAGE_KEY, addr);
      await refresh(addr);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, [refresh]);

  const disconnect = useCallback(async () => {
    await disconnectPhantom();
    localStorage.removeItem(TRADER_WALLET_STORAGE_KEY);
    setWallet(null);
    setEligibility(null);
    setError(null);
  }, []);

  const value = useMemo(
    (): TraderWalletContextValue => ({
      wallet,
      trunc: wallet ? truncWallet(wallet) : null,
      eligibility,
      eligible: !!eligibility?.eligible,
      loading,
      error,
      connect,
      disconnect,
      refresh: async () => refresh(wallet),
    }),
    [wallet, eligibility, loading, error, connect, disconnect, refresh],
  );

  return (
    <TraderWalletContext.Provider value={value}>{children}</TraderWalletContext.Provider>
  );
}

export function useTraderWallet() {
  const ctx = useContext(TraderWalletContext);
  if (!ctx) throw new Error("useTraderWallet must be used within TraderWalletProvider");
  return ctx;
}
