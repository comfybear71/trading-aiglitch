"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useTraderWallet } from "@/context/TraderWalletContext";
import TradingPageClient from "../trading/TradingPageClient";

export default function OpsEntry() {
  const trader = useTraderWallet();
  const [passwordAdmin, setPasswordAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    fetch("/api/auth/admin", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => setPasswordAdmin(!!d.authenticated))
      .catch(() => setPasswordAdmin(false));
  }, []);

  if (passwordAdmin === null || trader.loading) {
    return (
      <div className="text-center py-20 text-zinc-500 text-sm">Loading Ops…</div>
    );
  }

  if (passwordAdmin || trader.isAdminWallet) {
    return <TradingPageClient />;
  }

  return (
    <div className="max-w-md mx-auto text-center py-16 space-y-4">
      <p className="text-4xl">🔐</p>
      <h1 className="text-lg font-bold text-white">Ops is admin-only</h1>
      <p className="text-zinc-400 text-sm">
        Connect the BUDJU admin Phantom wallet in the sidebar, or use password login on a backup device.
      </p>
      <Link href="/login?next=/ops" className="text-xs text-zinc-600 hover:text-purple-400">
        Password login (backup)
      </Link>
    </div>
  );
}
