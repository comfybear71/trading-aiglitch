"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useTraderWallet } from "@/context/TraderWalletContext";

export type TradeToastTone = "success" | "error" | "neutral" | "info";

type ToastItem = { id: number; message: string; tone: TradeToastTone; href?: string };

interface TradeToastContextValue {
  pushToast: (message: string, tone?: TradeToastTone, href?: string) => void;
}

const TradeToastContext = createContext<TradeToastContextValue | null>(null);

export function TradeToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const idRef = useRef(0);
  const { wallet, trunc, loading } = useTraderWallet();
  const hydrated = useRef(false);
  const prevWallet = useRef<string | null>(null);

  const pushToast = useCallback((message: string, tone: TradeToastTone = "info", href?: string) => {
    const id = ++idRef.current;
    setToasts((t) => [...t, { id, message, tone, href }]);
    window.setTimeout(() => {
      setToasts((t) => t.filter((x) => x.id !== id));
    }, 5500);
  }, []);

  useEffect(() => {
    if (loading) return;
    if (!hydrated.current) {
      hydrated.current = true;
      prevWallet.current = wallet;
      return;
    }
    if (wallet && !prevWallet.current) {
      pushToast(`Wallet connected · ${trunc ?? wallet.slice(0, 4)}…`, "success");
    } else if (!wallet && prevWallet.current) {
      pushToast("Wallet disconnected", "neutral");
    }
    prevWallet.current = wallet;
  }, [wallet, trunc, loading, pushToast]);

  return (
    <TradeToastContext.Provider value={{ pushToast }}>
      {children}
      {toasts.length > 0 && (
        <div
          className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm pointer-events-none"
          aria-live="polite"
        >
          {toasts.map((t) => {
            const toneClass =
              t.tone === "success"
                ? "border-green-500/40 bg-green-950/90 text-green-100"
                : t.tone === "error"
                  ? "border-red-500/40 bg-red-950/90 text-red-100"
                  : t.tone === "neutral"
                    ? "border-zinc-600/50 bg-zinc-900/95 text-zinc-300"
                    : "border-cyan-500/30 bg-zinc-900/95 text-cyan-100";
            const inner = (
              <div
                className={`pointer-events-auto rounded-xl border px-4 py-3 shadow-lg backdrop-blur-md text-sm font-medium ${toneClass}`}
              >
                {t.message}
                {t.href && (
                  <a
                    href={t.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-[11px] mt-1 underline opacity-90"
                  >
                    View on Solscan
                  </a>
                )}
              </div>
            );
            return <div key={t.id}>{inner}</div>;
          })}
        </div>
      )}
    </TradeToastContext.Provider>
  );
}

export function useTradeToast() {
  const ctx = useContext(TradeToastContext);
  if (!ctx) throw new Error("useTradeToast must be used within TradeToastProvider");
  return ctx;
}
