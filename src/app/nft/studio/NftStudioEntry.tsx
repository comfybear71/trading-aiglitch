"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useTraderWallet } from "@/context/TraderWalletContext";
import NftStudioClient from "../NftStudioClient";

export default function NftStudioEntry() {
  const trader = useTraderWallet();
  const [passwordAdmin, setPasswordAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    fetch("/api/auth/admin", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => setPasswordAdmin(!!d.authenticated))
      .catch(() => setPasswordAdmin(false));
  }, []);

  if (passwordAdmin === null || trader.loading) {
    return <div className="text-center py-20 text-zinc-500 text-sm">Loading studio…</div>;
  }

  if (passwordAdmin || trader.isAdminWallet) {
    return <NftStudioClient />;
  }

  return (
    <div className="max-w-md mx-auto text-center py-16 space-y-4">
      <p className="text-4xl">🎨</p>
      <h1 className="text-lg font-bold text-white">NFT Studio is admin-only</h1>
      <p className="text-zinc-400 text-sm">Connect the admin Phantom wallet from the sidebar.</p>
      <Link href="/nft" className="text-purple-400 text-sm hover:underline">
        ← Back to gallery
      </Link>
    </div>
  );
}
