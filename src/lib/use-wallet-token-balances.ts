"use client";

import { useCallback, useEffect, useState } from "react";
import {
  fetchWalletTokenBalances,
  type WalletTokenBalanceRow,
} from "@/lib/wallet-token-balances";

export function useWalletTokenBalances(wallet: string | null, refreshKey = 0) {
  const [rows, setRows] = useState<WalletTokenBalanceRow[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!wallet) {
      setRows(null);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      setRows(await fetchWalletTokenBalances(wallet));
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setRows(null);
    } finally {
      setLoading(false);
    }
  }, [wallet]);

  useEffect(() => {
    void reload();
  }, [reload, refreshKey]);

  return { rows, loading, error, reload };
}
