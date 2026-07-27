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
  getPhantom,
  truncWallet,
} from "@/lib/phantom";
import { isTradeAdminWallet } from "@/lib/trade-admin";
import {
  clearCrossSiteWalletCookie,
  setCrossSiteWalletCookie,
} from "@/lib/cross-site-wallet";

interface TraderWalletContextValue {
  wallet: string | null;
  trunc: string | null;
  isAdminWallet: boolean;
  eligibility: TradeEligibility | null;
  eligible: boolean;
  loading: boolean;
  error: string | null;
  connect: () => Promise<boolean>;
  linkWallet: (address: string) => Promise<void>;
  disconnect: () => Promise<void>;
  refresh: () => Promise<void>;
}

const TraderWalletContext = createContext<TraderWalletContextValue | null>(null);

async function fetchEligibility(wallet: string): Promise<TradeEligibility> {
  const qs = new URLSearchParams({
    wallet,
    _: String(Date.now()),
  });
  const res = await fetch(`/api/trade/eligibility?${qs.toString()}`, { cache: "no-store" });
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
      const phantomPk = getPhantom()?.publicKey?.toBase58();
      const addr = phantomPk ?? stored;
      if (addr) {
        setWallet(addr);
        localStorage.setItem(TRADER_WALLET_STORAGE_KEY, addr);
        setCrossSiteWalletCookie(addr);
        await refresh(addr);
      }
      if (!cancelled) setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [refresh]);

  const linkWallet = useCallback(
    async (addr: string) => {
      setWallet(addr);
      localStorage.setItem(TRADER_WALLET_STORAGE_KEY, addr);
      setCrossSiteWalletCookie(addr);
      setError(null);
      await refresh(addr);
    },
    [refresh],
  );

  const connect = useCallback(async (): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const addr = await connectPhantom();
      await linkWallet(addr);
      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      return false;
    } finally {
      setLoading(false);
    }
  }, [linkWallet]);

  const disconnect = useCallback(async () => {
    await disconnectPhantom();
    localStorage.removeItem(TRADER_WALLET_STORAGE_KEY);
    clearCrossSiteWalletCookie();
    setWallet(null);
    setEligibility(null);
    setError(null);
  }, []);

  const value = useMemo(
    (): TraderWalletContextValue => ({
      wallet,
      trunc: wallet ? truncWallet(wallet) : null,
      isAdminWallet: isTradeAdminWallet(wallet),
      eligibility,
      eligible: !!eligibility?.eligible,
      loading,
      error,
      connect,
      linkWallet,
      disconnect,
      refresh: async () => refresh(wallet),
    }),
    [wallet, eligibility, loading, error, connect, linkWallet, disconnect, refresh],
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
